// DOM Elements
const calendar = document.getElementById("calendar");
const checklist = document.getElementById("checklist");
const tasksContainer = document.getElementById("tasks");
const addTaskButton = document.getElementById("addTask");
const backButton = document.getElementById("backButton");
const progressBarFill = document.querySelector(".progress-bar-fill");
const mysteryModal = document.getElementById("mysteryModal");
const resetButton = document.getElementById("resetButton");
const progressDisplay = document.createElement("div");
progressDisplay.classList.add("progress-display");
progressBarFill.parentElement.insertAdjacentElement("beforebegin", progressDisplay);

// Local Storage for Tasks
let doneTasks = JSON.parse(localStorage.getItem("doneTasks")) || {};
let defaultTasks = {};
const totalDays = 60;
const daysPerPhase = 15;

// Fetch and Load Default Tasks
async function loadDefaultTasks() {
  try {
    const response = await fetch("default_tasks.json");
    if (!response.ok) throw new Error("Failed to fetch default tasks");
    defaultTasks = await response.json();
    generateCalendar();
  } catch (error) {
    console.error("Error loading default tasks:", error);
    alert("Failed to load default tasks. Please try again later.");
  }
}

// Generate Calendar
function generateCalendar() {
  calendar.innerHTML = "";
  const completedDays = Object.keys(doneTasks).filter((dayKey) =>
    doneTasks[dayKey].every((task) => task.done)
  ).length;

  const activePhase = Math.ceil((completedDays + 1) / daysPerPhase);

  for (let phase = 1; phase <= 4; phase++) {
    const phaseDiv = document.createElement("div");
    phaseDiv.classList.add("phase");

    const phaseHeader = document.createElement("div");
    phaseHeader.classList.add("phase-header");
    phaseHeader.textContent = `Phase ${phase}`;
    if (phase === activePhase) {
      phaseHeader.classList.add("active");
    }
    phaseDiv.appendChild(phaseHeader);

    const phaseDays = document.createElement("div");
    phaseDays.classList.add("phase-days");

    for (let i = (phase - 1) * daysPerPhase + 1; i <= phase * daysPerPhase; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("date");
      dayDiv.textContent = `Day ${i}`;

      if (i === 1) {
        dayDiv.classList.add("current");
      }

      if (i % 3 === 0) {
        dayDiv.classList.add("mystery");
        dayDiv.addEventListener("click", () => showMysteryModal());
      }

      if (doneTasks[`Day ${i}`]) {
        dayDiv.classList.add("completed");
      }

      dayDiv.addEventListener("click", () => showChecklist(`Day ${i}`));
      phaseDays.appendChild(dayDiv);
    }

    phaseDiv.appendChild(phaseDays);
    calendar.appendChild(phaseDiv);
  }
  updateProgressBar(completedDays);
}

// Update Progress Bar
function updateProgressBar(completedDays) {
  const progress = (completedDays / totalDays) * 100;
  progressBarFill.style.width = `${progress}%`;
  progressDisplay.textContent = `Progress: ${Math.round(progress)}%`;
}

// Render Tasks for a Day
function renderTasks(day) {
  tasksContainer.innerHTML = "";

  if (!doneTasks[day]) {
    doneTasks[day] = (defaultTasks[day] || []).map((task) => ({ name: task, done: false }));
  }

  const tasks = doneTasks[day];

  tasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    if (task.done) taskDiv.classList.add("done");
    taskDiv.textContent = task.name;
    taskDiv.addEventListener("click", () => toggleTask(day, index));
    tasksContainer.appendChild(taskDiv);
  });

  addTaskButton.onclick = () => addTask(day);
}

// Add a Task
function addTask(day) {
  const taskName = prompt("Enter task:");
  if (!taskName || !taskName.trim()) {
    alert("Task cannot be empty!");
    return;
  }

  doneTasks[day] = doneTasks[day] || [];
  doneTasks[day].push({ name: taskName.trim(), done: false });
  localStorage.setItem("doneTasks", JSON.stringify(doneTasks));
  generateCalendar();
  renderTasks(day);
}

// Toggle Task Completion
function toggleTask(day, taskIndex) {
  doneTasks[day][taskIndex].done = !doneTasks[day][taskIndex].done;
  localStorage.setItem("doneTasks", JSON.stringify(doneTasks));
  generateCalendar();
  renderTasks(day);
}

// Show Checklist
function showChecklist(day) {
  checklist.classList.add("active");
  document.querySelector(".container").style.transform = "translateX(-50%)";
  renderTasks(day);
}

// Hide Checklist
function hideChecklist() {
  checklist.classList.remove("active");
  document.querySelector(".container").style.transform = "translateX(0)";
}

// Show Mystery Modal
function showMysteryModal() {
  mysteryModal.classList.add("active");
  mysteryModal.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    mysteryModal.classList.remove("active");
    mysteryModal.setAttribute("aria-hidden", "true");
  }, 4000);
}

// Reset All Tasks
function reset() {
  localStorage.removeItem("doneTasks");
  doneTasks = {};
  generateCalendar();
  hideChecklist();
  tasksContainer.innerHTML = "";
  addTaskButton.onclick = null;
}

// Event Listeners
resetButton.addEventListener("click", reset);
backButton.addEventListener("click", hideChecklist);

// Load Initial Tasks
loadDefaultTasks();
