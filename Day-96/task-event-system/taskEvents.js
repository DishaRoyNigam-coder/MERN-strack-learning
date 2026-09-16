// taskEvents.js

import { EventEmitter } from 'events';

// Create a custom EventEmitter class
class TaskEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Set max listeners to avoid warnings
    this.setMaxListeners(20);
  }

  // Helper methods for common events
  emitTaskCreated(task) {
    this.emit('task:created', task);
  }

  emitTaskCompleted(task) {
    this.emit('task:completed', task);
  }

  emitTaskDeleted(task) {
    this.emit('task:deleted', task);
  }

  emitTaskAssigned(task, assignee) {
    this.emit('task:assigned', { task, assignee });
  }

  emitTaskOverdue(task) {
    this.emit('task:overdue', task);
  }

  emitError(error) {
    this.emit('error', error);
  }
}

// Export a singleton instance
export const taskEmitter = new TaskEventEmitter();