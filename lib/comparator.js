const Cp = {
  eq: Symbol.for('eq'),
  gtthan: Symbol.for('gtthan'),
  gtthaneq: Symbol.for('gtthaneq'),
  lessthan: Symbol.for('lessthan'),
  lessthaneq: Symbol.for('lessthaneq'),
  noteq: Symbol.for('noteq'),
  is: Symbol.for('is'),
  like: Symbol.for('like')
}

const Comparator = module.exports = {
    eq: (val) => {
      return [Cp.eq, `= ${Comparator.ifisString(val)}`];
    },
    gtthan: (val) => {
      return [Cp.gtthan, `> ${Comparator.ifisString(val)}`];
    },
    gtthaneq: (val) => {
      return [Cp.gtthaneq, `>= ${Comparator.ifisString(val)}`];
    },
    lessthan: (val) => {
      return [Cp.lessthan, `< ${Comparator.ifisString(val)}`];
    },
    lessthaneq: (val) => {
      return [Cp.lessthaneq, `<= ${Comparator.ifisString(val)}`];
    },
    noteq: (val) => {
      return [Cp.noteq, `!= ${Comparator.ifisString(val)}`];
    },
    is: (val) => {
      return [Cp.is, `is ${Comparator.ifisString(val)}`];
    },
    like: (val) => {
      return [Cp.like, `like %${Comparator.ifisString(val)}%`];
    },
    ifisString: (val) => {
      if (typeof val === "string") {
        // SQL injection prevention: escape single quotes and backslashes
        const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "''");
        return `'${escaped}'`;
      }
      else return val;
    },
    
    // Validate and sanitize input values
    validateValue: (val) => {
      if (val === null || val === undefined) {
        return 'NULL';
      }
      if (typeof val === 'boolean') {
        return val ? 1 : 0;
      }
      if (typeof val === 'number') {
        if (!isFinite(val)) {
          throw new Error('Invalid number value: must be finite');
        }
        return val;
      }
      if (typeof val === 'string') {
        return Comparator.ifisString(val);
      }
      throw new Error(`Unsupported value type: ${typeof val}`);
    }
  }