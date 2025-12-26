/* game-embed.js
   Usage:
   gameInstance = window.createBreakRun({
     canvas: document.getElementById("taskSnacksGame"),
     getTheme: () => (document.body.dataset.theme === "dark" ? "dark" : "white"),
     onRequestThemeToggle: () => document.getElementById("themeToggleBtn")?.click()
   });
*/

(function () {
  window.createBreakRun = function createBreakRun({
    canvas,
    getTheme,
    onRequestThemeToggle
  }) {
    if (!canvas) throw new Error("createBreakRun: canvas is required");
    const ctx = canvas.getContext("2d");

    // -----------------------------
    // Config
    // -----------------------------
    const BOSS_TIME = 180; // 3 minutes

    // -----------------------------
    // Utils
    // -----------------------------
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }
    function roundRect(x, y, w, h, r, fill = true, stroke = false) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function theme() {
      const t = (typeof getTheme === "function" ? getTheme() : "dark") || "dark";
      return t.toLowerCase() === "white" ? "white" : "dark";
    }

    // -----------------------------
    // HiDPI resize
    // -----------------------------
    function fitCanvas() {
      const cssW = canvas.clientWidth || 960;
      const cssH = Math.round(cssW * (420 / 960));
      canvas.style.height = cssH + "px";

      // Smooth DPR (avoid shimmer). Cap at 2 for perf.
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fitCanvas();

    // Keep canvas crisp on mobile orientation changes / resize
    window.addEventListener("resize", fitCanvas);

    // -----------------------------
    // State
    // -----------------------------
    const state = {
      running: false,
      paused: false,
      gameOver: false,
      overReason: "",

      // comfort mode optional (manual only)
      comfortMode: false,

      // timers
      sessionTime: 0, // time since modal opened (never resets until destroy)
      runTime: 0,     // time since run started (resets on restart)

      score: 0,
      best: 0,

      level: 1,
      combo: 1,
      comboTimer: 0,

      speedBase: 260,
      speedMax: 780,
      spawnBase: 1.05,
      spawnMin: 0.42,

      speed: 260,
      spawnEvery: 1.05,
      spawnTimer: 0,

      // kick
      kickTimer: 0,
      kickCooldown: 0,

      // boss
      bossSpawned: false,
      bossX: 0,
      bossY: 0,
      bossW: 180,
      bossH: 96,
      bossTimer: 0,

      alive: true
    };

    const world = { groundY: 0, scrollX: 0 };

    const player = {
      x: 150,
      y: 0,
      w: 72,
      h: 68,
      vy: 0,
      onGround: true,
      jumpHold: 0,
      jumpHolding: false
    };

    const obstacles = [];

    const enemies = [
      { key: "laundry", label: "Laundry" },
      { key: "emails", label: "Emails" },
      { key: "bills", label: "Bills" },
      { key: "dishes", label: "Dishes" },
      { key: "cleaning", label: "Cleaning" },
      { key: "calls", label: "Calls" }
    ];
    const pickEnemy = () => enemies[Math.floor(Math.random() * enemies.length)];

    function resetRun() {
      state.runTime = 0;
      state.score = 0;
      state.level = 1;
      state.combo = 1;
      state.comboTimer = 0;

      state.speed = state.speedBase;
      state.spawnEvery = state.spawnBase;
      state.spawnTimer = 0;

      state.paused = false;
      state.gameOver = false;
      state.overReason = "";

      state.kickTimer = 0;
      state.kickCooldown = 0;

      // Do NOT reset session boss timer on restart.
      // If boss already spawned during session, keep it spawned and reposition.
      if (state.bossSpawned) {
        state.bossTimer = 0;
        state.bossW = 180;
        state.bossH = 96;
        state.bossX = (canvas.clientWidth || 960) + 40;
        state.bossY = world.groundY - state.bossH - 2;
      } else {
        state.bossTimer = 0;
      }

      obstacles.length = 0;

      player.vy = 0;
      player.onGround = true;
      player.jumpHold = 0;
      player.jumpHolding = false;
    }

    function start() {
      if (state.running && !state.gameOver) return;
      state.running = true;
      state.paused = false;
      state.gameOver = false;
      state.overReason = "";
    }

    function endRun(reason) {
      state.gameOver = true;
      state.paused = false;
      state.overReason = reason || "You wiped out.";
    }

    // -----------------------------
    // Difficulty ramp (0..BOSS_TIME)
    // -----------------------------
    function applyRamp() {
      const p = clamp(state.runTime / BOSS_TIME, 0, 1);
      const baseSpeed = state.speedBase + (state.speedMax - state.speedBase) * p;

      // Faster feel overall; if comfortMode ever enabled it only slightly reduces motion
      state.speed = (state.comfortMode ? baseSpeed * 0.92 : baseSpeed) * 1.08;

      // Slightly fewer spawns (easier) while keeping speed snappy
      state.spawnEvery = (state.spawnBase - (state.spawnBase - state.spawnMin) * p) * 1.22;

      state.level = 1 + Math.floor(p * 9); // 1..10
    }

    function spawnThing() {
      const p = clamp(state.runTime / BOSS_TIME, 0, 1);
      const enemyChance = clamp(0.14 + p * 0.42, 0.14, 0.56);
      const roll = Math.random();

      const baseGap = 150 + Math.random() * 240;
      const x = (canvas.clientWidth || 960) + 40 + baseGap;

      if (roll < enemyChance) {
        const e = pickEnemy();
        obstacles.push({
          kind: "enemy",
          enemyKey: e.key,
          label: e.label,
          x,
          y: world.groundY - 36,
          w: 74,
          h: 36,
          passed: false
        });
        return;
      }

      const isWhite = theme() === "white";
      const kind = Math.random() < 0.7
        ? (isWhite ? "folder" : "cone")
        : (isWhite ? "meeting" : "rail");

      const w = kind === "cone" ? 22 : kind === "folder" ? 34 : 76;
      const h = kind === "cone" ? 32 : kind === "folder" ? 26 : 18;

      obstacles.push({ kind, x, y: world.groundY - h, w, h, passed: false });
    }

    // -----------------------------
    // Boss
    // -----------------------------
    function spawnBoss() {
      state.bossSpawned = true;
      state.bossTimer = 0;
      state.bossW = 180;
      state.bossH = 96;
      state.bossX = (canvas.clientWidth || 960) + 40;
      state.bossY = world.groundY - state.bossH - 2;
    }

    // -----------------------------
    // Input
    // -----------------------------
    function jumpStart() {
      if (!state.running || state.paused || state.gameOver) return;
      player.jumpHolding = true;
      if (player.onGround) {
        player.vy = -720;
        player.onGround = false;
        player.jumpHold = 0;
        state.comboTimer = 0.9;
      }
    }
    function jumpEnd() {
      player.jumpHolding = false;
    }

    function kick() {
      if (!state.running || state.paused || state.gameOver) return;
      if (state.kickCooldown > 0) return;
      state.kickTimer = 0.18;
      state.kickCooldown = 0.35;
    }

    function onKeyDown(e) {
      const k = (e.key || "").toLowerCase();

      if (e.code === "Space") {
        e.preventDefault();
        if (!state.running) start();
        if (state.gameOver) { resetRun(); start(); }
        else jumpStart();
      }

      if (k === "k" || e.key === "ArrowDown") {
        e.preventDefault();
        kick();
      }

      if (k === "p") {
        if (!state.running || state.gameOver) return;
        state.paused = !state.paused;
      }

      if (k === "r") {
        resetRun();
        start();
      }

      if (k === "t") {
        onRequestThemeToggle?.();
      }
    }

    function onKeyUp(e) {
      if (e.code === "Space") jumpEnd();
    }

    function onPointerDown(e) {
      e.preventDefault();
      if (!state.running) start();
      if (state.gameOver) { resetRun(); start(); }
      else jumpStart();
    }

    function onPointerUp() {
      jumpEnd();
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: false });

    // -----------------------------
    // Drawing
    // -----------------------------
    function drawBackground() {
      const w = canvas.clientWidth || 960;
      const h = canvas.clientHeight || 420;

      if (theme() === "white") {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(1, "rgba(245,246,250,1)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = "rgba(15,23,42,1)";
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(14,16,24,1)");
        g.addColorStop(1, "rgba(6,7,12,1)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = "#fff";
      }

      // grid
      ctx.lineWidth = 1;
      const step = 28;
      const bgScroll = state.comfortMode ? world.scrollX * 0.35 : world.scrollX;

      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + (bgScroll % step), 0);
        ctx.lineTo(x + (bgScroll % step), h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function drawGround() {
      const w = canvas.clientWidth || 960;
      const h = canvas.clientHeight || 420;
      const gy = Math.floor(h * 0.78);
      world.groundY = gy;

      if (theme() === "white") {
        ctx.fillStyle = "rgba(15,23,42,0.03)";
        ctx.fillRect(0, gy, w, h - gy);
        ctx.strokeStyle = "rgba(15,23,42,0.18)";
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillRect(0, gy, w, h - gy);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
      }
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();

      // stripes
      ctx.globalAlpha = theme() === "white" ? 0.10 : 0.22;
      ctx.fillStyle = theme() === "white" ? "rgba(15,23,42,1)" : "rgba(255,255,255,0.55)";
      const stripeW = 34, gap = 56;
      for (let x = -200; x < w + 200; x += stripeW + gap) {
        const sx = x - (world.scrollX % (stripeW + gap));
        ctx.fillRect(sx, gy + 18, stripeW, 5);
      }
      ctx.globalAlpha = 1;
    }

    // Hoodie skater with visible wind motion
    function drawHoodieSkater(px, py) {
      const isWhite = theme() === "white";

      const hoodie = isWhite ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.90)";
      const hoodieShadow = isWhite ? "rgba(15,23,42,0.22)" : "rgba(0,0,0,0.22)";
      const pants = isWhite ? "rgba(15,23,42,0.74)" : "rgba(255,255,255,0.74)";
      const face = isWhite ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.62)";
      const head = isWhite ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.94)";
      const shoe = isWhite ? "rgba(15,23,42,0.70)" : "rgba(0,0,0,0.55)";

      const t = performance.now() / 160;
      const sway = Math.sin(t) * 2.4;
      const flutter = Math.cos(t * 1.7) * 2.0;

      // hood (filled)
      ctx.fillStyle = hoodie;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.ellipse(px + 44 + sway * 0.18, py + 18 + flutter * 0.08, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // head
      ctx.fillStyle = head;
      ctx.beginPath();
      ctx.arc(px + 44 + sway * 0.18, py + 16 + flutter * 0.06, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // hood outline
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = hoodieShadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + 44 + sway * 0.18, py + 18 + flutter * 0.08, 16, Math.PI * 0.10, Math.PI * 1.10);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // torso hoodie
      ctx.fillStyle = hoodie;
      roundRect(px + 30 + sway * 0.22, py + 28 + flutter * 0.12, 28, 22, 12, true, false);

      // hem wave
      ctx.globalAlpha = 0.30;
      ctx.strokeStyle = hoodieShadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 30 + sway * 0.22, py + 49 + flutter * 0.12);
      ctx.quadraticCurveTo(px + 44 + sway * 0.70, py + 53 + flutter * 0.30, px + 58 + sway * 0.22, py + 49 + flutter * 0.12);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // hoodie strings (obvious flutter)
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = hoodieShadow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 41 + sway * 0.20, py + 34 + flutter * 0.04);
      ctx.quadraticCurveTo(px + 36 + sway * 0.65, py + 44 + flutter * 0.60, px + 40 + sway * 0.22 + flutter * 0.9, py + 52 + flutter * 0.12);
      ctx.moveTo(px + 47 + sway * 0.20, py + 34 + flutter * 0.04);
      ctx.quadraticCurveTo(px + 52 + sway * 0.65, py + 44 + flutter * 0.60, px + 50 + sway * 0.22 - flutter * 0.9, py + 52 + flutter * 0.12);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // arms
      ctx.fillStyle = hoodie;
      roundRect(px + 22 + sway * 0.35, py + 32 + flutter * 0.14, 10, 18, 8, true, false);
      roundRect(px + 58 + sway * 0.10, py + 32 - flutter * 0.08, 10, 18, 8, true, false);

      // pants
      ctx.fillStyle = pants;
      roundRect(px + 32 + sway * 0.10, py + 50 + flutter * 0.05, 12, 18, 6, true, false);
      roundRect(px + 46 + sway * 0.08, py + 50 - flutter * 0.05, 12, 18, 6, true, false);

      // shoes
      ctx.fillStyle = shoe;
      roundRect(px + 28 + sway * 0.08, py + 64, 18, 6, 4, true, false);
      roundRect(px + 44 + sway * 0.08, py + 64, 18, 6, 4, true, false);

      // face dots
      ctx.fillStyle = face;
      ctx.beginPath(); ctx.arc(px + 41 + sway * 0.18, py + 16 + flutter * 0.06, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 47 + sway * 0.18, py + 16 + flutter * 0.06, 1.6, 0, Math.PI * 2); ctx.fill();
    }

    // Business rider on battery scooter (white theme)
    function drawBusinessScooter(px, py) {
      const t = performance.now() / 150;
      const sway = Math.sin(t) * 1.6;
      const flutter = Math.cos(t * 1.8) * 1.6;

      const suit = "rgba(15,23,42,0.90)";
      const shirt = "rgba(255,255,255,0.94)";
      const tie = "rgba(255,59,48,0.85)";
      const skin = "rgba(15,23,42,0.92)";
      const shoe = "rgba(15,23,42,0.75)";
      const metal = "rgba(15,23,42,0.70)";

      // scooter deck
      ctx.strokeStyle = metal;
      ctx.fillStyle = "rgba(122,136,255,0.16)";
      ctx.lineWidth = 2;
      roundRect(px + 10, py + 58, 74, 10, 8, true, true);

      // wheels
      ctx.fillStyle = metal;
      ctx.beginPath(); ctx.arc(px + 18, py + 72, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 76, py + 72, 4, 0, Math.PI * 2); ctx.fill();

      // handle stem + bar
      ctx.strokeStyle = metal;
      ctx.beginPath(); ctx.moveTo(px + 70, py + 60); ctx.lineTo(px + 78, py + 32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + 70, py + 32); ctx.lineTo(px + 86, py + 32); ctx.stroke();

      // head
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.arc(px + 46 + sway * 0.15, py + 16 + flutter * 0.05, 10, 0, Math.PI * 2); ctx.fill();

      // torso (shirt)
      ctx.fillStyle = shirt;
      roundRect(px + 34 + sway * 0.08, py + 28 + flutter * 0.05, 24, 20, 10, true, false);

      // tie (wind)
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = tie;
      ctx.beginPath();
      ctx.moveTo(px + 46, py + 34);
      ctx.lineTo(px + 44 + sway * 0.25, py + 40);
      ctx.lineTo(px + 48 + flutter * 0.55, py + 54);
      ctx.lineTo(px + 52 + sway * 0.15, py + 40);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // suit jacket (flutter tails)
      ctx.fillStyle = suit;
      roundRect(px + 30 + sway * 0.10, py + 26 + flutter * 0.05, 32, 26, 12, true, false);

      ctx.globalAlpha = 0.75;
      ctx.fillStyle = suit;
      ctx.beginPath();
      ctx.moveTo(px + 32, py + 50);
      ctx.quadraticCurveTo(px + 40 + sway * 0.8, py + 58 + flutter, px + 38, py + 64);
      ctx.quadraticCurveTo(px + 34, py + 60, px + 32, py + 50);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + 60, py + 50);
      ctx.quadraticCurveTo(px + 54 + sway * 0.8, py + 58 - flutter, px + 56, py + 64);
      ctx.quadraticCurveTo(px + 60, py + 60, px + 60, py + 50);
      ctx.fill();
      ctx.globalAlpha = 1;

      // arms
      ctx.fillStyle = suit;
      roundRect(px + 22 + sway * 0.14, py + 34, 12, 14, 8, true, false);
      roundRect(px + 62 + sway * 0.08, py + 34, 12, 14, 8, true, false);

      // legs
      ctx.fillStyle = suit;
      roundRect(px + 34 + sway * 0.06, py + 50, 12, 18, 6, true, false);
      roundRect(px + 48 + sway * 0.06, py + 50, 12, 18, 6, true, false);

      // shoes
      ctx.fillStyle = shoe;
      roundRect(px + 30 + sway * 0.05, py + 64, 18, 6, 4, true, false);
      roundRect(px + 46 + sway * 0.05, py + 64, 18, 6, 4, true, false);

      // tiny battery icon
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(49,220,255,0.18)";
      roundRect(px + 16, py + 60, 16, 6, 3, true, false);
      ctx.fillStyle = "rgba(49,220,255,0.55)";
      ctx.fillRect(px + 18, py + 62, 10, 2);
      ctx.globalAlpha = 1;
    }

    function drawPlayer() {
      const px = Math.round(player.x);
      const py = Math.round(player.y);
      const isWhite = theme() === "white";

      // shadow
      ctx.globalAlpha = player.onGround ? 0.22 : 0.12;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(px + player.w * 0.55, world.groundY + 12, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // kick pose offset (small nudge)
      const kickOffset = state.kickTimer > 0 ? 5 : 0;

      if (isWhite) {
        // business scooter
        drawBusinessScooter(px + kickOffset, py);
      } else {
        // board deck
        ctx.fillStyle = "rgba(120,140,255,0.92)";
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        roundRect(px + 10, py + player.h - 12, player.w - 10, 12, 10, true, true);

        // wheels
        ctx.fillStyle = "rgba(255,255,255,0.86)";
        ctx.beginPath(); ctx.arc(px + 22, py + player.h + 2, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + player.w - 6, py + player.h + 2, 3.2, 0, Math.PI * 2); ctx.fill();

        drawHoodieSkater(px + kickOffset, py);
      }

      // kick arc indicator (both themes)
      if (state.kickTimer > 0) {
        const ink = isWhite ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.75)";
        ctx.globalAlpha = 0.65;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        const ax = px + player.w + 2;
        const ay = py + player.h - 24;
        ctx.arc(ax, ay, 18, -0.25 * Math.PI, 0.35 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
        function drawEnemyIcon(kind, x, y) {
      const isWhite = theme() === "white";
      const ink = isWhite ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.88)";
      const fill = isWhite ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.12)";

      ctx.strokeStyle = ink;
      ctx.fillStyle = fill;
      ctx.lineWidth = 2;

      const ix = x + 10, iy = y + 8;

      if (kind === "laundry") {
        roundRect(ix, iy + 6, 20, 14, 4, true, true);
        ctx.beginPath(); ctx.arc(ix + 10, iy + 6, 8, Math.PI, 0); ctx.stroke();
      } else if (kind === "emails") {
        roundRect(ix, iy + 6, 22, 14, 3, true, true);
        ctx.beginPath();
        ctx.moveTo(ix, iy + 8);
        ctx.lineTo(ix + 11, iy + 15);
        ctx.lineTo(ix + 22, iy + 8);
        ctx.stroke();
      } else if (kind === "bills") {
        roundRect(ix + 2, iy + 4, 18, 18, 3, true, true);
        ctx.beginPath(); ctx.arc(ix + 11, iy + 13, 4, 0, Math.PI * 2); ctx.stroke();
      } else if (kind === "dishes") {
        ctx.beginPath(); ctx.arc(ix + 12, iy + 13, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ix + 12, iy + 13, 4, 0, Math.PI * 2); ctx.stroke();
      } else if (kind === "cleaning") {
        roundRect(ix + 6, iy + 8, 12, 14, 4, true, true);
        roundRect(ix + 8, iy + 4, 10, 6, 3, true, true);
        ctx.beginPath(); ctx.moveTo(ix + 18, iy + 7); ctx.lineTo(ix + 24, iy + 7); ctx.stroke();
      } else if (kind === "calls") {
        ctx.beginPath(); ctx.arc(ix + 12, iy + 13, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ix + 12, iy + 13, 6, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
      }
    }

    function drawEnemy(o) {
      const isWhite = theme() === "white";
      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.10)";
      ctx.strokeStyle = isWhite ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.22)";
      ctx.lineWidth = 2;
      roundRect(o.x, o.y, o.w, o.h, 14, true, true);

      drawEnemyIcon(o.enemyKey, o.x, o.y);

      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)";
      ctx.globalAlpha = 0.82;
      ctx.font = "800 12px ui-sans-serif, system-ui";
      ctx.fillText(o.label, o.x + 38, o.y + 22);
      ctx.globalAlpha = 1;
    }

    function drawObstacles() {
      const isWhite = theme() === "white";

      for (const o of obstacles) {
        const ox = Math.round(o.x);
        const oy = Math.round(o.y);

        if (o.kind === "enemy") {
          drawEnemy(o);
          continue;
        }

        if (!isWhite) {
          if (o.kind === "cone") {
            ctx.fillStyle = "rgba(255,216,107,0.90)";
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ox, oy + o.h);
            ctx.lineTo(ox + o.w / 2, oy);
            ctx.lineTo(ox + o.w, oy + o.h);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
          } else if (o.kind === "rail") {
            ctx.fillStyle = "rgba(49,220,255,0.22)";
            ctx.strokeStyle = "rgba(255,255,255,0.28)";
            ctx.lineWidth = 2;
            roundRect(ox, oy, o.w, o.h, 10, true, true);
          }
        } else {
          if (o.kind === "folder") {
            ctx.fillStyle = "rgba(122,136,255,0.14)";
            ctx.strokeStyle = "rgba(15,23,42,0.16)";
            ctx.lineWidth = 2;
            roundRect(ox, oy, o.w, o.h, 10, true, true);
            ctx.fillStyle = "rgba(49,220,255,0.12)";
            roundRect(ox + 6, oy - 7, 16, 9, 4, true, false);
          } else if (o.kind === "meeting") {
            ctx.fillStyle = "rgba(255,216,107,0.18)";
            ctx.strokeStyle = "rgba(15,23,42,0.18)";
            ctx.lineWidth = 2;
            roundRect(ox, oy, o.w, o.h, 10, true, true);
          }
        }
      }
    }

    function drawBoss() {
      const isWhite = theme() === "white";

      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.08)";
      ctx.strokeStyle = isWhite ? "rgba(15,23,42,0.28)" : "rgba(255,255,255,0.24)";
      ctx.lineWidth = 2;
      roundRect(state.bossX, state.bossY, state.bossW, state.bossH, 18, true, true);

      // Flashing police lights (red/blue)
      const flashOn = (Math.floor(performance.now() / 180) % 2) === 0;
      const red = "rgba(255, 59, 48, 0.85)";
      const blue = "rgba(10, 132, 255, 0.85)";

      ctx.globalAlpha = 0.22;
      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.85)";
      roundRect(state.bossX + 14, state.bossY + 10, 44, 16, 8, true, false);
      roundRect(state.bossX + 66, state.bossY + 10, 44, 16, 8, true, false);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = flashOn ? red : "rgba(255,59,48,0.20)";
      roundRect(state.bossX + 18, state.bossY + 12, 36, 12, 7, true, false);
      ctx.fillStyle = flashOn ? "rgba(10,132,255,0.20)" : blue;
      roundRect(state.bossX + 70, state.bossY + 12, 36, 12, 7, true, false);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.16;
      ctx.fillStyle = flashOn ? red : blue;
      roundRect(state.bossX + 10, state.bossY - 6, 120, 10, 8, true, false);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)";
      ctx.font = "900 16px ui-sans-serif, system-ui";
      ctx.fillText("FINAL BOSS", state.bossX + 14, state.bossY + 28);

      ctx.globalAlpha = 0.75;
      ctx.font = "800 12px ui-sans-serif, system-ui";
      ctx.fillText("Procrastination Police", state.bossX + 14, state.bossY + 48);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.70)" : "rgba(255,255,255,0.80)";
      ctx.fillRect(state.bossX + 14, state.bossY + 66, state.bossW - 28, 6);
      ctx.globalAlpha = 1;
    }

    function drawHUD() {
      const isWhite = theme() === "white";
      const w = canvas.clientWidth || 960;
// Mobile HUD: avoid overlapping pills
const small = w < 420;
      const pad = 12;
      const top = 12;

      const remaining = Math.max(0, Math.ceil(BOSS_TIME - state.sessionTime));
      const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
      const ss = String(remaining % 60).padStart(2, "0");
      const timerText = state.bossSpawned ? "BOSS!" : `Boss in ${mm}:${ss}`;

      ctx.globalAlpha = 0.92;
      ctx.fillStyle = isWhite ? "rgba(255,255,255,0.75)" : "rgba(18,20,28,0.65)";
      ctx.strokeStyle = isWhite ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;

      roundRect(pad, top, small ? (w - pad * 2) : 260, 34, 14, true, true);
      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.90)" : "rgba(255,255,255,0.92)";
      ctx.font = "900 13px ui-sans-serif, system-ui";
      ctx.fillText(`Level ${state.level}  •  Score ${Math.floor(state.score)}  •  ${timerText}`, pad + 12, top + 22);

      if (!small) {
        roundRect(w - 180 - pad, top, 180, 34, 14, true, true);
        ctx.font = "900 13px ui-sans-serif, system-ui";
        ctx.fillText(`Tap jump • K/↓ kick`, w - 180 - pad + 12, top + 22);
      }

      ctx.globalAlpha = 1;
    }

    function drawOverlay(topText, bottomText) {
      const w = canvas.clientWidth || 960;
      const h = canvas.clientHeight || 420;
      const isWhite = theme() === "white";

      ctx.globalAlpha = 0.90;
      ctx.fillStyle = isWhite ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      const cw = Math.min(620, w - 40);
      const ch = 190;
      const cx = (w - cw) / 2;
      const cy = (h - ch) / 2;

      ctx.fillStyle = isWhite ? "rgba(255,255,255,0.92)" : "rgba(18,20,28,0.86)";
      ctx.strokeStyle = isWhite ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.14)";
      ctx.lineWidth = 2;
      roundRect(cx, cy, cw, ch, 18, true, true);

      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.92)";
      ctx.font = "900 24px ui-sans-serif, system-ui";
      ctx.fillText(topText, cx + 18, cy + 52);

      ctx.globalAlpha = 0.85;
      ctx.font = "800 14px ui-sans-serif, system-ui";
      ctx.fillText(bottomText, cx + 18, cy + 86);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.86;
      ctx.font = "900 14px ui-sans-serif, system-ui";
      ctx.fillText("Space / Tap to restart", cx + 18, cy + 150);
      ctx.globalAlpha = 1;
    }

    function drawBottomBanner(topText, bottomText) {
      const w = canvas.clientWidth || 960;
      const h = canvas.clientHeight || 420;
      const isWhite = theme() === "white";

      ctx.globalAlpha = isWhite ? 0.14 : 0.22;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.globalAlpha = 1;

      const cw = Math.min(760, w - 28);
      const ch = 118;
      const cx = (w - cw) / 2;
      const cy = h - ch - 18;

      ctx.globalAlpha = 0.96;
      ctx.fillStyle = isWhite ? "rgba(255,255,255,0.92)" : "rgba(18,20,28,0.88)";
      ctx.strokeStyle = isWhite ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      roundRect(cx, cy, cw, ch, 16, true, true);

      ctx.fillStyle = isWhite ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.92)";
      ctx.font = "950 22px ui-sans-serif, system-ui";
      ctx.fillText(topText, cx + 18, cy + 40);

      ctx.globalAlpha = 0.86;
      ctx.font = "800 14px ui-sans-serif, system-ui";
      ctx.fillText(bottomText, cx + 18, cy + 68);
      ctx.globalAlpha = 1;

      ctx.globalAlpha = 0.86;
      ctx.font = "900 13px ui-sans-serif, system-ui";
      ctx.fillText("Space / Tap to restart", cx + 18, cy + 96);
      ctx.globalAlpha = 1;
    }

    // -----------------------------
    // Main loop
    // -----------------------------
    let last = performance.now();
    function frame(now) {
      if (!state.alive) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      tick(dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function tick(dt) {
      drawBackground();
      drawGround();

      // idle
      if (!state.running) {
        world.scrollX += dt * 30;
        player.y = world.groundY - player.h - 10 + Math.sin(performance.now() / 250) * 2;
        drawPlayer();
        drawObstacles();
        drawHUD();
        return;
      }

      // paused
      if (state.paused) {
        drawPlayer();
        drawObstacles();
        drawHUD();
        drawOverlay("Paused", "Press P to resume");
        return;
      }

      // game over
      if (state.gameOver) {
        drawPlayer();
        drawObstacles();
        if (state.bossSpawned) drawBoss();
        drawHUD();

        if ((state.overReason || "").startsWith("Enough procrastination")) {
          drawBottomBanner("Enough procrastination.", "Go back to work.");
        } else {
          drawOverlay("Wiped out", state.overReason || "You hit something.");
        }
        return;
      }

      // timers
      state.sessionTime += dt;
      state.runTime += dt;

      // kick timers always decrement (both themes)
      if (state.kickTimer > 0) state.kickTimer -= dt;
      if (state.kickCooldown > 0) state.kickCooldown -= dt;

      applyRamp();

      const speed = state.speed;
      world.scrollX += dt * speed;

      // physics
      const gravity = 1900;
      if (!player.onGround) {
        if (player.jumpHolding && player.jumpHold < 0.14) {
          player.vy -= 620 * dt;
          player.jumpHold += dt;
        }
        player.vy += gravity * dt;
        player.y += player.vy * dt;

        const groundTop = world.groundY - player.h - 10;
        if (player.y >= groundTop) {
          player.y = groundTop;
          player.vy = 0;
          player.onGround = true;
          player.jumpHold = 0;
        }
      } else {
        player.y = world.groundY - player.h - 10;
      }

      // boss (session-based, does NOT reset on restart)
      if (!state.bossSpawned && state.sessionTime >= BOSS_TIME) spawnBoss();

      // spawn before boss arrives
      if (!state.bossSpawned) {
        state.spawnTimer += dt;
        if (state.spawnTimer >= state.spawnEvery) {
          state.spawnTimer = 0;
          spawnThing();
        }
      }

      // move obstacles
      for (const o of obstacles) o.x -= speed * dt;
      while (obstacles.length && obstacles[0].x + obstacles[0].w < -90) obstacles.shift();

      // hitboxes
      const hitbox = { x: player.x + 18, y: player.y + 18, w: player.w - 28, h: player.h - 26 };
      const kickActive = state.kickTimer > 0;
      const kickbox = { x: player.x + player.w + 4, y: player.y + player.h - 36, w: 34, h: 22 };

      // collisions
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i];

        if (!o.passed && o.x + o.w < player.x) {
          o.passed = true;
          state.score += (10 + state.level * 1.4) * state.combo;
          state.combo = Math.min(12, state.combo + 1);
          state.comboTimer = 0.85;
        }

        // kick breaks enemies only (both themes)
        if (kickActive && o.kind === "enemy") {
          if (aabb(kickbox.x, kickbox.y, kickbox.w, kickbox.h, o.x, o.y, o.w, o.h)) {
            obstacles.splice(i, 1);
            i--;
            state.score += 40 + state.level * 6;
            state.combo = Math.min(14, state.combo + 1);
            state.comboTimer = 0.95;
            continue;
          }
        }

        // hit anything = lose
        if (aabb(hitbox.x, hitbox.y, hitbox.w, hitbox.h, o.x, o.y, o.w, o.h)) {
          endRun(o.kind === "enemy" ? `You hit: ${o.label}` : "You hit an obstacle.");
          break;
        }
      }

      // combo decay
      if (state.comboTimer > 0) state.comboTimer -= dt;
      else state.combo = 1;

      // boss movement + kill
      if (state.bossSpawned) {
        state.bossTimer += dt;

        // Boss approaches slower so you can read the text
        const bossSpeed = 260 + (state.speedMax * 0.15);
        state.bossX -= bossSpeed * dt;

        const bossHit = aabb(
          hitbox.x, hitbox.y, hitbox.w, hitbox.h,
          state.bossX + 10, state.bossY + 10, state.bossW - 20, state.bossH - 20
        );

        // End a bit later (readable)
        if (bossHit || state.bossX < player.x - 10) {
          endRun("Enough procrastination — go back to work.");
        }
      }

      // passive score
      state.score += dt * (1.1 + state.level * 0.30);

      // draw
      drawObstacles();
      drawPlayer();
      if (state.bossSpawned) drawBoss();
      drawHUD();
    }

    // Start in idle
    resetRun();

    // -----------------------------
    // Public API
    // -----------------------------
    return {
      resize() { fitCanvas(); },
      kick() { kick(); },
      start() { start(); },
      setComfortMode(enabled) { state.comfortMode = !!enabled; },
      destroy() {
        state.alive = false;
        window.removeEventListener("resize", fitCanvas);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
      }
    };
  };
})();
