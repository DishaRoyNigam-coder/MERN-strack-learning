// server.js

import chalk from 'chalk';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('🔐 Posts API — Cookie-Based JWT Auth'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`🔧 Environment:  ${NODE_ENV}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n🍪 Cookie Configuration:'));
  console.log(chalk.gray('   Name:      auth_token'));
  console.log(chalk.gray('   httpOnly:  true (JS cannot read it)'));
  console.log(chalk.gray('   secure:    ' + (NODE_ENV === 'production' ? 'true' : 'false (dev)')));
  console.log(chalk.gray('   sameSite:  ' + (NODE_ENV === 'production' ? 'strict' : 'lax')));
  console.log(chalk.gray('   maxAge:    7 days'));
  console.log(chalk.yellow('\n🔑 Auth Modes:'));
  console.log(chalk.gray('   1. httpOnly cookie (browser)'));
  console.log(chalk.gray('   2. Bearer header (mobile/API)'));
  console.log(chalk.yellow('\n🧪 Try these:'));
  console.log(chalk.gray('   curl -c cookies.txt -X POST /api/auth/login ...'));
  console.log(chalk.gray('   curl -b cookies.txt /api/auth/me'));
  console.log('='.repeat(60) + '\n');
});