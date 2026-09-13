// src/components/InfiniteTaskList.jsx

import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment } from 'react';

const fetchTasksPage = async ({ pageParam = 1 }) => {
  const res = await fetch(`http://localhost:5000/tasks?_page=${pageParam}&_limit=5`);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return { data, nextPage: data.length === 5 ? pageParam + 1 : undefined };
};

export default function InfiniteTaskList() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['tasks-infinite'],
    queryFn: fetchTasksPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;

  return (
    <div>
      <ul className="space-y-2">
        {data.pages.map((page, i) => (
          <Fragment key={i}>
            {page.data.map((task) => (
              <li key={task.id} className="p-2 bg-white dark:bg-gray-800 rounded shadow">
                {task.title}
              </li>
            ))}
          </Fragment>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'Nothing more to load'}
        </button>
        {isFetching && !isFetchingNextPage && <span>Refreshing...</span>}
      </div>
    </div>
  );
}