// app.js

// 1. Basic Hello World
console.log('Hello, World!');

// 2. Using the global object
console.log('Hello from Node.js!');

// 3. Display process information
console.log('--- Process Information ---');
console.log('Process ID:', process.pid);
console.log('Platform:', process.platform);
console.log('Node Version:', process.version);
console.log('Current Directory:', process.cwd());

// 4. Command-line arguments
console.log('--- Command-line Arguments ---');
console.log('Arguments:', process.argv.slice(2));

// 5. Environment variables
console.log('--- Environment Variables ---');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// 6. Global objects
console.log('--- Global Objects ---');
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

// 7. Exit event
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

console.log('✅ Script completed successfully!');