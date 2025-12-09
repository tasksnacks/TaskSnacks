// === REWARDS: fun facts / affirmations / ASCII animals ===
(function () {
  const funFacts = [
    "Sea otters hold hands while sleeping so they don't drift apart.",
    "Cows have best friends and get stressed when separated.",
    "Your brain uses about 20% of your body's energy, even at rest.",
    "Ravens can remember human faces and hold grudges.",
    "Sloths can hold their breath longer than dolphins.",
    "Sharks existed before trees appeared on Earth.",
    "Wombats produce cube-shaped poop to mark territory.",
    "Koalas sleep up to 22 hours a day.",
    "A group of flamingos is called a flamboyance.",
    "Honey never spoils; archaeologists found edible honey in ancient tombs.",
    "Octopuses have three hearts and blue blood.",
    "Bananas are berries, but strawberries are not.",
    "There are more stars in the universe than grains of sand on Earth.",
    "Some turtles can breathe through their butts (cloacal respiration).",
    "A day on Venus is longer than a year on Venus.",
    "Caterpillars completely liquefy inside the cocoon before becoming butterflies.",
    "Rabbits can't vomit.",
    "Your taste buds are replaced about every 2 weeks.",
    "Pigeons can recognize themselves in a mirror.",
    "The Eiffel Tower can be 15 cm taller in the summer due to heat expansion.",
    "Crows can hold grudges against specific humans.",
    "Butterflies taste with their feet.",
    "There’s a species of jellyfish that can technically live forever (Turritopsis dohrnii).",
    "Bees can recognize human faces.",
    "A group of porcupines is called a prickle.",
    "Some frogs can freeze solid in winter and thaw back to life in spring.",
    "Hippos’ sweat acts as natural sunscreen.",
    "Starfish can regenerate lost arms; some can regenerate a whole body from one arm.",
    "Dolphins each have a unique whistle that functions like a name."
  ];

  const affirmations = [
    "You’re doing better than you think.",
    "Tiny progress still counts as progress.",
    "Your future self is grateful for this.",
    "You don’t need to be perfect to be effective.",
    "You turned chaos into movement. That’s huge.",
    "You showed up. That’s the hardest part.",
    "Your brain is allowed to be messy. Your tasks don’t have to be.",
    "You made something real out of mental noise. That’s magic.",
    "You get to be both a work in progress and someone worth celebrating.",
    "Rest is not a reward; it’s part of the process.",
    "You don’t have to do everything, just the next thing.",
    "You are learning how you work best. That’s powerful.",
    "Your pace is your pace. It’s still forward.",
    "You gently proved your brain wrong about ‘I’ll never do this.’",
    "Even if today was messy, you still created momentum.",
    "You are allowed to be proud of small, quiet wins.",
    "You don’t need a perfect system; you just need one step.",
    "You chose action over avoidance. That’s brave.",
    "You are slowly building a future where this feels easier.",
    "You navigated your own brain today. That’s not easy."
  ];

  // Simple ASCII using normal strings + \n
  const asciiAnimals = [
    {
      title: "Tiny cat",
      ascii: " /\\_/\\\n( o.o )\n > ^ <"
    },
    {
      title: "Sleepy snail",
      ascii: "  __\n /o \\_____\n \\__/-=\"=\""
    },
    {
      title: "Little duck",
      ascii: "  _\n<(o )\n (   )\n  \" \""
    },
    {
      title: "Tiny bear",
      ascii: "ʕ•ᴥ•ʔ"
    },
    {
      title: "Cheerful bunny",
      ascii: " (\\_/)\n ( •_•)\n / >🍪"
    },
    {
      title: "Minimal frog",
      ascii: "  @..@\n (____)\n (____)\n  ^^  ^^"
    },
    {
      title: "Tiny owl",
      ascii: "  ,_,\n (O,O)\n (   )\n  \" \""
    },
    {
      title: "Supportive blob",
      ascii: "  _____\n (     )\n ( •_• )\n (_____)"  
    }
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function makeFunFactReward() {
    const fact = pick(funFacts);
    return {
      type: "fact",
      title: "Fun fact",
      body: fact,
      inlineText: `🎉 Fun fact: ${fact}`,
      confetti: true
    };
  }

  function makeAffirmationReward() {
    const text = pick(affirmations);
    return {
      type: "affirmation",
      title: "Nice work",
      body: text,
      inlineText: `✅ ${text}`,
      confetti: true
    };
  }

  function makeAsciiReward() {
    const animal = pick(asciiAnimals);
    return {
      type: "ascii",
      title: animal.title,
      body: "A tiny friend appears to celebrate:",
      ascii: animal.ascii,
      inlineText: `🐾 A tiny ${animal.title.toLowerCase()} came to say: well done.`,
      confetti: Math.random() < 0.6
    };
  }

  function getRandomReward() {
    const pool = [
      makeFunFactReward,
      makeFunFactReward,
      makeAffirmationReward,
      makeAffirmationReward,
      makeAsciiReward
    ];
    const gen = pick(pool);
    return gen();
  }

  // Safe attach
  window.TaskSnacksRewards = window.TaskSnacksRewards || {};
  window.TaskSnacksRewards.getRandomReward = getRandomReward;
})();
// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/";

// Supabase config
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

// Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ---- ANALYTICS (PostHog) ----
const ENABLE_TRACKING = false;
function track(eventName, props = {}) {
  if (!ENABLE_TRACKING) return;
  if (window.posthog && typeof window.posthog.capture === "function") {
    window.posthog.capture(eventName, props);
  }
}

// ---- Preview AI Limit (logged-out users) ----
function getPreviewAICount() {
  return parseInt(localStorage.getItem("ts_preview_ai_count") || "0", 10);
}

function incrementPreviewAICount() {
  const count = getPreviewAICount();
  localStorage.setItem("ts_preview_ai_count", String(count + 1));
}

function previewLimitReached() {
  const count = getPreviewAICount();
  return count >= 3; // change 3 to 2 if you only want 2 free runs
}

// --- Date helper (LOCAL date, fixes 1-day ahead bug) ---
function formatDateLocal(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// === DOM refs ===
const organizeBtn = document.getElementById("organizeBtn");
const brainDump = document.getElementById("brainDump");
const tasksContainer = document.getElementById("tasksContainer");
const funFactContainer = document.getElementById("funFactContainer");
const taskDateInput = document.getElementById("taskDate");
const previewNote = document.getElementById("previewNote");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

const calendarSection = document.getElementById("calendarSection");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const calendarToggleBtn = document.getElementById("calendarToggleBtn");
const calendarTodayLabel = document.getElementById("calendarTodayLabel");

const sortSection = document.getElementById("sortSection");
const sortMode = document.getElementById("sortMode");

const manualAddSection = document.getElementById("manualAddSection");
const manualTaskInput = document.getElementById("manualTaskInput");
const manualAddBtn = document.getElementById("manualAddBtn");

const appContent = document.getElementById("appContent");
const loggedOutInfo = document.getElementById("loggedOutInfo");
const refreshBtn = document.getElementById("refreshBtn");
const tryAIPreviewHint = document.getElementById("tryAIPreviewHint");
const moveUnfinishedBtn = document.getElementById("moveUnfinishedBtn");

// Settings + delete modal
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteCloseBtn = document.getElementById("deleteCloseBtn");
const deleteConfirmInput = document.getElementById("deleteConfirmInput");
const finalDeleteBtn = document.getElementById("finalDeleteBtn");
const goodbyeModal = document.getElementById("goodbyeModal");

// Password reset section
const passwordResetSection = document.getElementById("passwordResetSection");
const newPasswordInput = document.getElementById("newPasswordInput");
const setNewPasswordBtn = document.getElementById("setNewPasswordBtn");

// About modal refs
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const aboutCloseBtn = document.getElementById("aboutCloseBtn");
const aboutBackdrop = document.getElementById("aboutBackdrop");

// === STATE ===
let currentUser = null;
let currentMonthDate = new Date();
let draggedTaskElement = null;
let lastDeletedTask = null;
let undoTimeoutId = null;
let isRecoveryMode = false;
let isPreviewMode = false; // for try-before-login

// === SETTINGS DROPDOWN ===
if (settingsBtn && settingsMenu) {
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (
      !settingsMenu.classList.contains("hidden") &&
      !settingsMenu.contains(e.target) &&
      e.target !== settingsBtn
    ) {
      settingsMenu.classList.add("hidden");
    }
  });
}

