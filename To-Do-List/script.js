// DOM Elements
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('task-priority');
const dueDateInput = document.getElementById('task-due-date');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const clearBtn = document.getElementById('clear-tasks');
const filterButtons = document.querySelectorAll('.task-filters button');
const progressBar = document.getElementById('task-progress');
const progressPercent = document.getElementById('progress-percentage');
const taskForm = document.getElementById('task-form');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Events
document.addEventListener('DOMContentLoaded', loadTasks);
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask();
});
clearBtn.addEventListener('click', clearTasks);
filterButtons.forEach(btn => btn.addEventListener('click', () => filterTasks(btn.dataset.filter)));

taskList.addEventListener('click', function (e) {
  if (e.target.matches('input[type="checkbox"]')) {
    toggleComplete(e.target.closest('li').dataset.id);
  }
  if (e.target.matches('.delete-task')) {
    deleteTask(e.target.closest('li').dataset.id);
  }
});

taskList.addEventListener('blur', function (e) {
  if (e.target.matches('.editable')) {
    editTask(e.target.closest('li').dataset.id, e.target.innerText);
  }
}, true);

// Functions
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  renderTasks();
}

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  let filtered = tasks;
  if (filter === 'active') filtered = tasks.filter(t => !t.completed);
  if (filter === 'completed') filtered = tasks.filter(t => t.completed);

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;
    li.setAttribute('data-priority', task.priority);
    li.innerHTML = `
      <div>
        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark complete">
        <span class="task-priority-dot"></span>
        <span class="editable" contenteditable="true" role="textbox" tabindex="0">${task.text}</span>
        <div class="task-meta">
          ${task.priority.toUpperCase()} | Due: ${task.dueDate || 'None'}
        </div>
      </div>
      <div class="task-actions">
        <button type="button" class="delete-task" aria-label="Delete task">❌</button>
      </div>`;
    taskList.appendChild(li);
  });

  updateProgress();
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now().toString(),
    text,
    completed: false,
    priority: priorityInput.value,
    dueDate: dueDateInput.value
  });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  dueDateInput.value = '';
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id, newText) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = newText.trim();
    saveTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearTasks() {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

function filterTasks(type) {
  renderTasks(type);
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.value = percent;
  progressPercent.innerText = `${percent}%`;
}

// Theme Toggle
const storageKey = 'theme-preference';

const getColorPreference = () => {
  return localStorage.getItem(storageKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
};

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};

const reflectPreference = () => {
  document.firstElementChild.setAttribute('data-theme', theme.value);
  document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
};

const theme = {
  value: getColorPreference()
};

const onClick = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  setPreference();
};

window.onload = () => {
  reflectPreference();
  document.querySelector('#theme-toggle').addEventListener('click', onClick);
};

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
  theme.value = isDark ? 'dark' : 'light';
  setPreference();
});