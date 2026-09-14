// math-hybrid.js

// This works for both systems
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

// For ES Modules
export { add, subtract, multiply };

// For CommonJS (if module.exports exists)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { add, subtract, multiply };
}