// === REWARD DISPLAY (uses rewards.js) ===
function showReward() {
  if (
    !window.TaskSnacksRewards ||
    typeof window.TaskSnacksRewards.getRandomReward !== "function"
  ) {
    console.warn("TaskSnacksRewards missing, using fallback reward.");
    funFactContainer.textContent = "✅ Nice job, task completed!";
    return;
  }

  const reward = window.TaskSnacksRewards.getRandomReward();
  if (!reward) return;

  // inline text under the list
  funFactContainer.textContent =
    reward.inlineText || reward.title || "Nice work!";

  // popup in the middle
  const popup = document.createElement("div");
  popup.className = "fun-fact-popup";

  let inner = `<strong>${reward.title || "Nice job"}</strong><br>`;
  if (reward.body) {
    inner += `${reward.body}<br>`;
  }
  if (reward.ascii) {
    inner += `<pre style="margin-top:8px; font-size:11px; line-height:1.1;">${reward.ascii}</pre>`;
  }
  popup.innerHTML = inner;
  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.classList.add("visible");
  });

  if (window.confetti && reward.confetti !== false) {
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.25 }
    });
  }

  setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => popup.remove(), 200);
  }, 5000);
}

// === UNDO HELPERS ===
function showUndo(task) {
  lastDeletedTask = task;
  const undoBar = document.getElementById("undoBar");
  if (!undoBar) return;

  undoBar.innerHTML = `
    <span>Task deleted</span>
    <button id="undoBtn">Undo</button>
  `;
  undoBar.classList.add("visible");

  if (undoTimeoutId) clearTimeout(undoTimeoutId);
  undoTimeoutId = setTimeout(() => {
    hideUndoBar();
    lastDeletedTask = null;
  }, 5000);

  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) {
    undoBtn.onclick = async () => {
      if (!lastDeletedTask || !currentUser) return;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: lastDeletedTask.user_id,
          task_date: lastDeletedTask.task_date,
          task_text: lastDeletedTask.task_text,
          priority: lastDeletedTask.priority,
          completed: lastDeletedTask.completed,
          sort_index: lastDeletedTask.sort_index ?? 0
        })
        .select()
        .single();

      if (!error && data) {
        renderTaskItem(data);
        await saveTaskOrderToDatabase();
        await renderCalendar();
      }

      hideUndoBar();
      lastDeletedTask = null;
    };
  }
}

