const { test } = require('./test-util');

module.exports = (eva) => {
  test(eva, `(print "Hello" "World")`);
};
