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
      return [Cp.lessthan, `=< ${Comparator.ifisString(val)}`];
    },
    lessthaneq: (val) => {
      return [Cp.lessthaneq, `< ${Comparator.ifisString(val)}`];
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
      if (typeof val === "string") return `'${val}'`;
      else return val;
    }
  }