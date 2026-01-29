/* game-embed.js - Optimized for FPS & UI Flow */
(function () {
  window.createBreakRun = function createBreakRun({
    canvas,
    getTheme
  }) {
    if (!canvas) throw new Error("createBreakRun: canvas is required");
    const ctx = canvas.getContext("2d");

    // -----------------------------
    // Config
    // -----------------------------
    const BOSS_TIME = 180;
    const GRAVITY = 2000;
    const JUMP_FORCE = 740;
    const DOUBLE_JUMP_FORCE = 650;
    
    // NEW: Timing constants for smooth FPS
    const TICKS_PER_SECOND = 60;
    const SKIP_TICKS = 1000 / TICKS_PER_SECOND;
    const MAX_FRAMESKIP = 5;

    // -----------------------------
    // Utils
    // -----------------------------
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const randRange = (min, max) => Math.random() * (max - min) + min;

    function aabb(ax, ay, aw, ah, bx, by, bw, bh, margin = 0) {
      return (
        ax + margin < bx + bw - margin &&
        ax + aw - margin > bx + margin &&
        ay + margin < by + bh - margin &&
        ay + ah - margin > by + margin
      );
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
      return (typeof getTheme === "function" ? getTheme() : "dark") || "dark";
    }

    // -----------------------------
    // Player
    // -----------------------------
    const player = {
      x: 100,
      y: 0,
      w: 40,
      h: 60,
      vy: 0,
      onGround: true,
      jumpCount: 0,
      maxJumps: 2,
      jumpHolding: false,
      jumpHoldTimer: 0
    };

    function positionPlayer() {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      player.x = Math.round(w * 0.15);
      world.groundY = h - 20;
      player.y = world.groundY - player.h; 
    }

    function fitCanvas() {
      const cssW = canvas.parentElement ? canvas.parentElement.clientWidth : (window.innerWidth - 32);
      const isPhone = window.matchMedia("(max-width: 600px)").matches;
      const aspect = isPhone ? 0.6 : 0.42; 
      const cssH = Math.min(500, Math.round(cssW * aspect));

      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      const h = canvas.height / dpr;
      world.groundY = h - 20;
      
      if (!state.running) positionPlayer();
    }

    // -----------------------------
    // State
    // -----------------------------
    const state = {
      started: false, 
      running: false,
      paused: false,
      gameOver: false,
      overReason: "",
      score: 0,
      combo: 1,
      speed: 300,
      speedBase: 300,
      speedMax: 850,
      spawnTimer: 0,
      spawnEvery: 1.5,
      runTime: 0,
      flowState: false,
      flowTimer: 0,
      kickTimer: 0,
      kickCooldown: 0,
      bossSpawned: false,
      shake: 0,
      alive: true
    };

    const world = { groundY: 300, scrollX: 0 }; 
    const obstacles = [];
    const particles = [];
    const floaters = [];
    const backgroundObjects = [];

    for(let i=0; i<15; i++) {
        backgroundObjects.push({
            x: Math.random() * 2000,
            y: randRange(50, 200),
            w: randRange(40, 100),
            h: randRange(100, 300),
            layer: Math.random() < 0.5 ? 0 : 1
        });
    }

    const enemies = [
      { key: "laundry", label: "Laundry" },
      { key: "emails", label: "Emails" },
      { key: "bills", label: "Bills" },
      { key: "dishes", label: "Dishes" }
    ];

 function resetRun() {
      state.runTime = 0;
      state.score = 0;
      state.combo = 1;
      state.speed = state.speedBase;
      state.paused = false;
      state.gameOver = false;
      state.flowState = false;
      state.kickTimer = 0;
      state.shake = 0;

      obstacles.length = 0;
      particles.length = 0;
      floaters.length = 0;
      
      positionPlayer();
      player.vy = 0;
      player.onGround = true;
      player.jumpCount = 0;
      state.bossSpawned = false;

      const overlay = document.getElementById("gameStartOverlay");
      if (overlay) overlay.classList.remove("hidden");
      
      state.running = false; // Stop physics until Start is clicked
      state.started = false;
    }

    function start() {
      const overlay = document.getElementById("gameStartOverlay");
      
      if (state.gameOver) {
        // If we just lost, reset everything which shows the overlay
        resetRun();
      } else {
        // If the overlay is visible and we click Start, begin the game
        if (overlay) overlay.classList.add("hidden");
        state.started = true;
        state.running = true;
      }
    }

    function spawnParticle(x, y, color, type = "dust") {
      const angle = randRange(0, Math.PI * 2);
      const speed = randRange(20, 100);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed + (type === "spark" ? state.speed * 0.5 : 0),
        vy: Math.sin(angle) * speed - (type === "dust" ? 50 : 0),
        life: 1.0,
        color,
        type,
        size: randRange(2, 5)
      });
    }

    function spawnFloatingText(x, y, text, color) {
      floaters.push({ x, y, text, color, life: 1.0, vy: -40 });
    }

    function spawnThing() {
      const p = clamp(state.runTime / BOSS_TIME, 0, 1);
      if (!state.flowState && Math.random() < 0.15) { 
        const gap = 150 + Math.random() * 240;
        const x = (canvas.clientWidth || 960) + 40 + gap;
        obstacles.push({
          kind: "coffee",
          x: x,
          y: world.groundY - 140, 
          w: 40, h: 40,
          passed: false,
          bobOffset: Math.random() * Math.PI * 2
        });
        return;
      }

      const enemyChance = clamp(0.2 + p * 0.5, 0.2, 0.6);
      const x = canvas.width / (window.devicePixelRatio||1) + 50;

      if (Math.random() < enemyChance) {
        const e = enemies[Math.floor(Math.random() * enemies.length)];
        obstacles.push({
          kind: "enemy",
          label: e.label,
          x,
          y: world.groundY - 50,
          w: 50, h: 50,
          passed: false
        });
      } else {
        obstacles.push({
          kind: "obstacle",
          x,
          y: world.groundY - 40,
          w: 40, h: 40,
          passed: false
        });
      }
    }

    function jump() {
      if (!state.started) { start(); return; }
      if (!state.running || state.gameOver) { start(); return; }

      if (player.onGround || player.jumpCount < player.maxJumps) {
        player.vy = player.jumpCount === 0 ? -JUMP_FORCE : -DOUBLE_JUMP_FORCE;
        player.onGround = false;
        player.jumpCount++;
        player.jumpHolding = true;
        player.jumpHoldTimer = 0;
        for (let i = 0; i < 5; i++) spawnParticle(player.x + player.w/2, player.y + player.h, "#fff", "dust");
      }
    }

    function kick() {
      if (!state.running || state.gameOver) return;
      if (state.kickCooldown > 0) return;
      state.kickTimer = 0.25; 
      state.kickCooldown = 0.4;
      spawnParticle(player.x + player.w + 20, player.y + 30, "#fff", "dust");
    }

    function update(dt) {
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 20);
      state.runTime += dt;
      const baseSpeed = state.speedBase + (state.speedMax - state.speedBase) * clamp(state.runTime / BOSS_TIME, 0, 1);
      state.speed = state.flowState ? baseSpeed * 1.3 : baseSpeed;
      world.scrollX += state.speed * dt;

      backgroundObjects.forEach(bg => {
          const parallaxSpeed = bg.layer === 0 ? state.speed * 0.1 : state.speed * 0.3;
          bg.x -= parallaxSpeed * dt;
          if (bg.x + bg.w < -100) {
              bg.x += 2000;
              bg.h = randRange(100, 300);
          }
      });

      if (!player.onGround) {
        let g = GRAVITY;
        if (player.jumpHolding && player.jumpHoldTimer < 0.2) {
          g *= 0.6;
          player.jumpHoldTimer += dt;
        }
        player.vy += g * dt;
        player.y += player.vy * dt;

        if (player.y >= world.groundY - player.h) {
          player.y = world.groundY - player.h;
          player.vy = 0;
          player.onGround = true;
          player.jumpCount = 0;
          for (let i = 0; i < 3; i++) spawnParticle(player.x + player.w/2, player.y + player.h, "#fff", "dust");
        }
      } else {
        player.y = world.groundY - player.h;
      }

      if (state.flowState) {
        state.flowTimer -= dt;
        if (state.flowTimer <= 0) state.flowState = false;
        if (Math.random() < 0.2) spawnParticle(player.x + Math.random()*player.w, player.y + Math.random()*player.h, "#4fd1c5", "spark");
      }

      if (state.kickTimer > 0) state.kickTimer -= dt;
      if (state.kickCooldown > 0) state.kickCooldown -= dt;

      state.spawnTimer += dt;
      if (state.spawnTimer > state.spawnEvery / (state.flowState ? 1.3 : 1)) {
        spawnThing();
        state.spawnTimer = 0;
        state.spawnEvery = randRange(1.2, 2.5) - (state.runTime/BOSS_TIME)*0.8; 
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= state.speed * dt;
        if (o.kind === "coffee") o.y += Math.sin(world.scrollX * 0.05 + o.bobOffset) * 0.5;

        const pHit = aabb(player.x + 10, player.y + 10, player.w - 20, player.h - 20, o.x, o.y, o.w, o.h, 4);
        const kHit = state.kickTimer > 0 && aabb(player.x + player.w - 10, player.y, 70, player.h, o.x, o.y, o.w, o.h);

        if (pHit || kHit) {
          if (o.kind === "coffee") {
            state.flowState = true;
            state.flowTimer = 5.0;
            state.score += 100;
            spawnFloatingText(player.x, player.y - 20, "FLOW STATE!", "#4fd1c5");
            obstacles.splice(i, 1);
            continue;
          }
          if (o.kind === "enemy") {
             if (kHit || state.flowState) {
                obstacles.splice(i, 1);
                state.score += 50 * state.combo;
                state.combo++;
                state.shake = 5;
                spawnFloatingText(o.x, o.y, "SMASHED!", "#fbbf24");
                for(let p=0; p<8; p++) spawnParticle(o.x+o.w/2, o.y+o.h/2, "#fbbf24", "spark");
                continue;
             } else if (pHit) {
                state.gameOver = true;
                state.overReason = `Let ${o.label} pile up!`;
                state.shake = 10;
             }
          }
          if (o.kind === "obstacle") {
             if (state.flowState) {
                obstacles.splice(i, 1);
                state.score += 10;
                spawnFloatingText(o.x, o.y, "BOOM", "#fff");
                state.shake = 2;
             } else if (pHit || kHit) {
                state.gameOver = true;
                state.overReason = "Tripped! Jump over yellow stuff.";
                state.shake = 10;
             }
          }
        }
        if (o.x + o.w < -100) {
          obstacles.splice(i, 1);
          if (!o.passed) state.score += 10;
        }
      }

      state.score += dt * 10;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2.0; 
        p.vy += 200 * dt;
        if (p.life <= 0) particles.splice(i, 1);
      }
      for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i];
        f.y += f.vy * dt;
        f.life -= dt;
        if (f.life <= 0) floaters.splice(i, 1);
      }
    }

    function draw() {
      const w = canvas.width / (window.devicePixelRatio||1);
      const h = canvas.height / (window.devicePixelRatio||1);
      ctx.clearRect(0,0,w,h);
      const dx = (Math.random() - 0.5) * state.shake;
      const dy = (Math.random() - 0.5) * state.shake;
      ctx.save();
      ctx.translate(dx, dy);

      const isDark = theme() === "dark";
      if (isDark) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#0f172a"); 
        g.addColorStop(1, "#3b0764");
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#bae6fd");
        g.addColorStop(1, "#f0f9ff");
        ctx.fillStyle = g;
      }
      ctx.fillRect(-10, -10, w+20, h+20);

      if (isDark) {
         ctx.fillStyle = "#fff";
         for(let i=0; i<30; i++) {
             const sx = (i * 137) % w;
             const sy = (i * 73) % (h/2);
             ctx.globalAlpha = 0.5 + Math.sin(world.scrollX * 0.01 + i)*0.3;
             ctx.fillRect(sx, sy, 2, 2);
         }
         ctx.globalAlpha = 1.0;
         ctx.fillStyle = "#fef3c7";
         ctx.beginPath(); ctx.arc(w - 50, 50, 30, 0, Math.PI*2); ctx.fill();
      } else {
          ctx.fillStyle = "#fde047";
          ctx.beginPath(); ctx.arc(w - 50, 50, 40, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 0.3;
          ctx.beginPath(); ctx.arc(w - 50, 50, 60, 0, Math.PI*2); ctx.fill();
          ctx.globalAlpha = 1.0;
      }

      backgroundObjects.forEach(bg => {
          ctx.fillStyle = isDark ? (bg.layer === 0 ? "#1e1b4b" : "#312e81") : (bg.layer === 0 ? "#cbd5e1" : "#94a3b8");
          ctx.fillRect(bg.x, world.groundY - bg.h, bg.w, bg.h);
      });

      ctx.fillStyle = isDark ? "#020617" : "#475569";
      ctx.fillRect(0, world.groundY, w, 20);

      const px = player.x;
      const py = player.y;

      if (state.kickTimer > 0.05) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px + 40, py + 30, 30, -0.5, 1.5);
        ctx.stroke();
      }

      if (state.flowState) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#4fd1c5";
        ctx.beginPath(); ctx.arc(px + 20, py + 30, 40, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      ctx.beginPath(); ctx.arc(px + 20, py + 10, 10, 0, Math.PI*2); 
      ctx.fillStyle = isDark ? "#60a5fa" : "#2563eb"; 
      if (state.kickTimer > 0) ctx.fillStyle = "#f472b6";
      ctx.fill();

      ctx.fillStyle = isDark ? "#fff" : "#1e293b"; 
      ctx.fillRect(px + 10, py, 24, 6);
      
      ctx.fillStyle = isDark ? "#60a5fa" : "#2563eb"; 
      if (state.kickTimer > 0) ctx.fillStyle = "#f472b6";
      ctx.fillRect(px + 10, py + 20, 20, 25);
      
      ctx.fillStyle = "#1e293b";
      if (!player.onGround && state.kickTimer > 0) {
         ctx.fillRect(px + 25, py + 40, 25, 8); 
      } else {
         ctx.fillRect(px + 12, py + 45, 6, 15);
         ctx.fillRect(px + 22, py + 45, 6, 15);
      }

      ctx.save();
      ctx.translate(px + 20, py + 65);
      if (!player.onGround) ctx.rotate(-0.2);
      ctx.fillStyle = "#fbbf24";
      roundRect(-25, -5, 50, 8, 4, true);
      ctx.fillStyle = isDark ? "#ef4444" : "#b91c1c";
      ctx.beginPath(); ctx.arc(-15, 5, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(15, 5, 5, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      obstacles.forEach(o => {
        if (o.kind === "coffee") {
          const cx = o.x;
          const cy = o.y;
          ctx.fillStyle = "#fef3c7"; 
          ctx.beginPath();
          ctx.moveTo(cx, cy + 10);
          ctx.lineTo(cx + o.w, cy + 10);
          ctx.lineTo(cx + o.w - 5, cy + o.h);
          ctx.lineTo(cx + 5, cy + o.h);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#d97706"; 
          ctx.fillRect(cx + 4, cy + 18, o.w - 8, 12);
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          roundRect(cx - 2, cy + 5, o.w + 4, 6, 2);
          ctx.fill();
          return;
        }

        if (o.kind === "enemy") {
           ctx.fillStyle = isDark ? "#ef4444" : "#dc2626";
           ctx.beginPath();
           ctx.moveTo(o.x, o.y + o.h);
           ctx.lineTo(o.x + o.w/2, o.y);
           ctx.lineTo(o.x + o.w, o.y + o.h);
           ctx.fill();
           ctx.fillStyle = "#000";
           ctx.fillRect(o.x + 15, o.y + 20, 5, 5);
           ctx.fillRect(o.x + 30, o.y + 20, 5, 5);
           if (o.label) {
             ctx.fillStyle = "#fff";
             ctx.font = "bold 12px sans-serif";
             ctx.fillText(o.label, o.x, o.y - 10);
           }
        } else {
           ctx.fillStyle = isDark ? "#fbbf24" : "#d97706";
           roundRect(o.x, o.y, o.w, o.h, 4, true);
           ctx.fillStyle = "rgba(0,0,0,0.2)";
           ctx.fillRect(o.x + 5, o.y, 10, o.h);
           ctx.fillRect(o.x + 25, o.y, 10, o.h);
        }
      });

      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      
      floaters.forEach(f => {
        ctx.globalAlpha = f.life;
        ctx.fillStyle = f.color;
        ctx.font = "bold 24px sans-serif";
        ctx.strokeStyle = isDark ? "#000" : "#fff";
        ctx.lineWidth = 3;
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1.0;
      });

      ctx.fillStyle = isDark ? "#fff" : "#000";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${Math.floor(state.score)}`, 20, 40);
      
      if (state.flowState) {
         ctx.fillStyle = "#4fd1c5";
         ctx.fillText(`FLOW STATE!`, 20, 70);
      }
      
      if (state.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(state.overReason, w/2, h/2 - 20);
        ctx.font = "20px sans-serif";
        ctx.fillText("Tap to Restart", w/2, h/2 + 30);
      }
      ctx.restore();
    }

    // --- NEW SMOOTH LOOP ---
let lastTime = performance.now();
    const deltaTime = 1 / 60; // Target 60fps logic
    let accumulator = 0;

    function loop(now) {
      if (!state.alive) return;

      // Calculate time since last frame
      let frameTime = (now - lastTime) / 1000;
      if (frameTime > 0.1) frameTime = 0.1; // Cap to prevent massive jumps
      lastTime = now;
      accumulator += frameTime;

      // Run as many physics updates as needed to catch up
      while (accumulator >= deltaTime) {
        if (state.running && !state.gameOver && !state.paused) {
          update(deltaTime);
        }
        accumulator -= deltaTime;
      }

      draw();
      requestAnimationFrame(loop);
    }
    
    fitCanvas();
    requestAnimationFrame(loop);

    function onInput(type) {
      if (type === 'jump') jump();
      if (type === 'kick') kick();
    }

    const startBtn = document.getElementById("startGameBtn");
    if (startBtn) {
      startBtn.onclick = start;
      startBtn.ontouchstart = (e) => { e.preventDefault(); start(); };
    }

    window.addEventListener("keydown", e => {
      if (e.code === "Space" || e.code === "ArrowUp") onInput('jump');
      if (e.code === "KeyK" || e.code === "ArrowDown") onInput('kick');
    });

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      onInput('jump');
    });

    const jumpBtn = document.getElementById("mobileJumpBtn");
    const kickBtn = document.getElementById("mobileKickBtn");
    const jumpHandler = (e) => { e.preventDefault(); onInput('jump'); };
    const kickHandler = (e) => { e.preventDefault(); onInput('kick'); };

    if (jumpBtn) {
      jumpBtn.addEventListener("pointerdown", jumpHandler);
      jumpBtn.addEventListener("touchstart", jumpHandler, {passive: false});
    }
    if (kickBtn) {
      kickBtn.addEventListener("pointerdown", kickHandler);
      kickBtn.addEventListener("touchstart", kickHandler, {passive: false});
    }

    return {
      resize: fitCanvas,
      kick: kick,
      destroy: () => {
        state.alive = false;
        window.removeEventListener("resize", fitCanvas);
      }
    };
  };
})();
