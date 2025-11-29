const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todosContainer = document.getElementById('todosContainer');
const emptyState = document.getElementById('emptyState');
const liveRegion = document.getElementById('a11y-live-region');

let todos = JSON.parse(localStorage.getItem('accessible-todos') || '[]');
let editIndex = null;

// Reliable announcement function (works with NVDA, VoiceOver, TalkBack)
function announce(message) {
  liveRegion.textContent = '';                // Clear previous
  requestAnimationFrame(() => {
    liveRegion.textContent = message;         // Trigger new announcement
  });
}

function renderTodos() {
  // Remove old cards
  document.querySelectorAll('.todo-card').forEach(card => card.remove());

  if (todos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  todos.forEach((todo, index) => {
    const card = document.createElement('article');
    card.className = 'todo-card';
    card.setAttribute('aria-labelledby', `todo-text-${index}`);
    card.tabIndex = -1;

    card.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" id="check-${index}" ${todo.completed ? 'checked' : ''}>
        <label for="check-${index}" class="todo-text ${todo.completed ? 'completed' : ''}" id="todo-text-${index}">
          ${todo.text}
        </label>
      </div>
      <div class="todo-actions">
        <button class="btn-delete" aria-label="Delete todo: ${todo.text}">Delete</button>
      </div>
    `;

    // Toggle completed
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      todos[index].completed = e.target.checked;
      card.querySelector('.todo-text').classList.toggle('completed', e.target.checked);

      if (e.target.checked) {
        todoInput.value = todos[index].text;
        addBtn.textContent = "Update Todo";
        editIndex = index;
        announce(`Todo marked as completed: ${todos[index].text}. Press Enter or click Update to edit.`);
      } else {
        todoInput.value = '';
        addBtn.textContent = "Add Todo";
        editIndex = null;
        announce(`Todo unmarked as completed: ${todos[index].text}`);
      }

      saveTodos();
    });

    // Delete
    card.querySelector('.btn-delete').addEventListener('click', () => {
      const deletedText = todos[index].text;
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
      announce(`Todo deleted: ${deletedText}`);
    });

    todosContainer.appendChild(card);
  });
}

function saveTodos() {
  localStorage.setItem('accessible-todos', JSON.stringify(todos));
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    announce('Please enter a todo item');
    return;
  }

  if (editIndex !== null) {
    const oldText = todos[editIndex].text;
    todos[editIndex].text = text;
    todos[editIndex].completed = false;
    editIndex = null;
    addBtn.textContent = "Add Todo";
    todoInput.value = '';
    saveTodos();
    renderTodos();
    announce(`Todo updated from "${oldText}" to "${text}"`);
  } else {
    todos.push({ text, completed: false });
    todoInput.value = '';
    saveTodos();
    renderTodos();
    announce(`Todo added: ${text}`);
  }

  todoInput.focus();
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTodo();
  }
});

// Initial render
renderTodos();
todoInput.focus();