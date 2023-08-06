const Eva = require('../Eva');

const tests = [
  require('./self-eval-test'),
  require('./math-test'),
  require('./variables-test'),
  require('./block-test'),
  require('./if-expression-test'),
  require('./while-expression-test'),
  require('./built-in-function-test'),
  require('./print-test'),
  require('./user-defined-function-test'),
  require('./lambda-function-test'),
  require('./switch-test'),
  require('./class-test'),
];

const eva = new Eva();

tests.forEach((test) => test(eva));

console.log('All assertions passed!');
