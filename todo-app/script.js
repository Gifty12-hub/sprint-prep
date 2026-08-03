// The single source of truth: every task lives in this array.
// Each task is an object: { id, text, completed }
let tasks = [];
let currentFilter = "all";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const countDisplay = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");

// Add a task when the form is submitted
form.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === "") return;

  tasks.push({
    id: Date.now(),   // simple unique id based on timestamp
    text: text,
    completed: false
  });

  input.value = "";
  render();
});

// Handle clicks inside the list (checkbox toggle + delete)
// One listener on the parent instead of one per item — this is called
// "event delegation": clicks bubble up from the li to the ul.
list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches(".toggle-checkbox")) {
    tasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    render();
  }

  if (e.target.matches(".delete-btn")) {
    tasks = tasks.filter(task => task.id !== id);
    render();
  }
});

// Handle filter button clicks
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// Re-render the whole list from the tasks array.
// This is the core pattern: never touch the DOM directly when
// data changes — change the array, then rebuild the DOM from it.
function render() {
  list.innerHTML = "";

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // "all"
  });

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <input type="checkbox" class="toggle-checkbox" ${task.completed ? "checked" : ""}>
      <span>${escapeHTML(task.text)}</span>
      <button class="delete-btn" aria-label="Delete task">&times;</button>
    `;

    list.appendChild(li);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  countDisplay.textContent = `${remaining} task${remaining === 1 ? "" : "s"} remaining`;
}

// Prevent HTML injection if someone types < or > in a task
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

render(); // initial render on page load