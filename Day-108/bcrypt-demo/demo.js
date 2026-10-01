// demo.js

import chalk from 'chalk';
import {
  hashPassword,
  comparePassword,
  generateSalt,
  parseHash,
  isBcryptHash,
  benchmark,
} from './utils/password.js';

// ============================================================
// PRETTY LOGGING
// ============================================================

function header(text) {
  console.log('\n' + chalk.bold.cyan('='.repeat(70)));
  console.log(chalk.bold.cyan(`  ${text}`));
  console.log(chalk.bold.cyan('='.repeat(70)) + '\n');
}

function section(text) {
  console.log('\n' + chalk.bold.yellow(`▶ ${text}`));
}

function pass(text) {
  console.log(chalk.green(`  ✅ ${text}`));
}

function fail(text) {
  console.log(chalk.red(`  ❌ ${text}`));
}

function info(label, value) {
  console.log(`  ${chalk.gray(label.padEnd(20))} ${chalk.white(value)}`);
}

// ============================================================
// MAIN DEMO
// ============================================================

async function runDemo() {
  header('🔐 bcrypt Password Hashing Demo');

  // ============================================================
  // 1. BASIC HASHING
  // ============================================================

  section('1. Basic Hashing');

  const password = 'mySecretPassword123';
  info('Original password:', password);

  const hash = await hashPassword(password);
  info('Hash:', hash.substring(0, 60) + '...');
  info('Hash length:', `${hash.length} characters`);
  info('Is bcrypt hash:', isBcryptHash(hash));

  // ============================================================
  // 2. THE SAME PASSWORD HASHES DIFFERENTLY EACH TIME
  // ============================================================

  section('2. Same Password → Different Hashes (Random Salt)');

  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(password);
  const hash3 = await hashPassword(password);

  info('Hash 1:', hash1.substring(0, 50) + '...');
  info('Hash 2:', hash2.substring(0, 50) + '...');
  info('Hash 3:', hash3.substring(0, 50) + '...');

  if (hash1 !== hash2 && hash2 !== hash3) {
    pass('All hashes are different (each has a unique salt)');
  } else {
    fail('Hashes should be different!');
  }

  // ============================================================
  // 3. PARSING THE HASH
  // ============================================================

  section('3. Anatomy of a bcrypt Hash');

  const parsed = parseHash(hash);
  info('Version:', parsed.version);
  info('Rounds (cost):', parsed.rounds);
  info('Salt (22 chars):', parsed.salt);
  info('Hash (31 chars):', parsed.hash);

  console.log(chalk.gray('\n  Breakdown of the hash string:'));
  console.log(`    ${chalk.magenta('$' + parsed.version)}${chalk.gray('$')}${chalk.yellow(parsed.rounds)}${chalk.gray('$')}${chalk.cyan(parsed.salt)}${chalk.green(parsed.hash)}`);
  console.log(`    ${chalk.magenta('└─version')}  ${chalk.yellow('└─cost')}  ${chalk.cyan('└─salt (22 chars)')}   ${chalk.green('└─hash (31 chars)')}`);

  // ============================================================
  // 4. COMPARING PASSWORDS
  // ============================================================

  section('4. Comparing Passwords');

  const correctPassword = 'mySecretPassword123';
  const wrongPassword = 'wrongPassword456';

  const correctMatch = await comparePassword(correctPassword, hash);
  const wrongMatch = await comparePassword(wrongPassword, hash);

  if (correctMatch) {
    pass(`"${correctPassword}" matches the hash`);
  } else {
    fail(`"${correctPassword}" should have matched!`);
  }

  if (!wrongMatch) {
    pass(`"${wrongPassword}" does NOT match the hash`);
  } else {
    fail(`"${wrongPassword}" should NOT have matched!`);
  }

  // ============================================================
  // 5. THE COST FACTOR (ROUNDS)
  // ============================================================

  section('5. Cost Factor Benchmark');

  console.log(chalk.gray('  Testing how long hashing takes at different rounds:\n'));

  for (const rounds of [4, 8, 10, 12, 14]) {
    const time = await benchmark(rounds);
    const bar = '█'.repeat(Math.min(50, Math.floor(time / 20)));
    const color = time < 50 ? chalk.green : time < 200 ? chalk.yellow : chalk.red;
    console.log(`  ${chalk.gray(String(rounds).padStart(2))} rounds │ ${String(time).padStart(5)}ms │ ${color(bar)}`);
  }

  console.log(chalk.gray('\n  💡 Recommendation: aim for ~250ms on production hardware'));
  console.log(chalk.gray('     (typically 10-12 rounds).\n'));

  // ============================================================
  // 6. WHY SALTS MATTER
  // ============================================================

  section('6. Why Salts Matter');

  console.log(chalk.gray('  Without salt: two users with the SAME password get the SAME hash.'));
  console.log(chalk.gray('  With bcrypt: each hash is unique, even for identical passwords.\n'));

  // Simulate two users with the same password
  const samePassword = 'password123';
  const user1Hash = await hashPassword(samePassword);
  const user2Hash = await hashPassword(samePassword);

  info('User 1 password:', samePassword);
  info('User 1 hash:', user1Hash.substring(0, 50) + '...');
  info('User 2 password:', samePassword);
  info('User 2 hash:', user2Hash.substring(0, 50) + '...');

  if (user1Hash !== user2Hash) {
    pass('Same password, different hashes → rainbow tables defeated');
  }

  // ============================================================
  // 7. THE 72-BYTE LIMIT
  // ============================================================

  section('7. The 72-Byte Limit');

  console.log(chalk.gray('  bcrypt only uses the first 72 bytes of a password.\n'));

  const longPassword1 = 'a'.repeat(72) + 'AAA';
  const longPassword2 = 'a'.repeat(72) + 'BBB';

  const longHash1 = await hashPassword(longPassword1);
  const longHash2 = await hashPassword(longPassword2);

  // Both should match because first 72 bytes are identical
  const longMatch1 = await comparePassword(longPassword1, longHash2);
  const longMatch2 = await comparePassword(longPassword2, longHash1);

  if (longMatch1 && longMatch2) {
    console.log(chalk.yellow('  ⚠️  Two different passwords (differing only after byte 72) match the same hash!'));
    console.log(chalk.yellow('     This is why we validate password length.'));
  }

  // ============================================================
  // 8. HANDLING INVALID INPUT
  // ============================================================

  section('8. Handling Invalid Input');

  // Empty password
  try {
    await hashPassword('');
    fail('Empty password should have thrown');
  } catch (error) {
    pass(`Empty password rejected: ${error.message}`);
  }

  // Too long password
  try {
    await hashPassword('a'.repeat(100));
    fail('Long password should have thrown');
  } catch (error) {
    pass(`Long password rejected: ${error.message}`);
  }

  // Invalid rounds
  try {
    await hashPassword('password', 2);
    fail('Invalid rounds should have thrown');
  } catch (error) {
    pass(`Invalid rounds rejected: ${error.message}`);
  }

  // Comparing against invalid hash
  const invalidCompare = await comparePassword('password', 'not-a-hash');
  if (!invalidCompare) {
    pass('Invalid hash comparison safely returned false');
  }

  // ============================================================
  // 9. A REAL-WORLD FLOW
  // ============================================================

  section('9. Real-World Registration + Login Flow');

  // Simulated in-memory database
  const users = [];

  async function register(name, email, password) {
    const passwordHash = await hashPassword(password);
    const user = {
      id: users.length + 1,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return { ...user, passwordHash: '[hidden]' }; // Return safe version
  }

  async function login(email, password) {
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, reason: 'User not found' };

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) return { success: false, reason: 'Invalid password' };

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  }

  // Register
  console.log(chalk.gray('  Registering user:'));
  const registered = await register('Alice Johnson', 'alice@example.com', 'alice2026!');
  info('Name:', registered.name);
  info('Email:', registered.email);
  info('Stored passwordHash:', registered.passwordHash);
  console.log(chalk.gray(`\n  Raw DB record (passwordHash not shown):`));
  console.log(chalk.gray(`    ${JSON.stringify({ ...registered, passwordHash: '<bcrypt hash>' })}\n`));

  // Login correctly
  console.log(chalk.gray('  Attempting login with correct password:'));
  const goodLogin = await login('alice@example.com', 'alice2026!');
  if (goodLogin.success) {
    pass(`Login successful for ${goodLogin.user.name}`);
  }

  // Login with wrong password
  console.log(chalk.gray('  Attempting login with wrong password:'));
  const badLogin = await login('alice@example.com', 'wrong-password');
  if (!badLogin.success) {
    pass(`Login rejected: ${badLogin.reason}`);
  }

  // ============================================================
  // 10. COMMON MISTAKES
  // ============================================================

  section('10. Common Mistakes to Avoid');

  console.log(chalk.red('  ❌ Comparing with ==='));
  console.log(chalk.gray(`     hash1 === hash2 is always false for bcrypt`));

  console.log(chalk.green('  ✅ Use bcrypt.compare()'));
  console.log(chalk.gray(`     bcrypt.compare() extracts the salt and re-hashes\n`));

  console.log(chalk.red('  ❌ Using SHA-256 for passwords'));
  console.log(chalk.gray(`     Too fast → 10 billion hashes per second on a GPU\n`));

  console.log(chalk.green('  ✅ Use bcrypt with 10-12 rounds'));
  console.log(chalk.gray(`     ~250ms per hash on production hardware\n`));

  console.log(chalk.red('  ❌ Storing the password or logging it'));
  console.log(chalk.gray(`     Never write passwords to logs, files, or console\n`));

  console.log(chalk.green('  ✅ Only store the hash'));
  console.log(chalk.gray(`     And never expose it in API responses\n`));

  // ============================================================
  // DONE
  // ============================================================

  header('🎉 Demo Complete');
  console.log(chalk.green('  Key takeaways:'));
  console.log(chalk.gray('    ✓ bcrypt is slow by design → prevents brute force'));
  console.log(chalk.gray('    ✓ Salt is random + included in the hash'));
  console.log(chalk.gray('    ✓ Rounds control the cost (use 10-12)'));
  console.log(chalk.gray('    ✓ Always use bcrypt.compare() to verify'));
  console.log(chalk.gray('    ✓ Never log or expose passwords or hashes'));
  console.log();
}

runDemo().catch(err => {
  console.error(chalk.red('❌ Demo failed:'), err);
  process.exit(1);
});