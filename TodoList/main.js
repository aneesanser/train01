const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todosContainer = document.getElementById('todosContainer');
const emptyState = document.getElementById('emptyState');

let todos = JSON.parse(localStorage.getItem('accessible-todos') || '[]');

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
    card.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      todos[index].completed = e.target.checked;
      card.querySelector('.todo-text').classList.toggle('completed', e.target.checked);
      saveTodos();
    });

    // Delete
    card.querySelector('.btn-delete').addEventListener('click', () => {
      const deletedText = todos[index].text;
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
      announce(`${deletedText} deleted`);
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
  todos.push({ text, completed: false });
  todoInput.value = '';
  saveTodos();
  renderTodos();
  announce(`Todo added: ${text}`);
  todoInput.focus();
}

function announce(message) {
  const el = document.createElement('div');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTodo();
  }
});

// Initial render + focus
renderTodos();
todoInput.focus();