function hideUndoBar() {
  const undoBar = document.getElementById("undoBar");
  if (undoBar) undoBar.classList.remove("visible");
}

// === AUTH LOGIC ===
async function checkSession() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session || null;

    if (session) {
      const { data: userData } = await supabase.auth.getUser();
      currentUser = userData?.user || null;
    } else {
      currentUser = null;
    }
  } catch (e) {
    console.error("checkSession error:", e);
    currentUser = null;
  }

  updateAuthUI();

  if (currentUser && !isRecoveryMode) {
    setToday();
    await loadTasksForSelectedDate();
    await renderCalendar();
  }
}

function updateAuthUI() {
  const hasCalendar = !!calendarSection;
  const hasSort = !!sortSection;
  const hasManual = !!manualAddSection;

  if (currentUser) {
    // LOGGED IN
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";

    emailInput.style.display = "none";
    passwordInput.style.display = "none";

    if (loggedOutInfo) loggedOutInfo.style.display = "none";
    if (hasCalendar) calendarSection.style.display = "block";
    if (hasSort) sortSection.style.display = "block";
    if (hasManual) manualAddSection.style.display = "flex";
    organizeBtn.disabled = false;
    if (appContent) appContent.style.display = "block";

    if (tryAIPreviewHint) tryAIPreviewHint.style.display = "none";
    if (previewNote) previewNote.style.display = "none";
  } else {
    // LOGGED OUT
    authStatus.textContent = "Not logged in.";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";

    emailInput.style.display = "inline-block";
    passwordInput.style.display = "inline-block";

    if (loggedOutInfo) loggedOutInfo.style.display = "block";

    if (hasCalendar) calendarSection.style.display = "none";
    if (hasSort) sortSection.style.display = "none";
    if (hasManual) manualAddSection.style.display = "none";

    if (appContent) appContent.style.display = "block";
    organizeBtn.disabled = false;

    if (tryAIPreviewHint) tryAIPreviewHint.style.display = "block";

    tasksContainer.innerHTML = "";
    funFactContainer.textContent = "";
  }

  if (passwordResetSection) {
    passwordResetSection.style.display = isRecoveryMode ? "block" : "none";
  }

  if (settingsMenu) settingsMenu.classList.add("hidden");
}

// === SIGNUP / LOGIN / LOGOUT ===
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://tasksnacks.github.io/TaskSnacks/"
      }
    });

    if (error) {
      console.error("Sign up error:", error);
      return alert("Sign up error: " + error.message);
    }

    track("ts_signup_success");
    alert("Check your email to confirm your account.");
  } catch (e) {
    console.error("Sign up exception:", e);
    alert("Sign up error: " + e.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert("Login error: " + error.message);

  currentUser = data.user;
  isRecoveryMode = false;
  isPreviewMode = false;
  updateAuthUI();
  setToday();
  await loadTasksForSelectedDate();
  await renderCalendar();

  track("ts_login_success");
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  isRecoveryMode = false;
  isPreviewMode = false;
  updateAuthUI();
});

// Refresh button
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    location.reload();
  });
}
// Move unfinished tasks button
if (moveUnfinishedBtn) {
  moveUnfinishedBtn.addEventListener("click", moveUnfinishedToNextDay);
}
// === PASSWORD RESET FLOW ===
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    const confirmChange = confirm(
      "We will send a password reset email to your address. Continue?"
    );
    if (!confirmChange) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        currentUser.email,
        {
          redirectTo: "https://tasksnacks.github.io/TaskSnacks/#recovery=1"
        }
      );

      if (error) {
        console.error("Reset password error:", error);
        alert("Could not send reset email: " + error.message);
        return;
      }

      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error("Reset password exception:", err);
      alert("Something went wrong.");
    } finally {
      if (settingsMenu) settingsMenu.classList.add("hidden");
    }
  });
}

