// server.js

import chalk from 'chalk';
import app from './src/app.js';
import { getAllowedOrigins } from './src/config/cors.js';
import { emailConfig } from './src/config/email.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  const origins = getAllowedOrigins();
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('🔐 Posts API — Cookie-Based JWT Auth'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`🔧 Environment:  ${NODE_ENV}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));

  console.log(chalk.yellow('\n📋 Allowed Origins:'));
  origins.forEach((origin) => {
    console.log(chalk.green(`   ✅ ${origin}`));
  });
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

  console.log(chalk.yellow('\n📤 File Uploads:'));
  console.log(chalk.gray('   Upload directory:  uploads/'));
  console.log(chalk.gray('   Max file size:     5 MB'));
  console.log(chalk.gray('   Allowed types:     jpg, jpeg, png, webp, gif'));
  console.log(chalk.gray('   Avatar size:       400x400'));

  console.log(chalk.yellow('\n📧 Email Configuration:'));
  console.log(chalk.gray(`   Service:  ${emailConfig.service}`));
  console.log(chalk.gray(`   From:     ${emailConfig.from}`));
  if (emailConfig.service === 'nodemailer') {
    console.log(chalk.gray(`   SMTP:     ${emailConfig.smtp.host}:${emailConfig.smtp.port}`));
  }
  console.log(chalk.gray(`   Enabled:  ${emailConfig.enabled ? '✅' : '❌'}`));

  console.log(chalk.yellow('\n🧪 Try these:'));
  console.log(chalk.gray('   curl -c cookies.txt -X POST /api/auth/login ...'));
  console.log(chalk.gray('   curl -b cookies.txt /api/auth/me'));
  console.log('='.repeat(60) + '\n');
});