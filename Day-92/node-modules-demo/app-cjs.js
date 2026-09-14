// app-cjs.js

// 1. Import the entire module
const math = require('./math-cjs.js');

console.log('=== CommonJS Demo ===\n');

// 2. Use the imported functions
console.log('Add:', math.add(5, 3)); // 8
console.log('Subtract:', math.subtract(10, 4)); // 6
console.log('Multiply:', math.multiply(6, 7)); // 42
console.log('Divide:', math.divide(15, 3)); // 5

// 3. Use the power function
console.log('Power (2^3):', math.power(2, 3)); // 8
console.log('Square (5):', math.calculator.square(5)); // 25

// 4. Access constants
console.log('PI:', math.calculator.PI); // 3.14159
console.log('Version:', math.VERSION); // 1.0.0

// 5. Error handling
try {
  console.log('Divide by zero:', math.divide(10, 0));
} catch (error) {
  console.log('Error:', error.message);
}

// 6. Destructuring import
const { add: addFn, subtract: subFn } = require('./math-cjs.js');
console.log('Destructured add:', addFn(100, 50));
console.log('Destructured subtract:', subFn(100, 50));

// 7. Dynamic require (conditional import)
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  const devTools = require('./math-cjs.js');
  console.log('Development mode loaded');
}

console.log('\n✅ CommonJS Demo completed!');