const assert = require('assert');

module.exports = (eva) => {
  assert.strictEqual(eva.eval(['+', 1, 5]), 6);
  assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);
  assert.strictEqual(eva.eval(['+', 5, ['+', 3, 2]]), 10);
  assert.strictEqual(eva.eval(['+', ['+', 3, 2], ['+', 3, 2]]), 10);
  assert.strictEqual(
    eva.eval(['+', ['+', ['+', 1, 2], 2], ['+', ['+', 1, 2], 2]]),
    10,
  );

  assert.strictEqual(eva.eval(['+', ['*', 3, 2], 5]), 11);

  assert.strictEqual(eva.eval(['+', ['-', 3, 2], 5]), 6);

  assert.strictEqual(eva.eval(['+', ['/', 2, 2], 5]), 6);
};
