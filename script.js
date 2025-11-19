// === RENDER TASK ITEM ===
function renderTaskItem(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.priority || "low"}`;
  div.dataset.taskId = task.id;

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
      // 🎉 AI fun fact via worker
      try {
        const res = await fetch(workerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "funfact" })
        });
        const data = await res.json();
        if (data.ok && data.funFact) {
          funFactContainer.textContent = `🎉 Fun fact: ${data.funFact}`;
        } else {
          const fallback = funFacts[Math.floor(Math.random() * funFacts.length)];
          funFactContainer.textContent = `🎉 Fun fact: ${fallback}`;
        }
      } catch (e) {
        const fallback = funFacts[Math.floor(Math.random() * funFacts.length)];
        funFactContainer.textContent = `🎉 Fun fact: ${fallback}`;
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

  // Move up / down (visual only)
  const upBtn = document.createElement("button");
  upBtn.textContent = "↑";
  upBtn.title = "Move up";
  upBtn.className = "task-move";
  upBtn.addEventListener("click", () => {
    const prev = div.previousElementSibling;
    if (prev && prev.classList.contains("task-item")) {
      tasksContainer.insertBefore(div, prev);
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
    }
  });

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  deleteBtn.title = "Delete task";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    div.remove();
    // Update calendar highlight if this was last task that day
    renderCalendar();
  });

  controls.appendChild(prioritySelect);
  controls.appendChild(upBtn);
  controls.appendChild(downBtn);
  controls.appendChild(deleteBtn);

  div.appendChild(left);
  div.appendChild(controls);
  tasksContainer.appendChild(div);
}
