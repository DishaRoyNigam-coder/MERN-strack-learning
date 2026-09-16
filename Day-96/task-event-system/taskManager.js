// taskManager.js

import { taskEmitter } from './taskEvents.js';

class TaskManager {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  createTask(title, description, assignedTo) {
    const task = {
      id: this.nextId++,
      title,
      description,
      assignedTo,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.push(task);
    taskEmitter.emitTaskCreated(task);
    return task;
  }

  completeTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      taskEmitter.emitError(new Error(`Task ${id} not found`));
      return null;
    }
    if (task.status === 'completed') {
      taskEmitter.emitError(new Error(`Task ${id} is already completed`));
      return task;
    }
    task.status = 'completed';
    task.completedAt = new Date();
    taskEmitter.emitTaskCompleted(task);
    return task;
  }

  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      taskEmitter.emitError(new Error(`Task ${id} not found`));
      return false;
    }
    const [task] = this.tasks.splice(index, 1);
    taskEmitter.emitTaskDeleted(task);
    return true;
  }

  assignTask(id, assignee) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      taskEmitter.emitError(new Error(`Task ${id} not found`));
      return null;
    }
    task.assignedTo = assignee;
    taskEmitter.emitTaskAssigned(task, assignee);
    return task;
  }

  getTask(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getStats() {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'pending').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
    };
  }
}

export const taskManager = new TaskManager();