// math-cjs.js

// Private variable (not exported)
const PI = 3.14159;

// Helper function (not exported)
const square = (x) => x * x;

// 1. Export individual functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// 2. Export a function with default parameters
function power(base, exponent = 2) {
  return Math.pow(base, exponent);
}

// 3. Export an object with multiple methods
const calculator = {
  add,
  subtract,
  multiply,
  divide,
  power,
  square,
  PI,
};

// 4. Export using module.exports
module.exports = {
  add,
  subtract,
  multiply,
  divide,
  power,
  calculator,
  // Also export a constant
  VERSION: '1.0.0',
};

// 5. Alternative: exports shorthand
// exports.add = add;
// exports.subtract = subtract;
// exports.multiply = multiply;
// exports.divide = divide;