// src/App.jsx

import { useReducer, useEffect } from 'react';
import { todoReducer, initialState, ACTIONS } from './reducers/todoReducer';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  // 1️⃣ Use useReducer instead of multiple useState calls
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { todos, filter } = state;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: ACTIONS.SET_TODOS, payload: parsed });
      } catch {
        // Ignore
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 2️⃣ Dispatch actions instead of calling state setters
  const addTodo = (text) => {
    dispatch({ type: ACTIONS.ADD_TODO, payload: text });
  };

  const toggleTodo = (id) => {
    dispatch({ type: ACTIONS.TOGGLE_TODO, payload: id });
  };

  const deleteTodo = (id) => {
    dispatch({ type: ACTIONS.DELETE_TODO, payload: id });
  };

  const editTodo = (id, text) => {
    dispatch({ type: ACTIONS.EDIT_TODO, payload: { id, text } });
  };

  const clearCompleted = () => {
    if (todos.some((t) => t.completed)) {
      dispatch({ type: ACTIONS.CLEAR_COMPLETED });
    }
  };

  const setFilter = (filter) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter });
  };

  // 3️⃣ Derived data (filtered todos)
  const getFilteredTodos = () => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  };

  const filteredTodos = getFilteredTodos();
  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = total - completedCount;

  return (
    <div className="app">
      <div className="todo-container">
        <header className="todo-header">
          <h1>✅ Todo List</h1>
          <p>Powered by useReducer</p>
          <div className="header-stats">
            <span>📋 Total: <strong>{total}</strong></span>
            <span>✅ Completed: <strong>{completedCount}</strong></span>
            <span>🔄 Active: <strong>{activeCount}</strong></span>
          </div>
        </header>

        <TodoInput onAddTodo={addTodo} />

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
            <button className="clear-btn" onClick={clearCompleted}>
              Clear Completed
            </button>
          )}
        </div>

        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
        />

        <div className="todo-footer">
          <span className="footer-info">
            💾 Saved to localStorage &nbsp;·&nbsp; 🧩 useReducer managing state
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;