#!/usr/bin/env node
// The line above makes the script executable on Unix systems

// ============================================================
// IMPORTS
// ============================================================

const os = require('os');
const path = require('path');
const url = require('url');
const fs = require('fs');

// ============================================================
// 1. PATH MODULE DEMO
// ============================================================

function demonstratePathModule() {
  console.log('\n' + '='.repeat(60));
  console.log('📁 PATH MODULE');
  console.log('='.repeat(60));

  // Join paths
  const joined = path.join('/users', 'john', 'documents', 'file.txt');
  console.log('path.join():', joined);

  // Resolve to absolute path
  const resolved = path.resolve('folder', 'subfolder', 'file.txt');
  console.log('path.resolve():', resolved);

  // Get file name
  const fullPath = '/users/john/documents/report.pdf';
  console.log('path.basename():', path.basename(fullPath));

  // Get directory
  console.log('path.dirname():', path.dirname(fullPath));

  // Get extension
  console.log('path.extname():', path.extname(fullPath));

  // Parse path
  const parsed = path.parse(fullPath);
  console.log('path.parse():', JSON.stringify(parsed, null, 2));

  // Format path
  const formatted = path.format({
    dir: '/users/john',
    name: 'report',
    ext: '.pdf',
  });
  console.log('path.format():', formatted);

  // Check if absolute
  console.log('path.isAbsolute("/absolute"):', path.isAbsolute('/absolute'));
  console.log('path.isAbsolute("relative"):', path.isAbsolute('relative'));

  // Normalize path
  console.log('path.normalize():', path.normalize('/users//john/../jane/file.txt'));

  // Path separator
  console.log('path.sep:', path.sep);
  console.log('Platform: ', process.platform);
  console.log('Path separator differs by OS!');

  // Special paths
  console.log('\n__dirname:', __dirname);
  console.log('__filename:', __filename);
  console.log('path.join(__dirname, "test.txt"):', path.join(__dirname, 'test.txt'));
}

// ============================================================
// 2. OS MODULE DEMO
// ============================================================

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function demonstrateOsModule() {
  console.log('\n' + '='.repeat(60));
  console.log('💻 OS MODULE');
  console.log('='.repeat(60));

  // Basic info
  console.log('\n📌 Platform Info:');
  console.log('Platform: ', os.platform());
  console.log('Architecture: ', os.arch());
  console.log('OS Type: ', os.type());
  console.log('Release: ', os.release());
  console.log('Hostname: ', os.hostname());

  // System info
  console.log('\n🖥️  System Info:');
  console.log('Total Memory: ', formatBytes(os.totalmem()));
  console.log('Free Memory: ', formatBytes(os.freemem()));
  console.log('Used Memory: ', formatBytes(os.totalmem() - os.freemem()));
  const memPercent = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1);
  console.log('Memory Usage: ', `${memPercent}%`);
  console.log('Uptime: ', formatUptime(os.uptime()));
  console.log('Temp Directory: ', os.tmpdir());
  console.log('Home Directory: ', os.homedir());

  // CPU info
  const cpus = os.cpus();
  console.log('\n⚙️  CPU Info:');
  console.log('CPU Model: ', cpus[0].model);
  console.log('CPU Count: ', cpus.length);
  console.log('CPU Speed: ', `${cpus[0].speed} MHz`);
  console.log('CPU Times: ', JSON.stringify(cpus[0].times, null, 2));

  // User info
  const user = os.userInfo();
  console.log('\n👤 User Info:');
  console.log('Username: ', user.username);
  console.log('User ID: ', user.uid);
  console.log('Group ID: ', user.gid);
  console.log('Shell: ', user.shell);
  console.log('Home Dir: ', user.homedir);

  // Network interfaces
  console.log('\n🌐 Network Interfaces:');
  const nets = os.networkInterfaces();
  for (const [name, addresses] of Object.entries(nets)) {
    console.log(`  ${name}:`);
    addresses.forEach((addr) => {
      console.log(`    - ${addr.family}: ${addr.address}`);
      console.log(`      Internal: ${addr.internal ? 'Yes' : 'No'}`);
      console.log(`      MAC: ${addr.mac}`);
    });
  }

  // Load average (Unix only)
  if (os.platform() !== 'win32') {
    console.log('\n📊 Load Average (1min, 5min, 15min):');
    console.log('  ', os.loadavg().map(l => l.toFixed(2)).join(', '));
  }

  // Constants
  console.log('\n📋 OS Constants:');
  console.log('Endianness: ', os.endianness());
  console.log('EOL Character: ', JSON.stringify(os.EOL));
  console.log('Dev Null: ', os.devNull);
}

// ============================================================
// 3. URL MODULE DEMO
// ============================================================

