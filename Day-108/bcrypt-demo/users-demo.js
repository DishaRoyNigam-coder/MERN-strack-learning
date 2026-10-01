// users-demo.js

import chalk from 'chalk';
import { hashPassword, comparePassword, parseHash } from './utils/password.js';

// ============================================================
// IN-MEMORY USER STORE
// ============================================================

const users = [];
let nextId = 1;

async function createUser({ name, email, password, role = 'user' }) {
  // Check for duplicate email
  if (users.find(u => u.email === email.toLowerCase())) {
    throw new Error(`Email ${email} is already registered`);
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  const user = {
    id: nextId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return user;
}

async function authenticateUser(email, password) {
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) return null;

  const isValid = await comparePassword(password, user.passwordHash);
  return isValid ? user : null;
}

function getSafeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ============================================================
// DEMO
// ============================================================

async function main() {
  console.log('\n' + chalk.bold.cyan('='.repeat(70)));
  console.log(chalk.bold.cyan('  👥 Users Password Store Demo'));
  console.log(chalk.bold.cyan('='.repeat(70)) + '\n');

  // ---------------------------------------------
  // 1. Create users
  // ---------------------------------------------
  console.log(chalk.yellow('📝 Creating users...\n'));

  const usersToCreate = [
    { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'user' },
    { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'user' }, // Same password as Alice!
    { name: 'Charlie Brown', email: 'charlie@example.com', password: 'charlie@2026!', role: 'editor' },
  ];

  for (const u of usersToCreate) {
    const user = await createUser(u);
    const parsed = parseHash(user.passwordHash);
    console.log(chalk.green(`  ✅ ${user.name}`));
    console.log(chalk.gray(`     Email:  ${user.email}`));
    console.log(chalk.gray(`     Rounds: ${parsed.rounds}`));
    console.log(chalk.gray(`     Hash:   ${user.passwordHash.substring(0, 50)}...`));
    console.log();
  }

  // ---------------------------------------------
  // 2. Show the store
  // ---------------------------------------------
  console.log(chalk.yellow('📊 In-Memory User Store (safe view):\n'));
  console.log(chalk.gray(JSON.stringify(users.map(getSafeUser), null, 2)));
  console.log();

  // ---------------------------------------------
  // 3. Verify same-password hashes differ
  // ---------------------------------------------
  console.log(chalk.yellow('🔍 Verifying salt uniqueness:\n'));

  const alice = users.find(u => u.email === 'alice@example.com');
  const bob = users.find(u => u.email === 'bob@example.com');

  console.log(chalk.gray(`  Alice and Bob both have password "password123"`));
  console.log(chalk.gray(`  Alice hash: ${alice.passwordHash.substring(0, 50)}...`));
  console.log(chalk.gray(`  Bob hash:   ${bob.passwordHash.substring(0, 50)}...`));

  if (alice.passwordHash !== bob.passwordHash) {
    console.log(chalk.green('\n  ✅ Hashes are different (salt is doing its job!)'));
  } else {
    console.log(chalk.red('\n  ❌ Hashes should be different!'));
  }
  console.log();

  // ---------------------------------------------
  // 4. Authenticate
  // ---------------------------------------------
  console.log(chalk.yellow('🔐 Authentication Tests:\n'));

  const tests = [
    { email: 'admin@example.com', password: 'admin123', expected: true },
    { email: 'admin@example.com', password: 'wrong', expected: false },
    { email: 'alice@example.com', password: 'password123', expected: true },
    { email: 'bob@example.com', password: 'password123', expected: true },
    { email: 'bob@example.com', password: 'Password123', expected: false }, // Case-sensitive
    { email: 'unknown@example.com', password: 'anything', expected: false },
  ];

  for (const test of tests) {
    const user = await authenticateUser(test.email, test.password);
    const success = !!user;
    const icon = success === test.expected ? '✅' : '❌';
    const color = success === test.expected ? chalk.green : chalk.red;

    console.log(
      `  ${icon} ${color(`Login: ${test.email} / ${test.password}`)}` +
      ` → ${success ? chalk.green('SUCCESS') : chalk.red('FAILED')}`
    );
  }

  // ---------------------------------------------
  // 5. Security demonstration
  // ---------------------------------------------
  console.log(chalk.yellow('\n🛡️  Security Demonstration:\n'));

  console.log(chalk.gray(`  If the DB leaks, the attacker sees:`));
  console.log(chalk.gray(`    ${users[0].email}: ${users[0].passwordHash.substring(0, 60)}...`));
  console.log();
  console.log(chalk.gray(`  They CANNOT:`));
  console.log(chalk.red(`    ✗ Reverse the hash to get the password`));
  console.log(chalk.red(`    ✗ Use rainbow tables (each salt is unique)`));
  console.log(chalk.red(`    ✗ Brute-force quickly (bcrypt is slow)`));
  console.log();
  console.log(chalk.gray(`  They CAN:`));
  console.log(chalk.yellow(`    ⚠️  Try common passwords one by one`));
  console.log(chalk.yellow(`       (~10 attempts/second per CPU)`));
  console.log(chalk.yellow(`       → Use rate limiting + strong passwords`));

  console.log();

  // ---------------------------------------------
  // Done
  // ---------------------------------------------
  console.log(chalk.bold.cyan('='.repeat(70)));
  console.log(chalk.bold.green('  ✅ Demo complete!'));
  console.log(chalk.bold.cyan('='.repeat(70)) + '\n');
}

main().catch(err => {
  console.error(chalk.red('❌ Error:'), err);
  process.exit(1);
});