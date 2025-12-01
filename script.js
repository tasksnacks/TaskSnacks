// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/";
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- REWARDS ---
(function () {
  const funFacts = [
    "Sea otters hold hands while sleeping.", "Cows have best friends.",
    "Your brain uses 20% of your energy.", "Ravens remember faces.",
    "Sloths hold their breath longer than dolphins.", "Bananas are berries.",
    "Octopuses have three hearts."
  ];
  const affirmations = [
    "You’re doing better than you think.", "Tiny progress is still progress.",
    "You turned chaos into movement.", "Rest is part of the process."
  ];
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  
  window.TaskSnacksRewards = {
    getRandomReward: function() {
      const isFact = Math.random() > 0.4;
      const text = isFact ? pick(funFacts) : pick(affirmations);
      const title = isFact ? "Fun Fact" : "Nice Work";
      return { title: title, body: text, inlineText: `🎉 ${text}`, confetti: true };
    }
  };
})();

// --- DOM REFS ---
const organizeBtn = document.getElementById("organizeBtn");
const brainDump = document.getElementById("brainDump");
const tasksContainer = document.getElementById("tasksContainer");
const funFactContainer = document.getElementById("funFactContainer");
const taskDateInput = document.getElementById("taskDate");
const appContent = document.getElementById("appContent");
const authContainer = document.getElementById("authContainer");
const authSection = document.getElementById("authSection");
const tryAIPreviewHint = document.getElementById("tryAIPreviewHint");

// Calendar
const calendarSection = document.getElementById("calendarSection");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const calChevron = document.getElementById("calChevron");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

// Auth Inputs
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

// Others
const loggedOutInfo = document.getElementById("loggedOutInfo");
const manualAddSection = document.getElementById("manualAddSection");
const sortSection = document.getElementById("sortSection");

// State
let currentUser = null;
let currentMonthDate = new Date();
let isCalendarExpanded = false;
let isPreviewMode = false;

// --- AUTH LOGIC ---
async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    const { data: userData } = await supabase.auth.getUser();
    currentUser = userData?.user || null;
  } else {
    currentUser = null;
  }
  updateAuthUI();
  if (currentUser) {
    setToday();
    await loadTasksForSelectedDate();
    await renderCalendar();
  }
}

function updateAuthUI() {
  // Always show app content now (Swap Logic)
  appContent.style.display = "block";

  if (currentUser) {
    // LOGGED IN
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "block";
    
    // Hide login inputs
    emailInput.style.display = "none";
    passwordInput.style.display = "none";
    document.querySelector(".auth-buttons").style.display = "none";
    document.querySelector(".login-prompt").style.display = "none";
    
    authContainer.classList.add("logged-in"); // Removes card styling
    loggedOutInfo.style.display = "none";
    tryAIPreviewHint.style.display = "none";
    
    // Show full features
    calendarSection.style.display = "block";
    sortSection.style.display = "flex";
    manualAddSection.style.display = "flex";
    
  } else {
    // LOGGED OUT
    authStatus.textContent = "";
    logoutBtn.style.display = "none";
    
    // Show login inputs
    emailInput.style.display = "block";
    passwordInput.style.display = "block";
    document.querySelector(".auth-buttons").style.display = "flex";
    document.querySelector(".login-prompt").style.display = "block";
    
    authContainer.classList.remove("logged-in");
    loggedOutInfo.style.display = "block";
    tryAIPreviewHint.style.display = "block";
    
    // Hide advanced features to reduce noise
    calendarSection.style.display = "none";
    sortSection.style.display = "none";
    manualAddSection.style.display = "none";
    tasksContainer.innerHTML = ""; // Clear tasks
  }
}

// --- CALENDAR TOGGLE ---
function toggleCalendar(forceState = null) {
  if (forceState !== null) isCalendarExpanded = forceState;
  else isCalendarExpanded = !isCalendarExpanded;

  if (isCalendarExpanded) {
    calendarGrid.classList.remove("collapsed");
    calChevron.classList.add("rotated");
  } else {
    calendarGrid.classList.add("collapsed");
    calChevron.classList.remove("rotated");
  }
}

if (calendarMonthLabel) {
  calendarMonthLabel.addEventListener("click", () => toggleCalendar());
}

// --- AUTH ACTIONS ---
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email & Password required");
  const { error } = await supabase.auth.signUp({ 
    email, password, 
    options: { emailRedirectTo: "https://tasksnacks.github.io/TaskSnacks/" } 
  });
  if (error) alert(error.message);
  else alert("Check email for confirmation link!");
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
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
  location.reload(); // Clean refresh
});

