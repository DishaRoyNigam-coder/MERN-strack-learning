// src/components/TodoForm.jsx

import { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onAddTodo }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTodo(trimmed);
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Add a new task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        autoFocus
      />
      <button type="submit" className="todo-add-btn" disabled={!text.trim()}>
        Add
      </button>
    </form>
  );
}

export default TodoForm;