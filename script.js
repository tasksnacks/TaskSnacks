// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/"; // your Worker URL

// Supabase config
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

// Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Fun facts (local only)
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
  "Honey never spoils; archaeologists found edible honey in ancient tombs."
];

let lastFunFact = null;
function getRandomFunFact() {
  if (!funFacts.length) return null;
  let fact = funFacts[Math.floor(Math.random() * funFacts.length)];
  if (funFacts.length > 1 && fact === lastFunFact) {
    fact = funFacts[Math.floor(Math.random() * funFacts.length)];
  }
  lastFunFact = fact;
  return fact;
}
function showFunFact(fact) {
  // small text at the bottom as before
  funFactContainer.textContent = `🎉 Fun fact: ${fact}`;

  // BIG popup in the middle
  const popup = document.createElement("div");
  popup.className = "fun-fact-popup";
  popup.innerHTML = `<strong>Fun fact</strong><br>${fact}`;
  document.body.appendChild(popup);

  // trigger CSS animation
  requestAnimationFrame(() => {
    popup.classList.add("visible");
  });

  // confetti burst (if library loaded)
  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.25 }
    });
  }

  // hide after 2.5s
  setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => popup.remove(), 200);
  }, 2500);
}
// === DOM refs ===
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

const manualAddSection = document.getElementById("manualAddSection");
const manualTaskInput = document.getElementById("manualTaskInput");
const manualAddBtn = document.getElementById("manualAddBtn");

// === STATE ===
let currentUser = null;
let currentMonthDate = new Date(); // which month is shown in the calendar
let draggedTaskElement = null;     // for drag & drop

let lastDeletedTask = null;        // for undo
let undoTimeoutId = null;

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
      if (!lastDeletedTask) return;

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
  const hasCalendar = !!calendarSection;
  const hasSort = !!sortSection;
  const hasManual = !!manualAddSection;

  if (currentUser) {
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    if (hasCalendar) calendarSection.style.display = "block";
    if (hasSort) sortSection.style.display = "block";
    if (hasManual) manualAddSection.style.display = "flex";
    organizeBtn.disabled = false;
  } else {
    authStatus.textContent = "Not logged in.";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    if (hasCalendar) calendarSection.style.display = "none";
    if (hasSort) sortSection.style.display = "none";
    if (hasManual) manualAddSection.style.display = "none";
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
  // if sortMode is "created" ("My order"), we keep DB order

  tasks.forEach((task) => {
    renderTaskItem(task);
  });

  // Refresh calendar highlights for has-tasks / selected
  renderCalendar();
}

