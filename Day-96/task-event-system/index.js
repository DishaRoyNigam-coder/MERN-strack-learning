// index.js

import chalk from 'chalk';
import figlet from 'figlet';
import { taskManager } from './taskManager.js';
import { taskEmitter } from './taskEvents.js';
import { registerAllListeners } from './listeners.js';

// Display header
console.log(chalk.cyan(figlet.textSync('TaskEvents', { font: 'Standard' })));
console.log(chalk.dim('─'.repeat(60)));
console.log(chalk.italic.gray('  A task management system built with Node.js EventEmitter'));
console.log(chalk.dim('─'.repeat(60)) + '\n');

// Register all listeners
registerAllListeners();

// ============================================================
// DEMO: Simulate a task workflow
// ============================================================

console.log(chalk.bold.yellow('\n🚀 Starting demo workflow...\n'));

// 1. Create tasks
const task1 = taskManager.createTask(
  'Learn EventEmitter',
  'Understand Node.js events deeply',
  'Alice'
);

const task2 = taskManager.createTask(
  'Build custom events',
  'Create task_completed listener',
  'Bob'
);

const task3 = taskManager.createTask(
  'Write documentation',
  'Document the event system',
  'Alice'
);

// 2. Assign a task
setTimeout(() => {
  console.log();
  taskManager.assignTask(task2.id, 'Carol');
}, 500);

// 3. Complete the first task
setTimeout(() => {
  console.log();
  taskManager.completeTask(task1.id);
}, 1000);

// 4. Complete the second task
setTimeout(() => {
  console.log();
  taskManager.completeTask(task2.id);
}, 1500);

// 5. Try to complete an already completed task (error)
setTimeout(() => {
  console.log();
  taskManager.completeTask(task1.id);
}, 2000);

// 6. Try to complete a non-existent task (error)
setTimeout(() => {
  console.log();
  taskManager.completeTask(999);
}, 2200);

// 7. Delete a task
setTimeout(() => {
  console.log();
  taskManager.deleteTask(task3.id);
}, 2500);

// 8. Show final stats
setTimeout(() => {
  console.log('\n' + chalk.dim('─'.repeat(60)));
  console.log(chalk.bold.cyan('📊 FINAL STATS'));
  console.log(chalk.dim('─'.repeat(60)));

  const stats = taskManager.getStats();
  console.log(chalk.white(`   Total tasks: ${chalk.bold(stats.total)}`));
  console.log(chalk.green(`   Completed:   ${chalk.bold(stats.completed)}`));
  console.log(chalk.yellow(`   Pending:     ${chalk.bold(stats.pending)}`));

  const analytics = taskEmitter.getStats();
  console.log('\n' + chalk.bold.cyan('📈 ANALYTICS (from listener)'));
  console.log(chalk.dim('─'.repeat(60)));
  console.log(chalk.white(`   Created:   ${chalk.bold(analytics.created)}`));
  console.log(chalk.white(`   Completed: ${chalk.bold(analytics.completed)}`));
  console.log(chalk.white(`   Deleted:   ${chalk.bold(analytics.deleted)}`));
  console.log(chalk.white(`   Assigned:  ${chalk.bold(analytics.assigned)}`));

  console.log('\n' + chalk.bold.green('✨ Demo completed!\n'));
}, 3000);