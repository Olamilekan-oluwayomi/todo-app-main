"use strict";

/**
 * @fileoverview Todo List Application
 *
 * A simple todo app that supports:
 * - Adding, toggling, and deleting tasks
 * - Filtering by All / Active / Completed
 * - Clearing all completed tasks at once
 * - Dark/light theme toggle with system preference detection
 * - Theme persistence via localStorage
 */

// =============================================================================
// STATE
// =============================================================================

/**
 * Central application state. All data lives here.
 * The DOM is always a direct reflection of this object.
 *
 * @type {{ todos: Array<{id: number, text: string, completed: boolean}>, filter: string }}
 */
const state = {
  todos: [],
  filter: "All", // "All" | "Active" | "Completed"
};

// =============================================================================
// DOM REFERENCES
// =============================================================================

/** @type {HTMLFormElement} The input form used to add new todos */
const form = document.querySelector(".todo-list__input-group");

/** @type {HTMLInputElement} The text field inside the form */
const input = document.querySelector(".todo-list__input-group input");

/** @type {HTMLUListElement} The list container where todo items are rendered */
const todoList = document.querySelector(".todo-list__lists");

/** @type {HTMLSpanElement} Displays the count of remaining active items */
const todoListCount = document.querySelector(".todo-list__count");

/** @type {NodeList} All filter buttons across both mobile and desktop navs */
const filterButtons = document.querySelectorAll(".todo-list__button");

/** @type {HTMLButtonElement} The theme toggle button in the header */
const themeToggleBtn = document.querySelector(".todo-list__theme-toggle");

/** @type {HTMLImageElement} The icon inside the theme toggle button */
const themeToggleImg = document.querySelector(".todo-list__theme-toggle img");

// =============================================================================
// THEME — Initialisation
// =============================================================================

/**
 * Icon asset paths used when switching between themes.
 */
const THEME_ICONS = {
  dark: { src: "images/icon-sun.svg", alt: "sun icon" },
  light: { src: "images/icon-moon.svg", alt: "moon icon" },
};

/**
 * Updates the theme toggle button's icon and accessibility label
 * to match the current active theme.
 *
 * @param {boolean} isDark - Whether dark mode is currently active
 */
const updateThemeIcon = function (isDark) {
  const icon = isDark ? THEME_ICONS.dark : THEME_ICONS.light;
  themeToggleImg.src = icon.src;
  themeToggleImg.alt = icon.alt;
  themeToggleBtn.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
};

/**
 * Initialises the theme on page load using this priority order:
 * 1. User's manually saved preference (localStorage)
 * 2. Operating system / browser dark mode preference
 * 3. Default: light theme
 */
const initTheme = function () {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

  document.body.classList.toggle("dark", shouldBeDark);
  updateThemeIcon(shouldBeDark);
};

// =============================================================================
// THEME — Toggle
// =============================================================================

/**
 * Toggles between dark and light theme when the button is clicked.
 * Saves the user's choice to localStorage so it persists on reload.
 */
themeToggleBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  updateThemeIcon(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// =============================================================================
// STATE MODIFIERS
// These functions only ever modify `state` — never the DOM directly.
// After calling one, always call render() to sync the UI.
// =============================================================================

/**
 * Creates a new todo object and appends it to state.todos.
 *
 * @param {string} text - The todo item's display text
 */
const addTodo = function (text) {
  state.todos.push({
    id: Date.now(), // millisecond timestamp — unique enough for client-side use
    text: text,
    completed: false,
  });
};

/**
 * Flips the completed status of a todo item.
 *
 * @param {number} id - The unique ID of the todo to toggle
 */
const toggleTodo = function (id) {
  const todo = state.todos.find((item) => item.id === id);
  if (todo) todo.completed = !todo.completed;
};

/**
 * Permanently removes a todo item from state.
 *
 * @param {number} id - The unique ID of the todo to remove
 */
const deleteTodo = function (id) {
  state.todos = state.todos.filter((item) => item.id !== id);
};

/**
 * Removes all completed todos from state and re-renders.
 */
const clearCompleted = function () {
  state.todos = state.todos.filter((item) => item.completed === false);
  render();
};

// =============================================================================
// RENDER
// The single source of truth for what the DOM looks like.
// Always called after any state change.
// =============================================================================

/**
 * Builds a single todo list item's HTML string.
 *
 * @param {{ id: number, text: string, completed: boolean }} todo
 * @returns {string} HTML markup for the list item
 */
const buildTodoMarkup = function (todo) {
  const completedClass = todo.completed ? "todo-list__text--completed" : "";
  return `
    <li class="todo-list__item" data-id="${todo.id}">
      <span
        class="todo-list__checkbox-container"
        role="checkbox"
        aria-checked="${todo.completed}"
        tabindex="0"
      ></span>
      <span class="todo-list__text ${completedClass}">${todo.text}</span>
      <button
        type="button"
        class="todo-list__delete-btn"
        aria-label="delete an item"
      >
        <img src="images/icon-cross.svg" alt="Delete icon" />
      </button>
    </li>
  `;
};

/**
 * Filters state.todos based on the current state.filter value.
 *
 * @returns {Array} The filtered subset of todos to display
 */
const getFilteredTodos = function () {
  if (state.filter === "Active")
    return state.todos.filter((item) => item.completed === false);

  if (state.filter === "Completed")
    return state.todos.filter((item) => item.completed === true);

  return state.todos; // "All" — also acts as a safe fallback
};

/**
 * Re-renders the entire UI to match the current state:
 * - Filters and displays the todo list
 * - Updates the active item count
 * - Highlights the correct filter button in all navs
 */
const render = function () {
  // 1. Render filtered todo items into the list
  const filteredTodos = getFilteredTodos();
  todoList.innerHTML = filteredTodos.map(buildTodoMarkup).join("");

  // 2. Update the item count (always based on full list, not filtered)
  const activeCount = state.todos.filter((item) => item.completed === false).length;
  todoListCount.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;

  // 3. Sync the active highlight across both mobile and desktop filter buttons
  filterButtons.forEach((btn) => {
    btn.classList.toggle(
      "todo-list__button--active",
      btn.textContent.trim() === state.filter
    );
  });
};

// =============================================================================
// EVENT LISTENERS
// =============================================================================

/**
 * Form submit — adds a new todo from the input field.
 * Prevents empty todos from being added.
 */
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const todoText = input.value.trim();

  if (todoText !== "") {
    addTodo(todoText);
    input.value = "";
    render();
  }
});

/**
 * Todo list click — handles both checkbox toggling and item deletion
 * via event delegation (one listener covers all current and future items).
 *
 * Uses closest() to safely find the right target even if a child
 * element (like the icon inside the delete button) was clicked.
 */
todoList.addEventListener("click", function (e) {
  const listItem = e.target.closest(".todo-list__item");
  if (!listItem) return;

  // dataset.id is always a string — convert back to number for strict comparison
  const id = Number(listItem.dataset.id);

  if (e.target.closest(".todo-list__checkbox-container")) {
    toggleTodo(id);
    render();
  }

  if (e.target.closest(".todo-list__delete-btn")) {
    deleteTodo(id);
    render();
  }
});

/**
 * Clear completed — attached to document so it works even if the button
 * is ever re-rendered into the DOM and loses its direct event listener.
 */
document.addEventListener("click", function (e) {
  if (e.target.closest(".todo-list__clear-btn")) {
    clearCompleted();
  }
});

/**
 * Filter buttons — attached to all buttons across both navs.
 * Updates state.filter and re-renders so both navs stay in sync.
 */
filterButtons.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    state.filter = e.target.textContent.trim();
    render();
  });
});

// =============================================================================
// INIT
// =============================================================================

initTheme();
render();