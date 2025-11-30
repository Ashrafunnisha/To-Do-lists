const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const progressBar = document.getElementById("progressBar");
const clearCompleted = document.getElementById("clearCompleted");
const themeToggle = document.getElementById("themeToggle");
const emptyMsg = document.getElementById("emptyMsg");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let darkMode = localStorage.getItem("darkMode") === "true";

document.body.classList.toggle("dark", darkMode);
themeToggle.textContent = darkMode ? "☀️" : "🌙";

function renderTasks(filterText = "") {
  taskList.innerHTML = "";
  const filtered = tasks.filter(t =>
    t.text.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) emptyMsg.style.display = "block";
  else emptyMsg.style.display = "none";

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.draggable = true;
    li.className = task.completed ? "completed" : "";

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${index})">
      <div class="task-info">
        <span contenteditable="false">${task.text}</span>
        <div class="task-meta">
          ${task.due ? "📅 " + task.due : ""} | ${task.priority} | ${task.category}
        </div>
      </div>
      <div>
        <button class="edit" onclick="editTask(${index})">✏️</button>
        <button class="delete" onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      saveTasks();
      renderTasks();
    });
    taskList.appendChild(li);
  });

  updateStats();
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") {
    alert("Please enter a task!");
    return;
  }
  tasks.push({
    text,
    completed: false,
    due: dueDate.value || "",
    priority: priority.value,
    category: category.value,
  });
  taskInput.value = "";
  dueDate.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks(searchInput.value);
}

function editTask(index) {
  const li = taskList.children[index];
  const span = li.querySelector("span");
  const btn = li.querySelector(".edit");
  if (span.isContentEditable) {
    span.contentEditable = false;
    btn.textContent = "✏️";
    tasks[index].text = span.textContent.trim();
    saveTasks();
  } else {
    span.contentEditable = true;
    span.focus();
    btn.textContent = "💾";
  }
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(searchInput.value);
  }
}

function clearCompletedTasks() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks(searchInput.value);
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  progressBar.style.width = total ? `${(completed / total) * 100}%` : "0%";
}

// Drag & Drop reorder
taskList.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);
  if (afterElement == null) taskList.appendChild(dragging);
  else taskList.insertBefore(dragging, afterElement);
});
function getDragAfterElement(container, y) {
  const draggable = [...container.querySelectorAll("li:not(.dragging)")];
  return draggable.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  themeToggle.textContent = darkMode ? "☀️" : "🌙";
  localStorage.setItem("darkMode", darkMode);
});

addBtn.addEventListener("click", addTask);
searchInput.addEventListener("input", e => renderTasks(e.target.value));
clearCompleted.addEventListener("click", clearCompletedTasks);
window.addEventListener("load", () => renderTasks());

