// === CONFIG ===
const workerUrl = "https://tasksnacks.hikarufujiart.workers.dev/"; // your Worker URL

// Replace these with your Supabase values
const supabaseUrl = "https://fxexewdnbmiybbutcnyv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXhld2RuYm1peWJidXRjbnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA2MjQsImV4cCI6MjA3OTEyNjYyNH0.E_UQHGX4zeLUajwMIlTRchsCMnr99__cDESOHflp8cc";

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
const dateSection = document.getElementById("dateSection");

// === AUTH LOGIC ===
let currentUser = null;

async function checkSession() {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user || null;
  updateAuthUI();
  if (currentUser) {
    setToday();
    loadTasksForSelectedDate();
  }
}

function updateAuthUI() {
  if (currentUser) {
    authStatus.textContent = `Logged in as ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    dateSection.style.display = "block";
    organizeBtn.disabled = false;
  } else {
    authStatus.textContent = "Not logged in.";
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    dateSection.style.display = "none";
    organizeBtn.disabled = true;
    tasksContainer.innerHTML = "";
  }
}

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return alert("Sign up error: " + error.message);
  alert("Check your email to confirm your account.");
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Email and password required.");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert("Login error: " + error.message);
  currentUser = data.user;
  updateAuthUI();
  setToday();
  loadTasksForSelectedDate();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateAuthUI();
});

// === DATE HANDLING ===
function setToday() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  taskDateInput.value = today;
}

taskDateInput.addEventListener("change", () => {
  if (currentUser) loadTasksForSelectedDate();
});

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

  data.forEach(task => {
    renderTaskItem(task);
  });
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

// === ORGANIZE BUTTON (AI + SAVE) ===
organizeBtn.addEventListener("click", async () => {
  if (!currentUser) return alert("Please log in first.");
  const dumpText = brainDump.value.trim();
  if (!dumpText) return alert("Please type something first.");

  const date = taskDateInput.value;
  if (!date) return alert("Please choose a date.");

  organizeBtn.disabled = true;
  organizeBtn.textContent = "Organizing…";
  tasksContainer.innerHTML = "";
  funFactContainer.textContent = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: dumpText })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Unknown error from worker.");

    const lines = data.tasksText.split("\n").filter(line => line.trim().startsWith("-"));

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
            priority: priority,
            completed: false
          })
          .select()
          .single();

        if (!error && inserted) {
          renderTaskItem(inserted);
        }
      }
    }

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
