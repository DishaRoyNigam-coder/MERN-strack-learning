// src/reducers/todoReducer.js

// Helper to generate unique ID
export function generateId() {
  return Date.now() + Math.random().toString(36).slice(2, 7);
}

// Action Types
export const ACTIONS = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  SET_FILTER: 'SET_FILTER',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED',
  EDIT_TODO: 'EDIT_TODO',
  SET_TODOS: 'SET_TODOS',
};

// Initial state
export const initialState = {
  todos: [],
  filter: 'all',
};

// Reducer function
export function todoReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TODOS:
      return {
        ...state,
        todos: action.payload,
      };

    case ACTIONS.ADD_TODO: {
      const newTodo = {
        id: generateId(),
        text: action.payload,
        completed: false,
      };
      return {
        ...state,
        todos: [newTodo, ...state.todos],
      };
    }

    case ACTIONS.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case ACTIONS.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    case ACTIONS.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        ),
      };

    case ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };

    case ACTIONS.CLEAR_COMPLETED:
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };

    default:
      return state;
  }
}