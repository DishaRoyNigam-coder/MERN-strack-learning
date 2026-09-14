// app-esm.js

// 1. Import the default export
import mathDefault from './math-esm.js';

// 2. Import named exports
import {
  add,
  subtract,
  multiply,
  divide,
  power,
  VERSION,
  utils,
} from './math-esm.js';

// 3. Import everything as an object
import * as mathAll from './math-esm.js';

console.log('=== ES Modules Demo ===\n');

// 4. Using named imports
console.log('Add (named):', add(5, 3)); // 8
console.log('Subtract (named):', subtract(10, 4)); // 6
console.log('Multiply (named):', multiply(6, 7)); // 42
console.log('Divide (named):', divide(15, 3)); // 5

// 5. Using default import
console.log('Add (default):', mathDefault.add(5, 3));
console.log('Version (default):', mathDefault.VERSION);

// 6. Using utils
console.log('Square (5):', utils.square(5)); // 25
console.log('PI:', utils.PI); // 3.14159

// 7. Using alias import
import { add as addAlias } from './math-esm.js';
console.log('Alias add:', addAlias(100, 50));

// 8. Using the namespace import
console.log('All imports - add:', mathAll.add(20, 30));

// 9. Dynamic import (async)
const loadMath = async () => {
  const dynamicMath = await import('./math-esm.js');
  console.log('Dynamic import - add:', dynamicMath.add(7, 8));
  console.log('Dynamic import - version:', dynamicMath.VERSION);
};
loadMath();

// 10. Error handling
try {
  console.log('Divide by zero:', divide(10, 0));
} catch (error) {
  console.log('Error:', error.message);
}

console.log('\n✅ ES Modules Demo completed!');