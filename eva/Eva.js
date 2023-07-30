const assert = require('assert');
const Environment = require('./Environment');

class Eva {
  constructor(global = new Environment()) {
    this.global = global;
  }

  eval(exp, env = this.global) {
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
      return this.eval(exp[1], env) + this.eval(exp[2], env);
    }

    if (exp[0] === '*') {
      return this.eval(exp[1], env) * this.eval(exp[2], env);
    }

    if (exp[0] === '-') {
      return this.eval(exp[1], env) - this.eval(exp[2], env);
    }

    if (exp[0] === '/') {
      return this.eval(exp[1], env) / this.eval(exp[2], env);
    }

    // ----------------------------------------
    // Variable declaration

    if (exp[0] === 'begin') {
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }

    // ----------------------------------------
    // Variable declaration

    if (exp[0] === 'var') {
      const [_, name, value] = exp;
      return env.define(name, this.eval(value, env));
    }

    // ----------------------------------------
    // Variable update

    if (exp[0] === 'set') {
      const [_, name, value] = exp;
      return env.assign(name, this.eval(value, env));
    }

    // ----------------------------------------
    // Variable access

    if (isVariableName(exp)) {
      return env.lookup(exp);
    }

    throw `Unimple mented ${JSON.stringify(exp)}`;
  }

  _evalBlock(block, env) {
    let result;
    const [_tag, ...expressions] = block;

    expressions.forEach((exp) => {
      result = this.eval(exp, env);
    });

    return result;
  }
}

function isNumber(exp) {
  return typeof exp === 'number';
}

function isString(exp) {
  return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isVariableName(exp) {
  return typeof exp === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(exp);
}

// ----------------------------------------
// Tests:

const eva = new Eva(
  new Environment({
    null: null,
    true: true,
    false: false,
    VERSION: '0.1',
  }),
);

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

// Variables
assert.strictEqual(eva.eval(['var', 'x', 10]), 10);
assert.strictEqual(eva.eval('x'), 10);
assert.strictEqual(eva.eval(['var', 'y', 100]), 100);
assert.strictEqual(eva.eval('y'), 100);

assert.strictEqual(eva.eval('VERSION'), '0.1');
assert.strictEqual(eva.eval(['var', 'isTrue', 'true']), true);

assert.strictEqual(eva.eval(['var', 'z', ['+', 2, 2]]), 4);
assert.strictEqual(eva.eval('z'), 4);

assert.strictEqual(
  eva.eval([
    'begin',
    ['var', 'x', 10],
    ['var', 'y', 20],
    ['+', ['*', 'x', 'y'], 30],
  ]),
  230,
);

assert.strictEqual(
  eva.eval(['begin', ['var', 'x', 10], ['begin', ['var', 'x', 20], 'x'], 'x']),
  10,
);

assert.strictEqual(
  eva.eval([
    'begin',
    ['var', 'x', 10],
    ['var', 'result', ['begin', ['var', 'y', ['+', 'x', 10]], 'y']],
    'result',
  ]),
  20,
);

assert.strictEqual(
  eva.eval(['begin', ['var', 'x', 10], ['begin', ['set', 'x', 100]], 'x']),
  100,
);

console.log('All assertions passed!');
