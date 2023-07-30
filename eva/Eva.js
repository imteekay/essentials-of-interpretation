const assert = require('assert');

class Eva {
  eval(exp) {
    // ----------------------------------------
    // Self-evaluating expressions

    if (isNumber(exp)) {
      return exp;
    }

    if (isString(exp)) {
      return exp.slice(1, -1);
    }

    // ----------------------------------------
    // Math operations

    if (exp[0] === '+') {
      return this.eval(exp[1]) + this.eval(exp[2]);
    }

    if (exp[0] === '*') {
      return this.eval(exp[1]) * this.eval(exp[2]);
    }

    if (exp[0] === '-') {
      return this.eval(exp[1]) - this.eval(exp[2]);
    }

    if (exp[0] === '/') {
      return this.eval(exp[1]) / this.eval(exp[2]);
    }

    throw 'Unimplemented';
  }
}

function isNumber(exp) {
  return typeof exp === 'number';
}

function isString(exp) {
  return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

// ----------------------------------------
// Tests:

const eva = new Eva();

// numbers
assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval(2), 2);
assert.strictEqual(eva.eval(42), 42);

// strings
assert.strictEqual(eva.eval('"hello"'), 'hello');

// addition
assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
assert.strictEqual(eva.eval(['+', 5, ['+', 3, 2]]), 10);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], ['+', 3, 2]]), 10);
assert.strictEqual(
  eva.eval(['+', ['+', ['+', 1, 2], 2], ['+', ['+', 1, 2], 2]]),
  10,
);

// multiplication
assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11);

// subtraction
assert.strictEqual(eva.eval(['+', ['-', 3, 2], 5]), 6);

// division
assert.strictEqual(eva.eval(['+', ['/', 2, 2], 5]), 6);

console.log('All assertions passed!');
