const Op = require("./operator");
const Cp = require("./comparator");
const Fn = require("./function");
const operatorsSet = new Set(Object.values(Op));

class Compile {
  constructor() {}

  compile() {
    throw new TypeError("Cannot construct Abstract instances directly");
  }
}

class CompileWhere extends Compile {
  constructor() {
    super();
  }

  getOperatorKey(obj) {
    return Object.getOwnPropertySymbols(obj).filter(key =>
      operatorsSet.has(key)
    );
  }

  toSqlArray(obj) {
    const arr = [];
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (typeof val[0] == "symbol") {
        arr.push(`${key} ${val[1]}`);
      } else {
        arr.push(`${key} = ${val}`);
      }
    });
    return arr;
  }

  array2Sql(obj, joinStr, isWrapping) {
    if (arguments.length != 3) {
      throw new Error("Need more required arguments");
    }

    if (!Array.isArray(obj)) {
      obj = [obj];
    }

    const sql_arr = obj.map(element => {
      return this.toSqlArray(element);
    });

    if (obj.length > 1) {
      if (isWrapping) {
        const sql = sql_arr.join(` ${joinStr} `);
        return `(${sql})`;
      }
      return sql_arr.join(` ${joinStr} `);
    }
    return ` ${joinStr} ${sql_arr}`;
  }

  explore(obj) {
    let result = "";
    const symbolArr = this.getOperatorKey(obj);
    if (symbolArr.length == 0) {
      return `${this.toSqlArray(obj)}`;
    }

    for (let sym in symbolArr) {
      const val = obj[symbolArr[sym]];
      if (this.getOperatorKey(val).length > 0) {
        return this.explore(obj[symbolArr[sym]]);
      }
      const joinStr = Symbol.keyFor(symbolArr[sym]);
      const isSeperated = symbolArr.length > 1 ? true : false;
      result += this.array2Sql(val, joinStr, isSeperated);
    }
    return result;
  }

  compile(obj) {
    return this.explore(obj);
  }
}

module.exports = {
  // CompileSelect,
  CompileWhere
};
