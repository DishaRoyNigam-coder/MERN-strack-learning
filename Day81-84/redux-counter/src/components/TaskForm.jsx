// src/components/TaskForm.jsx

import { useState } from 'react';
import { useCreateTask } from '../hooks/useTaskMutations';

function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate(
      { title, description, status: 'pending', priority: 'medium' },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={createTask.isPending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {createTask.isPending ? 'Adding...' : '+ Add Task'}
        </button>
      </div>
      {createTask.isError && (
        <p className="mt-2 text-red-500 text-sm">❌ {createTask.error.message}</p>
      )}
    </form>
  );
}

export default TaskForm;