// --- DATE & CALENDAR ---
function setToday() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  taskDateInput.value = `${y}-${m}-${d}`;
  currentMonthDate = today;
}

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
  const month = currentMonthDate.getMonth();
  
  // Update text but keep chevron
  const monthName = currentMonthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  calendarMonthLabel.innerHTML = `${monthName} <span id="calChevron" class="chevron ${isCalendarExpanded ? 'rotated' : ''}">▼</span>`;
  // Re-bind chevron logic if needed (label click covers it usually)
  
  const firstDay = new Date(year, month, 1).getDay(); // Sun=0
  const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1); // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  calendarGrid.innerHTML = "";
  ["M","T","W","T","F","S","S"].forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.innerText = d;
    calendarGrid.appendChild(el);
  });
  
  for(let i=0; i<adjustedFirstDay; i++) calendarGrid.appendChild(document.createElement("div"));
  
  const { data } = await supabase.from("tasks").select("task_date")
    .eq("user_id", currentUser.id)
    .gte("task_date", `${year}-${String(month+1).padStart(2,'0')}-01`)
    .lte("task_date", `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`);
    
  const taskDates = new Set((data||[]).map(r => r.task_date));
  
  for(let d=1; d<=daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.innerText = d;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    
    if (taskDates.has(dateStr)) cell.classList.add("has-tasks");
    if (taskDateInput.value === dateStr) cell.classList.add("selected");
    
    cell.onclick = () => {
      taskDateInput.value = dateStr;
      loadTasksForSelectedDate();
      toggleCalendar(false); // Auto collapse
    };
    calendarGrid.appendChild(cell);
  }
}

// --- ORGANIZE (AI) ---
organizeBtn.addEventListener("click", async () => {
  const text = brainDump.value.trim();
  if (!text) return alert("Type something first!");
  
  organizeBtn.disabled = true;
  organizeBtn.textContent = "Organizing...";
  tasksContainer.innerHTML = ""; // clear previous
  
  try {
    // 1. Send to AI
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "tasks", text: text })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    // 2. Parse results
    const lines = data.tasksText.split("\n").filter(l => l.trim().startsWith("-"));
    
    // 3. Render locally OR save to DB
    if (!currentUser) {
      // PREVIEW MODE: Just render them
      lines.forEach((line, idx) => {
         const trimmed = line.replace(/^-\s*/, "");
         const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
         if (match) {
           renderTaskItem({
             id: "preview-"+idx,
             task_text: match[2],
             priority: match[1].toLowerCase(),
             completed: false
           });
         }
      });
      // Show "Sign up to save" hint
      tryAIPreviewHint.innerHTML = "✨ <strong>Magic!</strong> <br>Create a free account below to save these tasks.";
    } else {
      // LOGGED IN: Save to Supabase
      // (Simplified loop for brevity)
      for(const line of lines) {
         const trimmed = line.replace(/^-\s*/, "");
         const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
         if(match) {
           const { data: inserted } = await supabase.from("tasks").insert({
             user_id: currentUser.id,
             task_date: taskDateInput.value,
             task_text: match[2],
             priority: match[1].toLowerCase()
           }).select().single();
           if(inserted) renderTaskItem(inserted);
         }
      }
      await renderCalendar();
    }
  } catch(e) {
    alert("Error: " + e.message);
  } finally {
    organizeBtn.disabled = false;
    organizeBtn.textContent = "Organize My Mess";
    brainDump.value = "";
  }
});

// --- RENDER TASK ---
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority}`;
  div.innerHTML = `
    <div style="flex:1; display:flex; align-items:center;">
      <input type="checkbox" ${task.completed ? "checked" : ""}>
      <span style="margin-left:10px;">${task.task_text}</span>
    </div>
    <div class="task-controls">
      ${!String(task.id).startsWith("preview") ? '<button class="task-delete">✕</button>' : ''}
    </div>
  `;
  
  const checkbox = div.querySelector("input");
  checkbox.onchange = async () => {
    if (!String(task.id).startsWith("preview")) {
      await supabase.from("tasks").update({ completed: checkbox.checked }).eq("id", task.id);
    }
    if (checkbox.checked) {
      const reward = window.TaskSnacksRewards.getRandomReward();
      funFactContainer.textContent = reward.inlineText;
      if (window.confetti) window.confetti({ origin: { y: 0.5 } });
    }
  };
  
  if (!String(task.id).startsWith("preview")) {
    div.querySelector(".task-delete").onclick = async () => {
      div.style.opacity = 0;
      setTimeout(async () => {
         await supabase.from("tasks").delete().eq("id", task.id);
         div.remove();
      }, 200);
    };
  }

  tasksContainer.appendChild(div);
}

// --- LOAD TASKS ---
async function loadTasksForSelectedDate() {
  tasksContainer.innerHTML = "";
  if (!currentUser) return;
  const { data } = await supabase.from("tasks").select("*")
    .eq("user_id", currentUser.id)
    .eq("task_date", taskDateInput.value)
    .order("created_at");
  (data||[]).forEach(renderTaskItem);
}

// Init
checkSession();
