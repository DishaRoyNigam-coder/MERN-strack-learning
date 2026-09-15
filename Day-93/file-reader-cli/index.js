// index.js

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify callback-based functions
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// ============================================================
// 1. SYNC FILE OPERATIONS
// ============================================================

const syncOps = {
  // Read a file synchronously
  readSync: (filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(`📖 Read ${filePath} (${data.length} characters)`);
      return data;
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
      return null;
    }
  },

  // Write a file synchronously
  writeSync: (filePath, data) => {
    try {
      fs.writeFileSync(filePath, data, 'utf8');
      console.log(`✅ Written to ${filePath} (${data.length} characters)`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing ${filePath}:`, error.message);
      return false;
    }
  },

  // Append to a file synchronously
  appendSync: (filePath, data) => {
    try {
      fs.appendFileSync(filePath, data + '\n', 'utf8');
      console.log(`✅ Appended to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error appending to ${filePath}:`, error.message);
      return false;
    }
  },

  // Get file info synchronously
  statSync: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return {
        path: filePath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        permissions: stats.mode,
      };
    } catch (error) {
      console.error(`❌ Error getting stats for ${filePath}:`, error.message);
      return null;
    }
  },

  // Read directory synchronously
  readDirSync: (dirPath) => {
    try {
      const items = fs.readdirSync(dirPath);
      console.log(`📁 Directory ${dirPath} contains ${items.length} items`);
      return items;
    } catch (error) {
      console.error(`❌ Error reading directory ${dirPath}:`, error.message);
      return null;
    }
  },

  // Check if file exists
  existsSync: (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  },
};

// ============================================================
// 2. ASYNC FILE OPERATIONS (Callbacks)
// ============================================================

const asyncOps = {
  // Read a file asynchronously (callback)
  readAsync: (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        console.error(`❌ Error reading ${filePath}:`, error.message);
        callback(error, null);
        return;
      }
      console.log(`📖 Read ${filePath} (${data.length} characters)`);
      callback(null, data);
    });
  },

  // Write a file asynchronously (callback)
  writeAsync: (filePath, data, callback) => {
    fs.writeFile(filePath, data, 'utf8', (error) => {
      if (error) {
        console.error(`❌ Error writing ${filePath}:`, error.message);
        callback(error);
        return;
      }
      console.log(`✅ Written to ${filePath} (${data.length} characters)`);
      callback(null);
    });
  },

  // Append to a file asynchronously (callback)
  appendAsync: (filePath, data, callback) => {
    fs.appendFile(filePath, data + '\n', 'utf8', (error) => {
      if (error) {
        console.error(`❌ Error appending to ${filePath}:`, error.message);
        callback(error);
        return;
      }
      console.log(`✅ Appended to ${filePath}`);
      callback(null);
    });
  },
};

// ============================================================
// 3. ASYNC FILE OPERATIONS (Promises / Async/Await)
// ============================================================

const promiseOps = {
  // Read a file asynchronously (Promise)
  readPromise: async (filePath) => {
    try {
      const data = await readFileAsync(filePath, 'utf8');
      console.log(`📖 Read ${filePath} (${data.length} characters)`);
      return data;
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
      return null;
    }
  },

  // Write a file asynchronously (Promise)
  writePromise: async (filePath, data) => {
    try {
      await writeFileAsync(filePath, data, 'utf8');
      console.log(`✅ Written to ${filePath} (${data.length} characters)`);
      return true;
    } catch (error) {
      console.error(`❌ Error writing ${filePath}:`, error.message);
      return false;
    }
  },

  // Get file info (Promise)
  statPromise: async (filePath) => {
    try {
      const stats = await statAsync(filePath);
      return {
        path: filePath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      console.error(`❌ Error getting stats for ${filePath}:`, error.message);
      return null;
    }
  },

  // Read directory (Promise)
  readDirPromise: async (dirPath) => {
    try {
      const items = await readdirAsync(dirPath);
      console.log(`📁 Directory ${dirPath} contains ${items.length} items`);
      return items;
    } catch (error) {
      console.error(`❌ Error reading directory ${dirPath}:`, error.message);
      return null;
    }
  },
};

// ============================================================
// 4. CLI FUNCTIONS
// ============================================================

// Helper: print file info
function printFileInfo(info) {
  if (!info) return;
  console.log(`📄 File: ${info.path}`);
  console.log(`   Size: ${info.size} bytes`);
  console.log(`   Type: ${info.isFile ? 'File' : info.isDirectory ? 'Directory' : 'Other'}`);
  console.log(`   Created: ${info.created?.toLocaleString()}`);
  console.log(`   Modified: ${info.modified?.toLocaleString()}`);
  console.log(`   Permissions: ${info.permissions || 'N/A'}`);
}

// Display help
function showHelp() {
  console.log(`
  📁 FILE READER CLI TOOL

  Usage:
    node index.js <command> <filepath> [options]

  Commands:
    read <file>               Read a file (synchronous)
    read-async <file>         Read a file (asynchronous)
    read-promise <file>       Read a file (Promise/async)
    write <file> <content>    Write to a file
    append <file> <content>   Append to a file
    stat <file>               Get file information
    ls <directory>            List directory contents
    exists <file>             Check if file exists
    help                      Show this help

  Examples:
    node index.js read sample.txt
    node index.js write output.txt "Hello, World!"
    node index.js stat package.json
    node index.js ls ./src
  `);
}

// ============================================================
// 5. MAIN CLI
// ============================================================

const command = process.argv[2];
const filePath = process.argv[3];
const content = process.argv.slice(4).join(' ');

switch (command) {
  case 'read':
    console.log('\n🔍 Reading file (SYNC)...\n');
    const data = syncOps.readSync(filePath);
    if (data) {
      console.log('--- Content ---');
      console.log(data);
      console.log('--- End ---');
    }
    break;

  case 'read-async':
    console.log('\n🔍 Reading file (ASYNC callback)...\n');
    asyncOps.readAsync(filePath, (error, data) => {
      if (data) {
        console.log('--- Content ---');
        console.log(data);
        console.log('--- End ---');
      }
    });
    break;

  case 'read-promise':
    console.log('\n🔍 Reading file (ASYNC Promise)...\n');
    (async () => {
      const data = await promiseOps.readPromise(filePath);
      if (data) {
        console.log('--- Content ---');
        console.log(data);
        console.log('--- End ---');
      }
    })();
    break;

  case 'write':
    console.log('\n✍️ Writing file (SYNC)...\n');
    syncOps.writeSync(filePath, content || 'Default content');
    break;

  case 'append':
    console.log('\n📝 Appending to file (SYNC)...\n');
    syncOps.appendSync(filePath, content || 'Appended content');
    break;

  case 'stat':
    console.log('\n📊 Getting file info...\n');
    const info = syncOps.statSync(filePath);
    printFileInfo(info);
    break;

  case 'stat-promise':
    console.log('\n📊 Getting file info (Promise)...\n');
    (async () => {
      const info = await promiseOps.statPromise(filePath);
      printFileInfo(info);
    })();
    break;

  case 'ls':
    console.log('\n📁 Listing directory...\n');
    const items = syncOps.readDirSync(filePath || '.');
    if (items) {
      items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item}`);
      });
    }
    break;

  case 'exists':
    console.log('\n🔍 Checking if file exists...\n');
    const exists = syncOps.existsSync(filePath);
    console.log(`${filePath}: ${exists ? '✅ Exists' : '❌ Does not exist'}`);
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log('Run "node index.js help" for usage.');
    break;
}