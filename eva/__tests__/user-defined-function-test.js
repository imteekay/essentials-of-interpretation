const { test } = require('./test-util');

module.exports = (eva) => {
  test(eva,
    `(begin
      (def square (x)
        (* x x))
      
      (square 2)
    )`, 4);


  test(eva,
    `(begin
      (var x 10)
      (def foo () x)
      (def bar ()
        (begin
          (var x 20)
          (+ (foo) x)))
      
      (bar)
    )`, 30);
};
