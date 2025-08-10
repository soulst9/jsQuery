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
        // Enhanced escaping for string values
        if (typeof val === 'string') {
          const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "''");
          arr.push(`${key} = '${escaped}'`);
        } else {
          arr.push(`${key} = ${val}`);
        }
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

    // Optimized array processing
    const sqlParts = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      const sqlArray = this.toSqlArray(obj[i]);
      if (sqlArray && sqlArray.length > 0) {
        sqlParts.push(sqlArray);
      }
    }

    if (sqlParts.length > 1) {
      const joinedSql = sqlParts.join(` ${joinStr} `);
      return isWrapping ? `(${joinedSql})` : joinedSql;
    } else if (sqlParts.length === 1) {
      return ` ${joinStr} ${sqlParts[0]}`;
    }
    return '';
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