function demonstrateUrlModule() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 URL MODULE');
  console.log('='.repeat(60));

  // Parse a URL
  const urlString = 'https://user:pass@api.example.com:8080/v1/users?page=2&limit=10&sort=name#results';
  const myURL = new url.URL(urlString);

  console.log('\n📌 Parsing URL:');
  console.log('Full URL: ', myURL.href);
  console.log('Protocol: ', myURL.protocol);
  console.log('Username: ', myURL.username);
  console.log('Password: ', myURL.password);
  console.log('Hostname: ', myURL.hostname);
  console.log('Port: ', myURL.port);
  console.log('Pathname: ', myURL.pathname);
  console.log('Search: ', myURL.search);
  console.log('Hash: ', myURL.hash);
  console.log('Origin: ', myURL.origin);
  console.log('Host: ', myURL.host);

  // Search params
  console.log('\n🔍 Search Params:');
  const params = myURL.searchParams;
  console.log('All params:');
  params.forEach((value, key) => {
    console.log(`  ${key} = ${value}`);
  });
  console.log('Get "page":', params.get('page'));
  console.log('Get "limit":', params.get('limit'));
  console.log('Has "sort":', params.has('sort'));
  console.log('All keys:', Array.from(params.keys()));

  // Modify URL
  console.log('\n✏️  Modifying URL:');
  myURL.pathname = '/v2/users';
  myURL.searchParams.set('page', '3');
  myURL.searchParams.append('filter', 'active');
  myURL.searchParams.delete('sort');
  console.log('Modified URL:', myURL.href);

  // Build URL from scratch
  console.log('\n🔨 Building URL:');
  const builtURL = new url.URL('https://example.com');
  builtURL.pathname = '/api/products';
  builtURL.searchParams.set('category', 'electronics');
  builtURL.searchParams.set('minPrice', '100');
  builtURL.searchParams.set('maxPrice', '500');
  console.log('Built URL:', builtURL.href);

  // URLSearchParams standalone
  console.log('\n📝 URLSearchParams Standalone:');
  const standaloneParams = new url.URLSearchParams({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  });
  console.log('Params string: ', standaloneParams.toString());
  console.log('With spaces encoded:', standaloneParams.toString());
  console.log('Get "name":', standaloneParams.get('name'));

  // Relative URL resolution
  console.log('\n🔄 Resolving Relative URLs:');
  const baseURL = new url.URL('https://example.com/api/v1/');
  const relativeURL = new url.URL('users/123', baseURL);
  console.log('Base: ', baseURL.href);
  console.log('Relative: ', 'users/123');
  console.log('Resolved: ', relativeURL.href);
}

// ============================================================
// 4. COMBINED EXAMPLE: Project Info
// ============================================================

function showProjectInfo() {
  console.log('\n' + '='.repeat(60));
  console.log('📦 PROJECT INFO');
  console.log('='.repeat(60));

  // Read package.json
  const packagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('\nProject:', packageData.name);
    console.log('Version:', packageData.version);
    console.log('Description:', packageData.description || 'N/A');
    console.log('Main:', packageData.main);
    console.log('Scripts:', Object.keys(packageData.scripts || {}).join(', '));
  } else {
    console.log('No package.json found');
  }

  // Build paths for common project files
  console.log('\n📂 Common Project Paths:');
  const commonPaths = [
    'package.json',
    'index.js',
    'src/app.js',
    'public/index.html',
    'tests/app.test.js',
  ];

  commonPaths.forEach((file) => {
    const fullPath = path.join(__dirname, file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${file.padEnd(25)} ${exists ? '✅' : '❌'}`);
  });
}

// ============================================================
// 5. SYSTEM INFO SUMMARY
// ============================================================

function showSystemSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYSTEM SUMMARY');
  console.log('='.repeat(60));

  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

  const summary = {
    'Operating System': `${os.type()} ${os.release()}`,
    'Platform': os.platform(),
    'Architecture': os.arch(),
    'Hostname': os.hostname(),
    'CPU': cpus[0].model.trim(),
    'CPU Cores': cpus.length,
    'CPU Speed': `${cpus[0].speed} MHz`,
    'Total Memory': formatBytes(totalMem),
    'Used Memory': formatBytes(usedMem),
    'Free Memory': formatBytes(freeMem),
    'Memory Usage': `${memPercent}%`,
    'System Uptime': formatUptime(os.uptime()),
    'Node Version': process.version,
    'V8 Version': process.versions.v8,
    'User': os.userInfo().username,
    'Home Directory': os.homedir(),
    'Temp Directory': os.tmpdir(),
    'Current Working Dir': process.cwd(),
    'Script Directory': __dirname,
    'Path Separator': path.sep,
    'Endianness': os.endianness(),
  };

  // Print as a formatted table
  const maxKeyLen = Math.max(...Object.keys(summary).map(k => k.length));
  Object.entries(summary).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(maxKeyLen + 2)} : ${value}`);
  });
}

// ============================================================
// 6. MAIN CLI
// ============================================================

function showHelp() {
  console.log(`
  📊 SYSTEM INFO CLI

  Usage: node index.js <command>

  Commands:
    all          Show all information (path + os + url + project)
    path         Show path module demo
    os           Show OS module demo
    url          Show URL module demo
    project      Show project information
    summary      Show compact system summary
    help         Show this help

  Examples:
    node index.js all
    node index.js summary
    node index.js os
  `);
}

const command = process.argv[2] || 'all';

console.log('\n🚀 System Info CLI');
console.log('Node.js', process.version);
console.log('Started at:', new Date().toLocaleString());

switch (command) {
  case 'all':
    demonstratePathModule();
    demonstrateOsModule();
    demonstrateUrlModule();
    showProjectInfo();
    showSystemSummary();
    break;

  case 'path':
    demonstratePathModule();
    break;

  case 'os':
    demonstrateOsModule();
    break;

  case 'url':
    demonstrateUrlModule();
    break;

  case 'project':
    showProjectInfo();
    break;

  case 'summary':
    showSystemSummary();
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  default:
    console.log(`❌ Unknown command: ${command}`);
    showHelp();
    break;
}

console.log('\n✅ Done!\n');