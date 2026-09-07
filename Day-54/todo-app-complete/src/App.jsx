// src/App.jsx

import { useState, useEffect, useRef } from 'react';
import './App.css';

// ============================================================
// 🚀 HELPER: Generate unique ID
// ============================================================
function generateId() {
  return Date.now() + Math.random().toString(36).slice(2, 7);
}

// ============================================================
// 🚀 MAIN APP COMPONENT
// ============================================================
function App() {
  // --- State ---
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Initial seed data
    return [
      { id: generateId(), text: 'Learn React', completed: true },
      { id: generateId(), text: 'Build a Todo App', completed: false },
      { id: generateId(), text: 'Master useState and useEffect', completed: false },
    ];
  });

  const [filter, setFilter] = useState('all');
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // --- Persist to localStorage ---
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // --- Focus input on mount ---
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // --- Focus edit input when editing starts ---
  useEffect(() => {
    if (isEditing !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // ============================================================
  // 🚀 CRUD OPERATIONS
  // ============================================================

  const addTodo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTodo = { id: generateId(), text: trimmed, completed: false };
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    // Animate deletion by adding a class before removing
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    if (todoElement) {
      todoElement.classList.add('deleting');
      setTimeout(() => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      }, 300);
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  const startEdit = (id, text) => {
    setIsEditing(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setIsEditing(null);
      return;
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: trimmed } : todo
      )
    );
    setIsEditing(null);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditText('');
  };

  const clearCompleted = () => {
    const hasCompleted = todos.some((t) => t.completed);
    if (!hasCompleted) return;
    if (window.confirm('Delete all completed tasks?')) {
      setTodos((prev) => prev.filter((todo) => !todo.completed));
    }
  };

  const clearAll = () => {
    if (todos.length === 0) return;
    if (window.confirm('Delete all tasks?')) {
      setTodos([]);
    }
  };

  // ============================================================
  // 🚀 DERIVED DATA
  // ============================================================

  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completionPercentage = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  const getFilteredTodos = () => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  };

  const filteredTodos = getFilteredTodos();

  // ============================================================
  // 🚀 HANDLERS
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setInputText('');
      if (isEditing !== null) cancelEdit();
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit(isEditing);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // ============================================================
  // 🚀 RENDER
  // ============================================================

  return (
    <div className="app">
      <div className="todo-container">
        {/* --- Header --- */}
        <header className="todo-header">
          <h1>✅ Todo List</h1>
          <p>Stay organized and productive</p>
          <div className="header-stats">
            <span className="stat-item">
              📋 Total: <strong>{totalTodos}</strong>
            </span>
            <span className="stat-item">
              ✅ Completed: <strong>{completedTodos}</strong>
            </span>
            <span className="stat-item">
              🔄 Active: <strong>{activeTodos}</strong>
            </span>
          </div>
        </header>

        {/* --- Progress Bar --- */}
        <div className="progress-section">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="progress-label">
            {completionPercentage}% complete
          </span>
        </div>

        {/* --- Add Form --- */}
        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="todo-input"
            placeholder="Add a new task..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
          />
          <button
            type="submit"
            className="todo-add-btn"
            disabled={!inputText.trim()}
          >
            Add Task
          </button>
        </form>

        {/* --- Controls: Filters + Clear --- */}
        <div className="todo-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="filter-count">{totalTodos}</span>
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active <span className="filter-count">{activeTodos}</span>
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed <span className="filter-count">{completedTodos}</span>
            </button>
          </div>

          <div className="action-buttons">
            {completedTodos > 0 && (
              <button className="clear-completed-btn" onClick={clearCompleted}>
                Clear Completed
              </button>
            )}
            {totalTodos > 0 && (
              <button className="clear-all-btn" onClick={clearAll}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* --- Todo List --- */}
        {filteredTodos.length === 0 ? (
          <div className="todo-empty">
            <span className="empty-icon">
              {totalTodos === 0 ? '📝' : '🔍'}
            </span>
            <h3>
              {totalTodos === 0
                ? 'No tasks yet!'
                : filter === 'active'
                ? 'All tasks completed! 🎉'
                : filter === 'completed'
                ? 'No completed tasks yet.'
                : 'No tasks found.'}
            </h3>
            <p>
              {totalTodos === 0
                ? 'Add your first task above.'
                : filter === 'active'
                ? 'You\'ve completed everything!'
                : filter === 'completed'
                ? 'Complete some tasks to see them here.'
                : 'Try adjusting your filter.'}
            </p>
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                data-id={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />

                {isEditing === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className="todo-edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={() => saveEdit(todo.id)}
                    maxLength={200}
                  />
                ) : (
                  <span
                    className="todo-text"
                    onDoubleClick={() => startEdit(todo.id, todo.text)}
                  >
                    {todo.text}
                  </span>
                )}

                <div className="todo-actions">
                  {!isEditing || isEditing !== todo.id ? (
                    <button
                      className="todo-edit-btn"
                      onClick={() => startEdit(todo.id, todo.text)}
                      aria-label="Edit task"
                    >
                      ✏️
                    </button>
                  ) : (
                    <>
                      <button
                        className="todo-save-btn"
                        onClick={() => saveEdit(todo.id)}
                        aria-label="Save edit"
                      >
                        💾
                      </button>
                      <button
                        className="todo-cancel-btn"
                        onClick={cancelEdit}
                        aria-label="Cancel edit"
                      >
                        ✕
                      </button>
                    </>
                  )}
                  <button
                    className="todo-delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* --- Footer with Keyboard Shortcuts --- */}
        <div className="todo-footer">
          <span className="footer-shortcuts">
            <kbd>⌘</kbd> + <kbd>Enter</kbd> Add task &nbsp;·&nbsp;
            <kbd>Esc</kbd> Cancel &nbsp;·&nbsp;
            <kbd>Double-click</kbd> Edit
          </span>
          <span className="footer-storage">
            💾 Saved to localStorage
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;