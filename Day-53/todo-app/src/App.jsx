// src/App.jsx

import { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import './App.css';

// Helper to generate unique ID
function generateId() {
  return Date.now() + Math.random().toString(36).slice(2);
}

function App() {
  // State for todos
  const [todos, setTodos] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      { id: generateId(), text: 'Learn React', completed: false },
      { id: generateId(), text: 'Build a Todo App', completed: false },
    ];
  });

  // State for filter
  const [filter, setFilter] = useState('all');

  // Save to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // --- Handlers ---
  const addTodo = (text) => {
    const newTodo = { id: generateId(), text, completed: false };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // Derived data: filtered todos
  const getFilteredTodos = () => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  };

  const filteredTodos = getFilteredTodos();

  // Counts for stats
  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = total - completedCount;

  return (
    <div className="app">
      <div className="todo-container">
        <header className="todo-header">
          <h1>✅ Todo List</h1>
          <p>Stay organized and productive</p>
        </header>

        <TodoForm onAddTodo={addTodo} />

        {/* Filter and stats */}
        <div className="todo-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({total})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>
          {completedCount > 0 && (
            <button className="clear-completed-btn" onClick={clearCompleted}>
              Clear Completed
            </button>
          )}
        </div>

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;