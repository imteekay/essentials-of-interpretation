const { test } = require('./test-util');

module.exports = (eva) => {
  test(
    eva,
    `(begin
      (def square (x)
        (* x x))
      
      (square 2)
    )`,
    4,
  );

  test(
    eva,
    `(begin
      (var value 100)
      (def calc (x y)
        (begin
          (var z (+ x y))
          (def inner (w)
            (+ (+ w z) value))))
          inner
      
      (var fn (calc 10 20))
      (fn 30)
    )`,
    160,
  );
};