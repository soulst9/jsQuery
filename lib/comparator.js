const Comparator = (module.exports = {
  eq: val => {
    return `= ${Comparator.ifisString(val)}`;
  },
  gtthan: val => {
    return `> ${Comparator.ifisString(val)}`;
  },
  gtthaneq: val => {
    return `>= ${Comparator.ifisString(val)}`;
  },
  lessthan: val => {
    return `=< ${Comparator.ifisString(val)}`;
  },
  lessthaneq: val => {
    return `< ${Comparator.ifisString(val)}`;
  },
  noteq: val => {
    return `!= ${Comparator.ifisString(val)}`;
  },
  is: val => {
    return `is ${Comparator.ifisString(val)}`;
  },
  like: val => {
    return `like %${Comparator.ifisString(val)}%`;
  },
  ifisString: val => {
    if (typeof val === "string") return `'${val}'`;
    else return val;
  }
});
