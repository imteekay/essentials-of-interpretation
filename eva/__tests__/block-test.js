const assert = require('assert');
const { test } = require('./test-util');

module.exports = (eva) => {
  test(
    eva,
    `(begin
      (var x 10)
      (var y 20)
      (+ (* x y) 30))`,
    230,
  );

  test(
    eva,
    `(begin
      (var x 10)
      (begin
        (var x 10)
        x)
      x)`,
    10,
  );

  test(
    eva,
    `(begin
      (var x 10)
      (var result (begin
                    (var y (+ x 10)
                    y)))
      result)`,
    20,
  );

  test(
    eva,
    `(begin
      (var x 10)
      (begin
        (set x 100)
        x)
      x)`,
    100,
  );

  test(
    eva,
    `
      (begin
        (var x 10)
        (var y 20)
        (+ (* x 10) y))
    `,
    120,
  );
};
