const Func = (module.exports = {
  count: (...arg) => {
    return Func.isAlias(`COUNT(${arg[0]})`, arg[1]);
  },
  ifnull: (...arg) => {
    return Func.isAlias(
      `IFNULL(${arg[0]}, ${Func.ifisString(arg[1])})`,
      arg[2]
    );
  },
  convert_tz: (...arg) => {
    return Func.isAlias(
      `CONVERT_TZ(${arg[0]}, '${arg[1]}', '${arg[2]}')`,
      arg[3]
    );
  },
  isAlias: (attr, as) => {
    if (as) {
      return `${attr} ${as}`;
    }
    return `${attr}`;
  },
  ifisString: val => {
    if (typeof val === "string") return `'${val}'`;
    else return val;
  }
});
