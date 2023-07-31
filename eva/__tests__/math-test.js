const assert = require('assert');

module.exports = (eva) => {
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
};
