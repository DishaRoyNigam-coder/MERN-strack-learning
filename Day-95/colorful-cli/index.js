// index.js

// Since chalk v5+ is ESM-only, we need to use dynamic import
// OR configure the project as ESM

// ============================================================
// Approach 1: ES Modules (Recommended)
// ============================================================
// Add "type": "module" to package.json first

import chalk from 'chalk';
import figlet from 'figlet';

console.log('🎨 Colorful CLI Demo\n');

// ============================================================
// 1. FIGLET - ASCII Art
// ============================================================

console.log(figlet.textSync('Hello!', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

// Different fonts
console.log('--- Different Fonts ---\n');

console.log('Block font:');
console.log(figlet.textSync('NPM', { font: 'Block' }));

console.log('\nGhost font:');
console.log(figlet.textSync('Cool', { font: 'Ghost' }));

console.log('\nBanner font:');
console.log(figlet.textSync('CLI', { font: 'Banner' }));

console.log('\nBig font:');
console.log(figlet.textSync('JS', { font: 'Big' }));

// ============================================================
// 2. CHALK - Colors & Styles
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('🎨 CHALK COLORS');
console.log('='.repeat(60) + '\n');

// Basic colors
console.log(chalk.red('Red text'));
console.log(chalk.green('Green text'));
console.log(chalk.blue('Blue text'));
console.log(chalk.yellow('Yellow text'));
console.log(chalk.magenta('Magenta text'));
console.log(chalk.cyan('Cyan text'));
console.log(chalk.white('White text'));
console.log(chalk.gray('Gray text'));

// Background colors
console.log('\n--- Background Colors ---');
console.log(chalk.bgRed('Red background'));
console.log(chalk.bgGreen('Green background'));
console.log(chalk.bgBlue('Blue background'));
console.log(chalk.bgYellow('Yellow background'));
console.log(chalk.bgMagenta('Magenta background'));
console.log(chalk.bgCyan('Cyan background'));

// Text styles
console.log('\n--- Text Styles ---');
console.log(chalk.bold('Bold text'));
console.log(chalk.dim('Dim text'));
console.log(chalk.italic('Italic text'));
console.log(chalk.underline('Underlined text'));
console.log(chalk.inverse('Inverse text'));
console.log(chalk.strikethrough('Strikethrough text'));

// Combining styles
console.log('\n--- Combined Styles ---');
console.log(chalk.bold.red('Bold Red'));
console.log(chalk.underline.blue.bgYellow('Underlined Blue on Yellow'));
console.log(chalk.bold.italic.magenta('Bold Italic Magenta'));

// Hex colors (Chalk v5+)
console.log('\n--- Hex Colors ---');
console.log(chalk.hex('#FF5733')('Custom orange color'));
console.log(chalk.hex('#8B5CF6')('Custom purple color'));
console.log(chalk.rgb(255, 100, 200)('RGB color'));

// ============================================================
// 3. TEMPLATES
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📋 TEMPLATES');
console.log('='.repeat(60) + '\n');

// Success message
const success = chalk.bgGreen.black.bold(' ✅ SUCCESS ') + ' ' + chalk.green('Operation completed!');
console.log(success);

// Error message
const error = chalk.bgRed.white.bold(' ❌ ERROR ') + ' ' + chalk.red('Something went wrong!');
console.log(error);

// Warning message
const warning = chalk.bgYellow.black.bold(' ⚠️  WARNING ') + ' ' + chalk.yellow('Please review!');
console.log(warning);

// Info message
const info = chalk.bgBlue.white.bold(' ℹ️  INFO ') + ' ' + chalk.blue('For your information');
console.log(info);

// ============================================================
// 4. BUILD A NICE HEADER
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('🎨 BEAUTIFUL HEADER');
console.log('='.repeat(60) + '\n');

// Big ASCII header with color
const header = figlet.textSync('ColorCLI', {
  font: 'Standard',
  horizontalLayout: 'full',
});

console.log(chalk.cyan(header));

// Subheader
console.log(chalk.dim('─'.repeat(60)));
console.log(chalk.italic.gray('  A beautiful CLI built with chalk & figlet'));
console.log(chalk.dim('─'.repeat(60)));
console.log();

// ============================================================
// 5. PRACTICAL: A TASK LIST CLI
// ============================================================

console.log('='.repeat(60));
console.log('📝 TASK LIST');
console.log('='.repeat(60) + '\n');

const tasks = [
  { id: 1, text: 'Learn Node.js', done: true },
  { id: 2, text: 'Master NPM', done: true },
  { id: 3, text: 'Build a CLI tool', done: false },
  { id: 4, text: 'Deploy to production', done: false },
];

tasks.forEach((task) => {
  const checkbox = task.done ? chalk.green('✓') : chalk.gray('○');
  const text = task.done ? chalk.dim.strikethrough(task.text) : chalk.white(task.text);
  const id = chalk.yellow(`[${task.id}]`);
  console.log(`  ${checkbox} ${id} ${text}`);
});

// Summary
const completed = tasks.filter(t => t.done).length;
const total = tasks.length;
console.log();
console.log(chalk.bold(`  Progress: ${chalk.green(completed)}/${total}`));
console.log(chalk.dim(`  ${'█'.repeat(completed * 5)}${'░'.repeat((total - completed) * 5)}`));

// ============================================================
// 6. TABLE OUTPUT
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('📊 TABLE OUTPUT');
console.log('='.repeat(60) + '\n');

const data = [
  { name: 'Alice', role: 'Developer', status: 'Active' },
  { name: 'Bob', role: 'Designer', status: 'Away' },
  { name: 'Carol', role: 'Manager', status: 'Active' },
];

// Calculate column widths
const nameWidth = Math.max(6, ...data.map(d => d.name.length));
const roleWidth = Math.max(6, ...data.map(d => d.role.length));
const statusWidth = Math.max(8, ...data.map(d => d.status.length));

// Header
console.log(
  chalk.bold.cyan(
    'Name'.padEnd(nameWidth + 2) +
    'Role'.padEnd(roleWidth + 2) +
    'Status'.padEnd(statusWidth + 2)
  )
);
console.log(chalk.cyan('─'.repeat(nameWidth + roleWidth + statusWidth + 6)));

// Rows
data.forEach((row) => {
  const statusColor = row.status === 'Active' ? chalk.green : chalk.yellow;
  console.log(
    chalk.white(row.name.padEnd(nameWidth + 2)) +
    chalk.white(row.role.padEnd(roleWidth + 2)) +
    statusColor(row.status.padEnd(statusWidth + 2))
  );
});

// ============================================================
// 7. SPINNER-LIKE LOADING (Simulated)
// ============================================================

console.log('\n' + '='.repeat(60));
console.log('⏳ LOADING DEMO');
console.log('='.repeat(60) + '\n');

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let frameIndex = 0;

const loadingInterval = setInterval(() => {
  process.stdout.write(
    '\r  ' + chalk.cyan(spinnerFrames[frameIndex]) + ' ' + chalk.gray('Loading...')
  );
  frameIndex = (frameIndex + 1) % spinnerFrames.length;
}, 100);

// Simulate loading for 2 seconds
setTimeout(() => {
  clearInterval(loadingInterval);
  process.stdout.write('\r  ' + chalk.green('✓') + ' ' + chalk.white('Done!') + '\n');
  console.log();
  console.log(chalk.bold.green('  ✨ All done! Thanks for using ColorCLI!\n'));
}, 2000);

// ============================================================
// 8. GRADIENT / RAINBOW TEXT
// ============================================================

setTimeout(() => {
  console.log('='.repeat(60));
  console.log('🌈 RAINBOW TEXT');
  console.log('='.repeat(60) + '\n');

  const text = 'NPM IS AWESOME!';
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

  // Print each character in a different color
  let output = '  ';
  for (let i = 0; i < text.length; i++) {
    const color = colors[i % colors.length];
    output += chalk[color].bold(text[i]);
  }
  console.log(output);

  // Big rainbow figlet
  const rainbowText = figlet.textSync('RAINBOW', { font: 'Standard' });
  const lines = rainbowText.split('\n');
  lines.forEach((line, lineIndex) => {
    let coloredLine = '';
    for (let i = 0; i < line.length; i++) {
      const color = colors[(i + lineIndex) % colors.length];
      coloredLine += chalk[color](line[i]);
    }
    console.log(coloredLine);
  });

  console.log();
  console.log(chalk.dim('─'.repeat(60)));
  console.log(chalk.italic.center
    ? chalk.italic('  Built with ❤️  using Node.js, Chalk, and Figlet')
    : chalk.italic('  Built with ❤️  using Node.js, Chalk, and Figlet'));
  console.log(chalk.dim('─'.repeat(60)) + '\n');
}, 2500);