function handleRecoveryFromURL() {
  const hash = window.location.hash || "";

  if (hash.includes("recovery=1")) {
    isRecoveryMode = true;

    if (passwordResetSection) passwordResetSection.style.display = "block";
    if (authStatus) {
      authStatus.textContent =
        "You opened a password reset link. Please set a new password.";
    }

    try {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    } catch {
      // ignore
    }
  } else {
    isRecoveryMode = false;
    if (passwordResetSection) passwordResetSection.style.display = "none";
  }
}

if (setNewPasswordBtn) {
  setNewPasswordBtn.addEventListener("click", async () => {
    const newPass = newPasswordInput.value.trim();
    if (!newPass) {
      alert("Please type a new password.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPass
      });

      if (error) {
        console.error("Update password error:", error);
        alert("Could not update password: " + error.message);
        return;
      }

      alert("Password updated! You can now use it to log in.");
      isRecoveryMode = false;
      if (passwordResetSection) passwordResetSection.style.display = "none";
    } catch (err) {
      console.error("Update password exception:", err);
      alert("Something went wrong.");
    }
  });
}

// === CALENDAR: TODAY LABEL + COLLAPSE ===
function updateTodayLabel() {
  if (!calendarTodayLabel || !taskDateInput) return;
  const val = taskDateInput.value;
  if (!val) {
    calendarTodayLabel.textContent = "Today: –";
    return;
  }
  const d = new Date(val + "T00:00:00");
  const formatted = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  calendarTodayLabel.textContent = `Selected: ${formatted}`;
}

// Collapsed by default
if (calendarToggleBtn && calendarGrid) {
  let isCalendarCollapsed = true;

  calendarGrid.style.display = "none";
  calendarToggleBtn.textContent = "Show calendar";

  calendarToggleBtn.addEventListener("click", () => {
    isCalendarCollapsed = !isCalendarCollapsed;
    if (isCalendarCollapsed) {
      calendarGrid.style.display = "none";
      calendarToggleBtn.textContent = "Show calendar";
    } else {
      calendarGrid.style.display = "grid";
      calendarToggleBtn.textContent = "Hide calendar";
    }
  });
}

// === DATE & CALENDAR HANDLING ===
function setToday() {
  const today = new Date();
  const todayStr = formatDateLocal(today);
  taskDateInput.value = todayStr;
  currentMonthDate = today;
  updateTodayLabel();
}

if (sortMode) {
  sortMode.addEventListener("change", () => {
    if (currentUser) loadTasksForSelectedDate();
    track("ts_sort_mode_changed", { mode: sortMode.value });
  });
}

if (prevMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    renderCalendar();
  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener("click", () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    renderCalendar();
  });
}

async function renderCalendar() {
  if (!currentUser || !calendarGrid) return;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  calendarMonthLabel.textContent = currentMonthDate.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthStart = formatDateLocal(first);
  const last = new Date(year, month + 1, 0);
  const monthEnd = formatDateLocal(last);

  const { data, error } = await supabase
    .from("tasks")
    .select("task_date")
    .eq("user_id", currentUser.id)
    .gte("task_date", monthStart)
    .lte("task_date", monthEnd);

  if (error) {
    console.error("Calendar query error:", error);
  }

  const datesWithTasks = new Set((data || []).map((row) => row.task_date));

  calendarGrid.innerHTML = "";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayNames.forEach((name) => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.textContent = name;
    calendarGrid.appendChild(el);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = formatDateLocal(dateObj);

    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = day;
    cell.dataset.date = dateStr;

    if (datesWithTasks.has(dateStr)) cell.classList.add("has-tasks");
    if (taskDateInput.value === dateStr) cell.classList.add("selected");

    cell.addEventListener("click", () => {
      taskDateInput.value = dateStr;
      updateTodayLabel();
      loadTasksForSelectedDate();
      document
        .querySelectorAll(".cal-day.selected")
        .forEach((el) => el.classList.remove("selected"));
      cell.classList.add("selected");
    });

    calendarGrid.appendChild(cell);
  }
}

// === LOAD TASKS FOR A DATE ===
async function loadTasksForSelectedDate() {
  tasksContainer.innerHTML = "";
  funFactContainer.textContent = "";
  hideUndoBar();

  const date = taskDateInput.value;
  if (!date || !currentUser) return;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("task_date", date)
    .order("sort_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  let tasks = data || [];

  if (sortMode && sortMode.value === "priority") {
    const order = { high: 0, medium: 1, low: 2 };
    tasks.sort(
      (a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
    );
  }

  tasks.forEach((task) => renderTaskItem(task));
}

// === DRAG & DROP CONTAINER HANDLING ===
tasksContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  reorderTasksAtY(e.clientY);
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)")
  ];

  let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

  draggableElements.forEach((child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      closest = { offset, element: child };
    }
  });

  return closest.element;
}

