// src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FaTasks, FaCheckCircle, FaClock, FaUsers } from 'react-icons/fa';

function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, usersData] = await Promise.all([
          api.getTasks(),
          api.getUsers(),
        ]);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: FaTasks, color: 'blue' },
    { label: 'Completed', value: completedTasks, icon: FaCheckCircle, color: 'green' },
    { label: 'In Progress', value: inProgressTasks, icon: FaClock, color: 'yellow' },
    { label: 'Team Members', value: users.length, icon: FaUsers, color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const colorClasses = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
          };
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned to: {users.find(u => u.id === task.assignedTo)?.name || 'Unassigned'}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                task.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;