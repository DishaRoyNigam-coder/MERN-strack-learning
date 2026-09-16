// listeners.js

import chalk from 'chalk';
import { taskEmitter } from './taskEvents.js';

// ============================================================
// 1. LOGGER LISTENER
// ============================================================

export function registerLogger() {
  taskEmitter.on('task:created', (task) => {
    console.log(chalk.blue(`📝 [LOG] Task created: "${task.title}" (ID: ${task.id})`));
  });

  taskEmitter.on('task:completed', (task) => {
    console.log(chalk.green(`✅ [LOG] Task completed: "${task.title}" (ID: ${task.id})`));
  });

  taskEmitter.on('task:deleted', (task) => {
    console.log(chalk.red(`🗑️  [LOG] Task deleted: "${task.title}" (ID: ${task.id})`));
  });

  taskEmitter.on('task:assigned', ({ task, assignee }) => {
    console.log(chalk.yellow(`👤 [LOG] Task "${task.title}" assigned to ${assignee}`));
  });

  taskEmitter.on('task:overdue', (task) => {
    console.log(chalk.bgRed.white(` ⏰ OVERDUE: "${task.title}" (ID: ${task.id}) `));
  });
}

// ============================================================
// 2. NOTIFICATION LISTENER
// ============================================================

export function registerNotifier() {
  taskEmitter.on('task:completed', (task) => {
    // Simulate sending a notification
    console.log(chalk.cyan(`📬 [NOTIFY] Email sent: "Great job completing '${task.title}'!"`));
  });

  taskEmitter.on('task:assigned', ({ task, assignee }) => {
    console.log(chalk.cyan(`📬 [NOTIFY] Notification sent to ${assignee} for task "${task.title}"`));
  });
}

// ============================================================
// 3. ANALYTICS LISTENER
// ============================================================

export function registerAnalytics() {
  const stats = {
    created: 0,
    completed: 0,
    deleted: 0,
    assigned: 0,
  };

  taskEmitter.on('task:created', () => {
    stats.created++;
  });

  taskEmitter.on('task:completed', () => {
    stats.completed++;
  });

  taskEmitter.on('task:deleted', () => {
    stats.deleted++;
  });

  taskEmitter.on('task:assigned', () => {
    stats.assigned++;
  });

  // Expose stats retrieval
  taskEmitter.getStats = () => ({ ...stats });
}

// ============================================================
// 4. ONE-TIME LISTENER (milestone)
// ============================================================

export function registerMilestoneListener() {
  // Only trigger once when the first task is completed
  taskEmitter.once('task:completed', (task) => {
    console.log(chalk.bgGreen.black.bold('\n 🎉 MILESTONE: First task completed! \n'));
    console.log(chalk.green(`   Congratulations on completing "${task.title}"!\n`));
  });
}

// ============================================================
// 5. ERROR LISTENER
// ============================================================

export function registerErrorHandler() {
  taskEmitter.on('error', (error) => {
    console.log(chalk.bgRed.white.bold(` ❌ ERROR `) + ' ' + chalk.red(error.message));
  });
}

// ============================================================
// 6. CUSTOM LISTENER: task_completed (as requested)
// ============================================================

export function registerTaskCompletedListener() {
  console.log(chalk.magenta('🎧 Custom "task_completed" listener registered'));
  console.log(chalk.dim('   Listening for task completion events...\n'));

  taskEmitter.on('task:completed', (task) => {
    console.log(chalk.bgMagenta.white.bold(`\n 🔔 TASK_COMPLETED EVENT `));
    console.log(chalk.magenta(`   Task ID: ${task.id}`));
    console.log(chalk.magenta(`   Title: ${task.title}`));
    console.log(chalk.magenta(`   Assigned to: ${task.assignedTo || 'Unassigned'}`));
    console.log(chalk.magenta(`   Completed at: ${task.completedAt.toLocaleString()}`));
    console.log(chalk.magenta(`   Duration: ${Math.round((task.completedAt - task.createdAt) / 1000)}s\n`));
  });
}

// ============================================================
// 7. REGISTER ALL LISTENERS
// ============================================================

export function registerAllListeners() {
  registerLogger();
  registerNotifier();
  registerAnalytics();
  registerMilestoneListener();
  registerErrorHandler();
  registerTaskCompletedListener();
}