// === DRAG & DROP CONTAINER HANDLING ===
tasksContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!draggedTaskElement) return;

  const afterElement = getDragAfterElement(tasksContainer, e.clientY);
  if (afterElement == null) {
    tasksContainer.appendChild(draggedTaskElement);
  } else {
    tasksContainer.insertBefore(draggedTaskElement, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
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

async function saveTaskOrderToDatabase() {
  if (!tasksContainer) return;
  const items = [...tasksContainer.querySelectorAll(".task-item")];
  const updates = items.map((item, index) => {
    const id = item.dataset.taskId;
    return supabase
      .from("tasks")
      .update({ sort_index: index })
      .eq("id", id);
  });
  try {
    await Promise.all(updates);

    // After manual reorder, show “my order”
    if (sortMode) {
      sortMode.value = "created";
    }
  } catch (e) {
    console.error("Error saving order:", e);
  }
}

// === DELETE WITH ANIMATION & UNDO ===
async function handleDelete(task, div) {
  // slide + fade
  div.style.opacity = "0";
  div.style.transform = "translateX(20px)";

  setTimeout(async () => {
    await supabase.from("tasks").delete().eq("id", task.id);
    div.remove();
    await saveTaskOrderToDatabase();
    await renderCalendar();
    showUndo(task);
  }, 150);
}

// === RENDER TASK ITEM ===
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority || "low"}`;
  div.dataset.taskId = task.id;

  // Make draggable
  div.draggable = true;
  div.addEventListener("dragstart", () => {
    draggedTaskElement = div;
    div.classList.add("dragging");
  });
  div.addEventListener("dragend", () => {
    draggedTaskElement = null;
    div.classList.remove("dragging");
    saveTaskOrderToDatabase();
  });

  // --- Swipe-to-delete (mobile) ---
  let touchStartX = null;
  let touchCurrentX = null;
  let isSwiping = false;

  div.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchCurrentX = touchStartX;
    isSwiping = true;
  }, { passive: true });

  div.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    touchCurrentX = e.touches[0].clientX;
    const deltaX = touchCurrentX - touchStartX;

    // Only react to left swipe
    if (deltaX < 0) {
      div.style.transform = `translateX(${deltaX}px)`;
      const opacity = Math.max(0.3, 1 + deltaX / 200);
      div.style.opacity = String(opacity);
    }
  }, { passive: true });

  div.addEventListener("touchend", () => {
    if (!isSwiping) return;
    isSwiping = false;

    const deltaX = touchCurrentX - touchStartX;
    if (deltaX < -80) {
      // swiped left far enough → delete
      handleDelete(task, div);
    } else {
      // snap back
      div.style.transform = "translateX(0)";
      div.style.opacity = "1";
    }
  });

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.flex = "1";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;
  checkbox.addEventListener("change", async () => {
    await supabase
      .from("tasks")
      .update({ completed: checkbox.checked })
      .eq("id", task.id);

     if (checkbox.checked) {
    const fact = getRandomFunFact();
    if (fact) {
      showFunFact(fact);
    }
  }
  });

  const label = document.createElement("label");
  label.textContent = task.task_text;
  label.style.marginLeft = "10px";
  label.style.flex = "1";

  left.appendChild(checkbox);
  left.appendChild(label);

  const controls = document.createElement("div");
  controls.className = "task-controls";

  // Priority select
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
    await supabase
      .from("tasks")
      .update({ priority: newPriority })
      .eq("id", task.id);

    div.classList.remove("high", "medium", "low");
    div.classList.add(newPriority);

    // If sorting by priority, reload list from DB
    if (sortMode && sortMode.value === "priority") {
      loadTasksForSelectedDate();
    }
  });

  // Move buttons (for mouse users)
  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.title = "Move up";
  upBtn.className = "task-move";
  upBtn.addEventListener("click", () => {
    const prev = div.previousElementSibling;
    if (prev && prev.classList.contains("task-item")) {
      tasksContainer.insertBefore(div, prev);
      saveTaskOrderToDatabase();
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
      saveTaskOrderToDatabase();
    }
  });

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.title = "Delete task";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", () => {
    handleDelete(task, div);
  });

  controls.appendChild(prioritySelect);
  controls.appendChild(upBtn);
  controls.appendChild(downBtn);
  controls.appendChild(deleteBtn);

  div.appendChild(left);
  div.appendChild(controls);
  tasksContainer.appendChild(div);
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

  renderTaskItem(data);
  manualTaskInput.value = "";
  await saveTaskOrderToDatabase();
  await renderCalendar();
}

manualAddBtn.addEventListener("click", addManualTask);
manualTaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addManualTask();
  }
});

// === ORGANIZE BUTTON (AI + SAVE, APPEND TASKS) ===
organizeBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please log in first.");
  const dumpText = brainDump.value.trim();
  if (!dumpText) return alert("Please type something first.");

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  organizeBtn.disabled = true;
  organizeBtn.textContent = "Organizing…";
  funFactContainer.textContent = "";
  hideUndoBar();

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "tasks", text: dumpText }),
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unknown error from worker.");

    const lines = data.tasksText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"));

    // determine base index so AI tasks are appended in given order
    const existingItems = [
      ...tasksContainer.querySelectorAll(".task-item")
    ];
    let baseIndex = existingItems.length;

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
            sort_index: baseIndex
          })
          .select()
          .single();

        if (!error && inserted) {
          renderTaskItem(inserted);
          baseIndex += 1;
        }
      }
    }

    await saveTaskOrderToDatabase();
    await renderCalendar();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  } finally {
    organizeBtn.disabled = false;
    organizeBtn.textContent = "Organize My Mess";
    brainDump.value = "";
  }
});

// === INIT ===
checkSession();
