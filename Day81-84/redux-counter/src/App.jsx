// src/App.jsx

import TaskList from './components/TaskList';

function App() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Task List</h1>
      <TaskList />
    </div>
  );
}

export default App;