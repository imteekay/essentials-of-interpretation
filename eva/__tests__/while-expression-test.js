const assert = require('assert');

/**
 * (while <condition>
 *     <consequent>
 *     <alternate>)
 */

module.exports = (eva) => {
  assert.strictEqual(eva.eval(
    ['begin',
      ['var', 'counter', 0],
      ['var', 'result', 0],

      ['while', ['<', 'counter', 10],
        ['begin',
          ['set', 'counter', ['+', 'counter', 1]],
          ['set', 'result', ['+', 'result', 1]]
        ]
      ],

      'result'
    ]),
  10);
};
