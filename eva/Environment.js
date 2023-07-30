class Environment {
  constructor(record = {}, parent = null) {
    this.record = record;
    this.parent = parent;
  }

  // Creates a variable with the given name and value
  define(name, value) {
    this.record[name] = value;
    return value;
  }

  lookup(name) {
    console.log(this.parent);
    if (
      !this.record.hasOwnProperty(name) &&
      this.parent &&
      !this.parent.record.hasOwnProperty(name)
    ) {
      throw new ReferenceError(`Variable "${name}" is not defined.`);
    }

    return this.record[name] || this.parent.record[name];
  }
}

module.exports = Environment;
