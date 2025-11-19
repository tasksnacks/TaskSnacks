// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/"; // your Worker URL

// Supabase config
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

// Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Fun facts
const funFacts = [
  "Octopuses have three hearts.",
  "Bananas are berries but strawberries are not.",
  "Honey never spoils.",
  "A day on Venus is longer than a year on Venus.",
  "Koalas sleep up to 22 hours a day.",
  "Wombats produce cube-shaped poop.",
  "Cleopatra lived closer in time to the moon landing than to the building of the Great Pyramid.",
  "There are more stars in the observable universe than grains of sand on Earth.",
  "A group of flamingos is called a 'flamboyance'.",
  "Oxford University is older than the Aztec Empire."
];

// DOM refs
const organizeBtn = document.getElementById("organizeBtn");
const brainDump = document.getElementById("brainDump");
const tasksContainer = document.getElementById("tasksContainer");
const funFactContainer = document.getElementById("funFactContainer");
const taskDateInput = document.getElementById("taskDate");

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

const sortSection = document.getElementById("sortSection");
const sortMode = document.getElementById("sortMode");

// === AUTH LOGIC ===
let currentUser = null;
let currentMonthDate = new Date(); // which month is shown in the calendar

async function checkSession() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;
  updateAuthUI();
  if (currentUser) {
    setToday();
    await loadTasksForSelectedDate();
    await renderCalendar();
  }
}

function updateAuthUI() {
  if (currentUser) {
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    calendarSection.style.display = "block";
    sortSection.style.display = "block";
    organizeBtn.disabled = false;
  } else {
    authStatus.textContent = "Not logged in.";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    calendarSection.style.display = "none";
    sortSection.style.display = "none";
    organizeBtn.disabled = true;
    tasksContainer.innerHTML = "";
    funFactContainer.textContent = "";
  }
}

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Sign up error object:", error);
      return alert("Sign up error: " + error.message);
    }
    alert("Check your email to confirm your account.");
  } catch (e) {
    console.error("Sign up threw exception:", e);
    alert("Sign up error: " + e.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return alert("Login error: " + error.message);
  currentUser = data.user;
  updateAuthUI();
  setToday();
  await loadTasksForSelectedDate();
  await renderCalendar();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateAuthUI();
});

// === DATE & CALENDAR HANDLING ===
function setToday() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
  taskDateInput.value = todayStr;
  currentMonthDate = today;
}

sortMode.addEventListener("change", () => {
  if (currentUser) loadTasksForSelectedDate();
});

prevMonthBtn.addEventListener("click", () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderCalendar();
});

async function renderCalendar() {
  if (!currentUser) return;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-11

  // Label like "November 2025"
  calendarMonthLabel.textContent = currentMonthDate.toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthStart = first.toISOString().slice(0, 10);
  const last = new Date(year, month + 1, 0);
  const monthEnd = last.toISOString().slice(0, 10);

  // Which dates in this month have tasks?
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

  // Build grid
  calendarGrid.innerHTML = "";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dayNames.forEach((name) => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.textContent = name;
    calendarGrid.appendChild(el);
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendarGrid.appendChild(empty);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = day;
    cell.dataset.date = dateStr;

    if (datesWithTasks.has(dateStr)) {
      cell.classList.add("has-tasks");
    }
    if (taskDateInput.value === dateStr) {
      cell.classList.add("selected");
    }

    cell.addEventListener("click", () => {
      taskDateInput.value = dateStr;
      loadTasksForSelectedDate();
      document.querySelectorAll(".cal-day.selected").forEach((el) =>
        el.classList.remove("selected")
      );
      cell.classList.add("selected");
    });

    calendarGrid.appendChild(cell);
  }
}

// === LOAD TASKS FOR A DATE ===
async function loadTasksForSelectedDate() {
  tasksContainer.innerHTML = "";
  funFactContainer.textContent = "";

  const date = taskDateInput.value;
  if (!date || !currentUser) return;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("task_date", date)
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
  // if sortMode is "created", keep DB created_at order

  tasks.forEach((task) => {
    renderTaskItem(task);
  });

  // Refresh calendar highlights for has-tasks / selected
  renderCalendar();
}

// === RENDER TASK ITEM ===
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority || "low"}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;
  checkbox.addEventListener("change", async () => {
    await supabase
      .from("tasks")
      .update({ completed: checkbox.checked })
      .eq("id", task.id);

    if (checkbox.checked) {
      const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
      funFactContainer.textContent = `🎉 Fun fact: ${fact}`;
    }
  });

  const label = document.createElement("label");
  label.textContent = task.task_text;

  div.appendChild(checkbox);
  div.appendChild(label);
  tasksContainer.appendChild(div);
}

// === ORGANIZE BUTTON (AI + SAVE, append tasks) ===
organizeBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please log in first.");
  const dumpText = brainDump.value.trim();
  if (!dumpText) return alert("Please type something first.");

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  organizeBtn.disabled = true;
  organizeBtn.textContent = "Organizing…";
  // do NOT clear tasksContainer – we want to append
  funFactContainer.textContent = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: dumpText }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unknown error from worker.");

    const lines = data.tasksText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"));

    for (const line of lines) {
      const trimmed = line.replace(/^-\s*/, "");
      const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
      if (match) {
        const priority = match[1].toLowerCase();
        const text = match[2];

        const { data: inserted, error } = await supabase
          .from("tasks")
          .insert({
            user_id: currentUser.id,
            task_date: date,
            task_text: text,
            priority,
            completed: false,
          })
          .select()
          .single();

        if (!error && inserted) {
          renderTaskItem(inserted);
        }
      }
    }

    // reload from DB so list + calendar are in sync
    await loadTasksForSelectedDate();
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    organizeBtn.disabled = false;
    organizeBtn.textContent = "Organize My Mess";
    brainDump.value = "";
  }
});

// === INIT ===
checkSession();
