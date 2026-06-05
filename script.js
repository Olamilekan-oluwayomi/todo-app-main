"use strict";

// Application state model
const state = {
  todos: [], // stored todo items
  filter: "All", // current filter: All, Active, or Completed
};

// DOM references used by the app
const form = document.querySelector(".todo-list__input-group");
const input = document.querySelector(".todo-list__input-group input");
const todoList = document.querySelector(".todo-list__lists");
const todoListCount = document.querySelector(".todo-list__count");
const filterButtons = document.querySelectorAll(".todo-list__button");

// Add a new todo item to state
const addTodo = function (text) {
  const newTodo = {
    id: Date.now(), // unique id based on timestamp
    text: text,
    completed: false,
  };

  state.todos.push(newTodo);
};

// Toggle completed state for a todo by id
const toggleTodo = function (id) {
  const todo = state.todos.find((item) => item.id === id);
  if (todo) todo.completed = !todo.completed;
};

// Remove a todo from state by id
const deleteTodo = function (id) {
  state.todos = state.todos.filter((item) => item.id !== id);
};

// Remove all completed todos from state
const clearCompleted = function () {
  state.todos = state.todos.filter((item) => item.completed === false);
  render();
};

// Render the todo list and related UI state
const render = function () {
  // 1. Apply the current filter to the todo list
  let filteredTodos;
  if (state.filter === "Active") {
    filteredTodos = state.todos.filter((item) => item.completed === false);
  } else if (state.filter === "Completed") {
    filteredTodos = state.todos.filter((item) => item.completed === true);
  } else {
    filteredTodos = state.todos;
  }

  // 2. Build the HTML markup for filtered todos
  let markup = "";
  filteredTodos.forEach((todo) => {
    const completedClass = todo.completed ? "todo-list__text--completed" : "";
    markup += `
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
  });

  // 3. Insert the rendered list into the DOM
  todoList.innerHTML = markup;

  // 4. Update the active-item count display
  const activeCount = state.todos.filter(
    (item) => item.completed === false,
  ).length;
  todoListCount.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;

  // 5. Keep filter buttons synchronized across all filter controls
  filterButtons.forEach((btn) => {
    btn.classList.toggle(
      "todo-list__button--active",
      btn.textContent.trim() === state.filter,
    );
  });
};

// Handle adding a new todo from the form submit event
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const todoText = input.value.trim();

  if (todoText !== "") {
    addTodo(todoText);
    input.value = ""; // clear input after adding
    render();
  }
});

// Handle clicking inside the todo list for toggling or deleting items
todoList.addEventListener("click", function (e) {
  const listItem = e.target.closest(".todo-list__item");
  if (!listItem) return;

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

// Handle the clear completed action from any matching button
document.addEventListener("click", function (e) {
  if (e.target.closest(".todo-list__clear-btn")) {
    clearCompleted();
  }
});

// Handle filter button clicks for both mobile and desktop filter controls
filterButtons.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    state.filter = e.target.textContent.trim();
    render();
  });
});

// Initial render on page load
render();
