const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');

class Eva {
  constructor(global = GlobalEnvironment) {
    this.global = global;
    this._transformer = new Transformer();
  }

  /**
   * Evaluates global code wrapping into a block.
   */
  evalGlobal(exp) {
    return this._evalBody(exp, this.global);
  }

  eval(exp, env = this.global) {
    // ----------------------------------------
    // Self-evaluating expressions

    if (this._isNumber(exp)) {
      return exp;
    }

    if (this._isString(exp)) {
      return exp.slice(1, -1);
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
      const [_, ref, value] = exp;

      // Assignment to a property

      if (ref[0] === 'prop') {
        const [_tag, instance, propName] = ref;
        const instanceEnv = this.eval(instance, env);
        return instanceEnv.define(propName, this.eval(value, env));
      }

      // Simple assignment

      return env.assign(ref, this.eval(value, env));
    }

    // ----------------------------------------
    // Variable access

    if (this._isVariableName(exp)) {
      return env.lookup(exp);
    }

    // ----------------------------------------
    // if-expression

    if (exp[0] === 'if') {
      const [_tag, condition, consequent, alternate] = exp;
      if (this.eval(condition, env)) {
        return this.eval(consequent, env);
      }
      return this.eval(alternate, env);
    }

    // ----------------------------------------
    // while-expression

    if (exp[0] === 'while') {
      const [_, condition, body] = exp;
      let result;

      while (this.eval(condition, env)) {
        result = this.eval(body, env);
      }

      return result;
    }

    // ----------------------------------------
    // function declarations
    // syntatic sugar for lambda

    if (exp[0] === 'def') {
      const varExp = this._transformer.transformDefToVarLambda(exp);
      return this.eval(varExp, env);
    }

    // ----------------------------------------
    // switch expressions
    // syntatic sugar for nested if expressions

    if (exp[0] === 'switch') {
      const ifExp = this._transformer.transformSwitchToIf(exp);
      return this.eval(ifExp, env);
    }

    // ----------------------------------------
    // Lambda function

    if (exp[0] === 'lambda') {
      const [_tag, params, body] = exp;
      return {
        params,
        body,
        env, // closure
      };
    }

    // ----------------------------------------
    // Class declaration

    if (exp[0] === 'class') {
      const [_tag, name, parent, body] = exp;
      const evalParent = this.eval(parent, env);
      const parentEnv = evalParent || env;
      const classEnv = new Environment({}, parentEnv);
      this._evalBody(body, classEnv);
      return env.define(name, classEnv);
    }

    // ----------------------------------------
    // Super expression

    if (exp[0] === 'super') {
      const [_tag, className] = exp;
      return this.eval(className, env).parent;
    }

    // ----------------------------------------
    // Class instantiation

    if (exp[0] === 'new') {
      const classEnv = this.eval(exp[1], env);
      const instanceEnv = new Environment({}, classEnv);
      const args = exp.slice(2).map((arg) => this.eval(arg, env));

      this._callUserDefinedFunction(classEnv.lookup('constructor'), [
        instanceEnv,
        ...args,
      ]);

      return instanceEnv;
    }

    // ----------------------------------------
    // Property access

    if (exp[0] === 'prop') {
      const [_tag, instance, name] = exp;
      const instanceEnv = this.eval(instance, env);
      return instanceEnv.lookup(name);
    }

    // ----------------------------------------
    // function calls
    //
    // (print "Hello World")
    // (+ 1 1)
    // (> 1 1)

    if (Array.isArray(exp)) {
      const fn = this.eval(exp[0], env);
      const args = exp.slice(1).map((expression) => this.eval(expression, env));

      // Native functions

      if (typeof fn === 'function') {
        return fn(...args);
      }

      // User-defined functions

      return this._callUserDefinedFunction(fn, args);
    }

    throw `Unimplemented ${JSON.stringify(exp)}`;
  }

  _callUserDefinedFunction(fn, args) {
    const activationRecord = {};

    fn.params.forEach((param, index) => {
      activationRecord[param] = args[index];
    });

    const activationEnv = new Environment(activationRecord, fn.env);

    return this._evalBody(fn.body, activationEnv);
  }

  _evalBody(body, env) {
    return body[0] === 'begin'
      ? this._evalBlock(body, env)
      : this.eval(body, env);
  }

  _evalBlock(block, env) {
    let result;
    const [_tag, ...expressions] = block;

    expressions.forEach((exp) => {
      result = this.eval(exp, env);
    });

    return result;
  }

  _isNumber(exp) {
    return typeof exp === 'number';
  }

  _isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
  }

  _isVariableName(exp) {
    return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]*$/.test(exp);
  }
}

const GlobalEnvironment = new Environment({
  null: null,
  true: true,
  false: false,
  VERSION: '0.1',

  //math

  '+': (op1, op2) => {
    return op1 + op2;
  },

  '-': (op1, op2 = null) => {
    return op2 == null ? -op1 : op1 - op2;
  },

  '*': (op1, op2) => {
    return op1 * op2;
  },

  // comparison

  '/': (op1, op2) => {
    return op1 / op2;
  },

  '>': (op1, op2) => {
    return op1 > op2;
  },

  '<': (op1, op2) => {
    return op1 < op2;
  },

  '<=': (op1, op2) => {
    return op1 <= op2;
  },

  '>=': (op1, op2) => {
    return op1 >= op2;
  },

  '=': (op1, op2) => {
    return op1 === op2;
  },

  // console output

  print: (...args) => {
    console.log(...args);
  },
});

module.exports = Eva;
