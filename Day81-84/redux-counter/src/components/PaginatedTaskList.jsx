// src/components/PaginatedTaskList.jsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchTasksPage = async (page = 1) => {
  const res = await fetch(`http://localhost:5000/tasks?_page=${page}&_limit=5`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function PaginatedTaskList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => fetchTasksPage(page),
    keepPreviousData: true, // keeps previous data while loading new page
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <ul className="space-y-2">
        {data.map((task) => (
          <li key={task.id} className="p-2 bg-white dark:bg-gray-800 rounded shadow">
            {task.title}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={data?.length < 5}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
        {isFetching && <span className="px-4 py-2">Loading...</span>}
      </div>
    </div>
  );
}