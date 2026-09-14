// math-esm.js

// Private variable (not exported)
const PI = 3.14159;

// Helper function (not exported)
const square = (x) => x * x;

// 1. Export individual functions
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// 2. Export with default parameters
export function power(base, exponent = 2) {
  return Math.pow(base, exponent);
}

// 3. Export a constant
export const VERSION = '1.0.0';

// 4. Export an object with utilities (named export)
export const utils = {
  square,
  PI,
};

// 5. Default export (can be anything)
export default {
  add,
  subtract,
  multiply,
  divide,
  power,
  utils,
  VERSION,
};

// 6. Alternative: export at the end
// export { add, subtract, multiply, divide, power, VERSION, utils };