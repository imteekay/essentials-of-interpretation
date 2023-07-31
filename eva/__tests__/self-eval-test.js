const assert = require('assert');

module.exports = (eva) => {
  // numbers
  assert.strictEqual(eva.eval(1), 1);
  assert.strictEqual(eva.eval(2), 2);
  assert.strictEqual(eva.eval(42), 42);

  // strings
  assert.strictEqual(eva.eval('"hello"'), 'hello');
};
