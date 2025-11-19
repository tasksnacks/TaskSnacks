// script.js for TaskSnacks

const workerUrl = "https://YOUR‐WORKER‐URL";  // <-- Replace with your actual Worker URL

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

document.getElementById("organizeBtn").addEventListener("click", async () => {
  const btn = document.getElementById("organizeBtn");
  const textArea = document.getElementById("brainDump");
  const tasksContainer = document.getElementById("tasksContainer");
  const funFactContainer = document.getElementById("funFactContainer");

  const dumpText = textArea.value.trim();
  if (!dumpText) {
    alert("Please type something first!");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Organizing…";
  tasksContainer.innerHTML = "";
  funFactContainer.textContent = "";

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: dumpText })
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || "Unknown error from worker");
    }

    const tasksText = data.tasksText;
    const lines = tasksText.split("\n").filter(line => line.trim().startsWith("-"));

    lines.forEach(line => {
      const trimmed = line.replace(/^-\s*/, "");
      const match = trimmed.match(/^\[(High|Medium|Low)\]\s*(.+)$/i);
      if (match) {
        const priority = match[1].toLowerCase();
        const text = match[2];

        const div = document.createElement("div");
        div.className = `task-item ${priority}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => {
          const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
          funFactContainer.textContent = `🎉 Fun fact: ${fact}`;
        });

        const label = document.createElement("label");
        label.textContent = text;

        div.appendChild(checkbox);
        div.appendChild(label);
        tasksContainer.appendChild(div);
      }
    });

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Organize My Mess";
    textArea.value = "";
  }
});