function reorderTasksAtY(y) {
  if (!draggedTaskElement) return;
  const afterElement = getDragAfterElement(tasksContainer, y);
  if (afterElement == null) {
    tasksContainer.appendChild(draggedTaskElement);
  } else {
    tasksContainer.insertBefore(draggedTaskElement, afterElement);
  }
}

async function saveTaskOrderToDatabase() {
  if (!tasksContainer || !currentUser) return;
  const items = [...tasksContainer.querySelectorAll(".task-item")];
  const updates = items.map((item, index) => {
    const id = item.dataset.taskId;
    return supabase.from("tasks").update({ sort_index: index }).eq("id", id);
  });
  try {
    await Promise.all(updates);
    if (sortMode) {
      sortMode.value = "created";
    }
  } catch (e) {
    console.error("Error saving order:", e);
  }
}

// === DELETE WITH ANIMATION & UNDO ===
async function handleDelete(task, div) {
  div.style.opacity = "0";
  div.style.transform = "translateX(20px)";

  setTimeout(async () => {
    if (currentUser && !String(task.id).startsWith("preview-")) {
      await supabase.from("tasks").delete().eq("id", task.id);
      await saveTaskOrderToDatabase();
      await renderCalendar();
      showUndo(task);
    }
    div.remove();
  }, 150);
}

// === Move task to another date ===
function showMoveDateDialog(task) {
  if (!currentUser || String(task.id).startsWith("preview-")) return;

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(15,23,42,0.35)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "80";

  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "16px 18px";
  box.style.borderRadius = "16px";
  box.style.minWidth = "260px";
  box.style.maxWidth = "90%";
  box.style.boxShadow = "0 18px 40px rgba(15,23,42,0.35)";
  box.innerHTML = `
    <div style="font-weight:600; margin-bottom:8px; font-size:15px;">Move task to…</div>
  `;

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = task.task_date || taskDateInput.value;
  dateInput.style.width = "100%";
  dateInput.style.padding = "6px 8px";
  dateInput.style.borderRadius = "8px";
  dateInput.style.border = "1px solid #e5e7eb";
  dateInput.style.marginBottom = "12px";

  const buttonsRow = document.createElement("div");
  buttonsRow.style.display = "flex";
  buttonsRow.style.justifyContent = "flex-end";
  buttonsRow.style.gap = "8px";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.border = "none";
  cancelBtn.style.borderRadius = "999px";
  cancelBtn.style.padding = "6px 12px";
  cancelBtn.style.background = "#e5e7eb";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = () => {
    document.body.removeChild(overlay);
  };

  const moveBtn = document.createElement("button");
  moveBtn.textContent = "Move";
  moveBtn.style.border = "none";
  moveBtn.style.borderRadius = "999px";
  moveBtn.style.padding = "6px 12px";
  moveBtn.style.background = "#60a5fa";
  moveBtn.style.color = "#fff";
  moveBtn.style.cursor = "pointer";

  moveBtn.onclick = async () => {
    const newDate = dateInput.value;
    if (!newDate || newDate === task.task_date) {
      document.body.removeChild(overlay);
      return;
    }

    try {
      const { data: existing, error } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("task_date", newDate);

      if (error) console.error("Move task date error:", error);

      const newIndex = existing ? existing.length : 0;

      await supabase
        .from("tasks")
        .update({ task_date: newDate, sort_index: newIndex })
        .eq("id", task.id);

      track("ts_task_moved_day", {
        from: task.task_date,
        to: newDate
      });

      await loadTasksForSelectedDate();
      await renderCalendar();
    } catch (err) {
      console.error("Move task date error:", err);
      alert("Could not move task.");
    } finally {
      document.body.removeChild(overlay);
    }
  };

  buttonsRow.appendChild(cancelBtn);
  buttonsRow.appendChild(moveBtn);

  box.appendChild(dateInput);
  box.appendChild(buttonsRow);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  dateInput.focus();
}

