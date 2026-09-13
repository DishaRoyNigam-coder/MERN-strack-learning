// src/components/TaskList.jsx

import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/tasks';

function TaskList() {
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getTasks,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>❌ {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks?.map((task) => (
        <li
          key={task.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="font-medium">{task.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
          <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            {task.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;