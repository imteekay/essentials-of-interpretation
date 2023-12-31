const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');
const evaParser = require('./parser/evaParser');

const fs = require('fs');

class Eva {
  constructor(global = GlobalEnvironment) {
    this.global = global;
    this._transformer = new Transformer();
  }

  evalGlobal(exp) {
    return this._evalBody(exp, this.global);
  }

  eval(exp, env = this.global) {
    if (this._isNumber(exp)) {
      return exp;
    }

    if (this._isString(exp)) {
      return exp.slice(1, -1);
    }

    if (exp[0] === 'begin') {
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }

    if (exp[0] === 'var') {
      const [_, name, value] = exp;
      return env.define(name, this.eval(value, env));
    }

    if (exp[0] === 'set') {
      const [_, ref, value] = exp;

      if (ref[0] === 'prop') {
        const [_tag, instance, propName] = ref;
        const instanceEnv = this.eval(instance, env);
        return instanceEnv.define(propName, this.eval(value, env));
      }

      return env.assign(ref, this.eval(value, env));
    }

    if (this._isVariableName(exp)) {
      return env.lookup(exp);
    }

    if (exp[0] === 'if') {
      const [_tag, condition, consequent, alternate] = exp;
      return this.eval(condition, env)
        ? this.eval(consequent, env)
        : this.eval(alternate, env);
    }

    if (exp[0] === 'while') {
      const [_, condition, body] = exp;
      let result;

      while (this.eval(condition, env)) {
        result = this.eval(body, env);
      }

      return result;
    }

    if (exp[0] === 'def') {
      const varExp = this._transformer.transformDefToVarLambda(exp);
      return this.eval(varExp, env);
    }

    if (exp[0] === 'switch') {
      const ifExp = this._transformer.transformSwitchToIf(exp);
      return this.eval(ifExp, env);
    }

    if (exp[0] === 'lambda') {
      const [_tag, params, body] = exp;
      return {
        params,
        body,
        env,
      };
    }

    if (exp[0] === 'class') {
      const [_tag, name, parent, body] = exp;
      const evalParent = this.eval(parent, env);
      const parentEnv = evalParent || env;
      const classEnv = new Environment({}, parentEnv);
      this._evalBody(body, classEnv);
      return env.define(name, classEnv);
    }

    if (exp[0] === 'super') {
      const [_tag, className] = exp;
      return this.eval(className, env).parent;
    }

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

    if (exp[0] === 'prop') {
      const [_tag, instance, name] = exp;
      const instanceEnv = this.eval(instance, env);
      return instanceEnv.lookup(name);
    }

    if (exp[0] === 'module') {
      const [_tag, name, body] = exp;
      const moduleEnv = new Environment({}, env);
      this._evalBody(body, moduleEnv);
      return env.define(name, moduleEnv);
    }

    if (exp[0] === 'import') {
      const [_tag, name] = exp;
      const moduleSrc = fs.readFileSync(
        `${__dirname}/modules/${name}.eva`,
        'utf-8',
      );

      const body = evaParser.parse(`(begin ${moduleSrc})`);
      const moduleExp = ['module', name, body];

      return this.eval(moduleExp, this.global);
    }

    if (Array.isArray(exp)) {
      const fn = this.eval(exp[0], env);
      const args = exp.slice(1).map((expression) => this.eval(expression, env));

      if (typeof fn === 'function') {
        return fn(...args);
      }

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

  '+': (op1, op2) => {
    return op1 + op2;
  },

  '-': (op1, op2 = null) => {
    return op2 == null ? -op1 : op1 - op2;
  },

  '*': (op1, op2) => {
    return op1 * op2;
  },

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

  print: (...args) => {
    console.log(...args);
  },
});

module.exports = Eva;