// === RENDER TASK ITEM ===
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority || "low"}`;
  div.dataset.taskId = task.id;

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.flex = "1";

  const dragHandle = document.createElement("span");
  dragHandle.className = "task-drag-handle";
  dragHandle.textContent = "⋮⋮";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;
  checkbox.addEventListener("change", async () => {
    if (currentUser && !String(task.id).startsWith("preview-")) {
      await supabase
        .from("tasks")
        .update({ completed: checkbox.checked })
        .eq("id", task.id);
    }

    if (checkbox.checked) {
      showReward();
    }

    track("ts_task_completed_toggle", {
      completed: checkbox.checked,
      priority: task.priority
    });
  });

  const label = document.createElement("label");
  label.textContent = task.task_text;
  label.style.marginLeft = "10px";
  label.style.flex = "1";
  label.style.cursor = "text";

  function attachRename(labelEl) {
    labelEl.addEventListener("dblclick", () => {
      if (!currentUser || String(task.id).startsWith("preview-")) return;

      const currentText = labelEl.textContent || "";
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentText;
      input.style.width = "100%";
      input.style.borderRadius = "8px";
      input.style.border = "1px solid #d1d5db";
      input.style.padding = "2px 6px";

      labelEl.replaceWith(input);
      input.focus();
      input.select();

      const finishEdit = async (save) => {
        const newText = save ? input.value.trim() : currentText;
        const finalText = newText || currentText;

        const newLabel = document.createElement("label");
        newLabel.textContent = finalText;
        newLabel.style.marginLeft = "10px";
        newLabel.style.flex = "1";
        newLabel.style.cursor = "text";

        attachRename(newLabel);
        input.replaceWith(newLabel);

        if (save && newText && newText !== currentText && currentUser) {
          await supabase
            .from("tasks")
            .update({ task_text: newText })
            .eq("id", task.id);
        }
      };

      input.addEventListener("blur", () => finishEdit(true));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finishEdit(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          finishEdit(false);
        }
      });
    });
  }

  attachRename(label);

  left.appendChild(dragHandle);
  left.appendChild(checkbox);
  left.appendChild(label);

  const controls = document.createElement("div");
  controls.className = "task-controls";

  const prioritySelect = document.createElement("select");
  prioritySelect.className = "priority-select";
  ["high", "medium", "low"].forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p[0].toUpperCase() + p.slice(1);
    prioritySelect.appendChild(opt);
  });
  prioritySelect.value = task.priority || "low";
  prioritySelect.addEventListener("change", async () => {
    const newPriority = prioritySelect.value;

    if (currentUser && !String(task.id).startsWith("preview-")) {
      await supabase
        .from("tasks")
        .update({ priority: newPriority })
        .eq("id", task.id);
    }

    div.classList.remove("high", "medium", "low");
    div.classList.add(newPriority);

    if (sortMode && sortMode.value === "priority" && currentUser) {
      loadTasksForSelectedDate();
    }
  });

  const moveDateBtn = document.createElement("button");
  moveDateBtn.textContent = "📆";
  moveDateBtn.title = "Move to another day";
  moveDateBtn.className = "task-move-date";
  moveDateBtn.addEventListener("click", () => {
    showMoveDateDialog(task);
  });

  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.title = "Move up";
  upBtn.className = "task-move";
  upBtn.addEventListener("click", () => {
    const prev = div.previousElementSibling;
    if (prev && prev.classList.contains("task-item")) {
      tasksContainer.insertBefore(div, prev);
      if (currentUser && !String(task.id).startsWith("preview-")) {
        saveTaskOrderToDatabase();
      }
    }
  });

  const downBtn = document.createElement("button");
  downBtn.textContent = "↓";
  downBtn.title = "Move down";
  downBtn.className = "task-move";
  downBtn.addEventListener("click", () => {
    const next = div.nextElementSibling;
    if (next && next.classList.contains("task-item")) {
      tasksContainer.insertBefore(next, div);
      if (currentUser && !String(task.id).startsWith("preview-")) {
        saveTaskOrderToDatabase();
      }
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.title = "Delete task";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", () => {
    handleDelete(task, div);
  });

  controls.appendChild(prioritySelect);
  controls.appendChild(moveDateBtn);
  controls.appendChild(upBtn);
  controls.appendChild(downBtn);
  controls.appendChild(deleteBtn);

  div.appendChild(left);
  div.appendChild(controls);
  tasksContainer.appendChild(div);

  // Desktop drag
  dragHandle.draggable = true;
  dragHandle.addEventListener("dragstart", () => {
    draggedTaskElement = div;
    div.classList.add("dragging");
  });
  dragHandle.addEventListener("dragend", async () => {
    draggedTaskElement = null;
    div.classList.remove("dragging");
    if (currentUser && !String(task.id).startsWith("preview-")) {
      await saveTaskOrderToDatabase();
    }
  });

  // Mobile drag
  dragHandle.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();

    draggedTaskElement = div;
    div.classList.add("dragging");

    const handleMove = (ev) => {
      const t = ev.touches[0] || ev.changedTouches[0];
      if (!t) return;
      reorderTasksAtY(t.clientY);
      ev.preventDefault();
    };

    const handleEnd = async () => {
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);

      draggedTaskElement = null;
      div.classList.remove("dragging");
      if (currentUser && !String(task.id).startsWith("preview-")) {
        await saveTaskOrderToDatabase();
      }
    };

    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);
  });

  // Swipe-to-delete
  let touchStartX = null;
  let touchCurrentX = null;
  let isSwiping = false;

  div.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchCurrentX = touchStartX;
      isSwiping = true;
    },
    { passive: true }
  );

  div.addEventListener(
    "touchmove",
    (e) => {
      if (!isSwiping) return;
      touchCurrentX = e.touches[0].clientX;
      const deltaX = touchCurrentX - touchStartX;

      if (deltaX < 0) {
        div.style.transform = `translateX(${deltaX}px)`;
        const opacity = Math.max(0.3, 1 + deltaX / 200);
        div.style.opacity = String(opacity);
      }
    },
    { passive: true }
  );

  div.addEventListener("touchend", () => {
    if (!isSwiping) return;
    isSwiping = false;

    const deltaX = touchCurrentX - touchStartX;
    if (deltaX < -80) {
      handleDelete(task, div);
    } else {
      div.style.transform = "translateX(0)";
      div.style.opacity = "1";
    }
  });
}

// === MANUAL ADD TASK ===
async function addManualTask() {
  if (!currentUser) return alert("Please log in first.");
  const text = manualTaskInput.value.trim();
  if (!text) return;

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  const existingItems = [
    ...tasksContainer.querySelectorAll(".task-item")
  ];
  const baseIndex = existingItems.length;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: currentUser.id,
      task_date: date,
      task_text: text,
      priority: "medium",
      completed: false,
      sort_index: baseIndex
    })
    .select()
    .single();

  if (error) {
    console.error("Manual add error:", error);
    alert("Could not add task.");
    return;
  }

  track("ts_task_created", { source: "manual" });

  renderTaskItem(data);
  manualTaskInput.value = "";
  await saveTaskOrderToDatabase();
  await renderCalendar();
}

if (manualAddBtn) {
  manualAddBtn.addEventListener("click", addManualTask);
}
if (manualTaskInput) {
  manualTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addManualTask();
    }
  });
}
// === Move to Next Day  ===
async function moveUnfinishedToNextDay() {
  if (!currentUser) {
    alert("Please log in first.");
    return;
  }

  const date = taskDateInput.value;
  if (!date) {
    alert("Please choose a day first.");
    return;
  }

  // figure out tomorrow (using existing local date helper)
  const current = new Date(date + "T00:00:00");
  current.setDate(current.getDate() + 1);
  const nextDate = formatDateLocal(current);

  try {
    // 1) get unfinished tasks for selected day
    const { data: unfinished, error: unfinishedError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("task_date", date)
      .eq("completed", false)
      .order("sort_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (unfinishedError) {
      console.error("Fetch unfinished error:", unfinishedError);
      alert("Could not move tasks.");
      return;
    }

    if (!unfinished || unfinished.length === 0) {
      alert("No unfinished tasks to move for this day.");
      return;
    }

    // 2) how many tasks already exist tomorrow?
    const { data: tomorrowExisting, error: tomorrowError } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("task_date", nextDate);

    if (tomorrowError) {
      console.error("Fetch tomorrow tasks error:", tomorrowError);
    }

    let baseIndex = tomorrowExisting ? tomorrowExisting.length : 0;

    // 3) update each unfinished task → tomorrow with new sort_index
    const updates = unfinished.map((task, i) =>
      supabase
        .from("tasks")
        .update({
          task_date: nextDate,
          sort_index: baseIndex + i
        })
        .eq("id", task.id)
    );

    await Promise.all(updates);

    track("ts_move_unfinished_to_next_day", {
      from: date,
      to: nextDate,
      count: unfinished.length
    });

    // 4) refresh current day + calendar UI
    await loadTasksForSelectedDate();
    await renderCalendar();

    alert(
      `Moved ${unfinished.length} unfinished task${
        unfinished.length > 1 ? "s" : ""
      } to ${nextDate}.`
    );
  } catch (err) {
    console.error("Move unfinished exception:", err);
    alert("Something went wrong while moving tasks.");
  }
}
// === ORGANIZE BUTTON (AI) ===
organizeBtn.addEventListener("click", async () => {
  const dumpText = brainDump.value.trim();
  if (!dumpText) return alert("Please type something first.");

    // Limit free AI preview when user is logged out
  if (!currentUser) {
    if (previewLimitReached()) {
      alert(
        "You’ve reached the free preview limit.\nCreate a free account or log in to keep using TaskSnacks AI 😊"
      );
      return;
    }
  }

  if (!taskDateInput.value) {
    const today = new Date();
    taskDateInput.value = formatDateLocal(today);
  }
  updateTodayLabel();

  const date = taskDateInput.value;

  organizeBtn.disabled = true;
organizeBtn.textContent = "Organizing…";
funFactContainer.textContent = "";
hideUndoBar();

// Only clear the list in PREVIEW mode (logged out)
if (!currentUser) {
  tasksContainer.innerHTML = "";
}

  track("ts_organize_clicked", {
    text_length: dumpText.length,
    logged_in: !!currentUser
  });

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "tasks", text: dumpText })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unknown error from worker.");

        // Count successful AI preview calls for logged-out users
    if (!currentUser) {
      incrementPreviewAICount();
    }

    const lines = data.tasksText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"));

    const parsedTasks = [];
    for (const line of lines) {
      const trimmed = line.replace(/^-\s*/, "");
      const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
      if (match) {
        parsedTasks.push({
          priority: match[1].toLowerCase(),
          text: match[2]
        });
      }
    }

    if (!currentUser) {
      // PREVIEW MODE
      isPreviewMode = true;
      if (previewNote) previewNote.style.display = "block";

      let idx = 0;
      for (const t of parsedTasks) {
        const previewTask = {
          id: `preview-${Date.now()}-${idx++}`,
          user_id: null,
          task_date: date,
          task_text: t.text,
          priority: t.priority,
          completed: false,
          sort_index: idx
        };
        renderTaskItem(previewTask);
      }
    } else {
      // LOGGED-IN MODE
      const existingItems = [
        ...tasksContainer.querySelectorAll(".task-item")
      ];
      let baseIndex = existingItems.length;

      for (const t of parsedTasks) {
        const { data: inserted, error } = await supabase
          .from("tasks")
          .insert({
            user_id: currentUser.id,
            task_date: date,
            task_text: t.text,
            priority: t.priority,
            completed: false,
            sort_index: baseIndex
          })
          .select()
          .single();

        if (!error && inserted) {
          track("ts_task_created", {
            source: "ai",
            priority: t.priority
          });

          renderTaskItem(inserted);
          baseIndex += 1;
        }
      }

      await saveTaskOrderToDatabase();
      await renderCalendar();
      if (previewNote) previewNote.style.display = "none";
      isPreviewMode = false;
    }
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  } finally {
    organizeBtn.disabled = false;
    organizeBtn.textContent = "Organize My Mess";
    brainDump.value = "";
  }
});

// === ABOUT MODAL LOGIC ===
if (aboutBtn && aboutModal) {
  aboutBtn.addEventListener("click", () => {
    aboutModal.classList.remove("hidden");
  });
}
if (aboutCloseBtn) {
  aboutCloseBtn.addEventListener("click", () => {
    aboutModal.classList.add("hidden");
  });
}
if (aboutBackdrop) {
  aboutBackdrop.addEventListener("click", () => {
    aboutModal.classList.add("hidden");
  });
}

// --- DELETE ACCOUNT via Edge Function "delete-user" with modal ---
if (deleteAccountBtn && deleteModal) {
  deleteAccountBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }
    deleteConfirmInput.value = "";
    finalDeleteBtn.disabled = true;
    deleteModal.classList.remove("hidden");
    if (settingsMenu) settingsMenu.classList.add("hidden");
  });
}

// Close delete modal
if (deleteCloseBtn) {
  deleteCloseBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
  });
}
if (deleteModal) {
  const backdrop = deleteModal.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      deleteModal.classList.add("hidden");
    });
  }
}

// Enable final delete only when user typed DELETE
if (deleteConfirmInput && finalDeleteBtn) {
  deleteConfirmInput.addEventListener("input", () => {
    finalDeleteBtn.disabled = deleteConfirmInput.value.trim() !== "DELETE";
  });
}

// Final delete click: call Supabase Edge Function named "delete-user"
if (finalDeleteBtn) {
  finalDeleteBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please log in first.");
      return;
    }

    if (deleteConfirmInput.value.trim() !== "DELETE") {
      alert('Please type "DELETE" to confirm.');
      return;
    }

    finalDeleteBtn.disabled = true;
    finalDeleteBtn.textContent = "Deleting…";

    try {
      const { data, error } = await supabase.functions.invoke("smooth-action", {
  // `invoke` already uses POST by default
  // If your function expects JSON, send it like this:
  body: { action: "delete-user" }
});

      if (error) {
        console.error("Delete user error:", error);
        alert("Could not delete account: " + error.message);
        finalDeleteBtn.disabled = false;
        finalDeleteBtn.textContent = "Delete my account";
        return;
      }

      await supabase.auth.signOut();
      currentUser = null;
      updateAuthUI();

      deleteModal.classList.add("hidden");
      if (goodbyeModal) goodbyeModal.classList.remove("hidden");

      setTimeout(() => {
        if (goodbyeModal) goodbyeModal.classList.add("hidden");
        window.location.href = "https://tasksnacks.github.io/TaskSnacks/";
      }, 2000);
    } catch (err) {
      console.error("Delete user exception:", err);
      alert("Something went wrong while deleting your account.");
      finalDeleteBtn.disabled = false;
      finalDeleteBtn.textContent = "Delete my account";
    }
  });
}

// === INIT ===
handleRecoveryFromURL();
checkSession();
track("ts_page_loaded");
