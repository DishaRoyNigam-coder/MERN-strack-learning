// src/components/TodoItem.jsx

import './TodoItem.css';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span className="todo-text">{todo.text}</span>
      <button className="todo-delete-btn" onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  );
}

export default TodoItem;