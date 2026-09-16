// greeting.js

import chalk from 'chalk';
import figlet from 'figlet';
import os from 'os';

// Get user info
const username = os.userInfo().username;
const platform = os.platform();

// Get time-based greeting
const hour = new Date().getHours();
let greeting;
if (hour < 12) greeting = 'Good Morning';
else if (hour < 18) greeting = 'Good Afternoon';
else greeting = 'Good Evening';

// Display ASCII greeting
const asciiGreeting = figlet.textSync(greeting, {
  font: 'Standard',
  horizontalLayout: 'default',
});

console.log(chalk.cyan(asciiGreeting));

// Personalized message
console.log(chalk.bold.green(`  👋 Hello, ${chalk.yellow(username)}!`));
console.log(chalk.dim(`  Platform: ${platform}`));
console.log(chalk.dim(`  Time: ${new Date().toLocaleTimeString()}`));
console.log();

// Colorful quote
const quotes = [
  'Code is poetry.',
  'Talk is cheap. Show me the code.',
  'First, solve the problem. Then, write the code.',
  'Simplicity is the soul of efficiency.',
  'The best error message is the one that never shows up.',
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
console.log(chalk.italic.magenta(`  💡 "${randomQuote}"`));
console.log();