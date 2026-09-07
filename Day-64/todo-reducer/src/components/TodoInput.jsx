// src/components/TodoInput.jsx

import { useState, useRef, useEffect } from 'react';
import './TodoInput.css';

function TodoInput({ onAddTodo }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTodo(trimmed);
    setText('');
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="todo-input"
        placeholder="What do you need to do?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
      />
      <button type="submit" className="todo-add-btn" disabled={!text.trim()}>
        Add Task
      </button>
    </form>
  );
}

export default TodoInput;