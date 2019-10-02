/* jshint esversion: 6 */
// @ts-check

const ClassType = require("./class-type");
const excludeArr = ["orderby", "dir", "offset", "limit", "field"];

// @ts-ignore
class Abstract {
  constructor() {
    if (new.target === Abstract) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }

  buildParam(obj) {
    const fieldValueArr = [];
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === "string") {
        fieldValueArr.push(`${key} = '${obj[key]}'`);
      } else {
        fieldValueArr.push(`${key} = ${obj[key]}`);
      }
    });
    return fieldValueArr.join(", ");
  }

  toSql() {
    throw new Error("toSql implementation missing");
  }
}

class AbstractQuery extends Abstract {
  constructor(query, param, options) {
    if (new.target === AbstractQuery) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    super();
    this.isDerivedTable = this._isDerivedTable(param);
    this.table = this.isDerivedTable ? new query(param, options) : param;
    this.hasJoin = options.hasJoin;
    this.as =
      options.as || (this.isDerivedTable ? this.table.aliasName : this.table);
  }

  getTable() {
    return this.table;
  }

  getAttribute() {
    return this.table.getClass(ClassType.SELECT).getAttribute();
  }

  _isDerivedTable(table) {
    return typeof table === "object" ? true : false;
  }
}

class Join extends AbstractQuery {
  constructor(query, join, type, foreignKeys, options = {}) {
    super(query, join, options);
    this.type = type;
    this.foreignKeys = foreignKeys;
    this.options = options;
  }

  toSql() {
    if (this.isDerivedTable) {
      console.log(`(${this.table.toSql()})`);
      return `${this.type} (${this.table.toSql()}) ${this.as} ON ${this._on(
        this.options.baseAlias,
        this.as
      )}`;
    }
    return `${this.type} ${this.table} ${this.as} ON ${this._on(
      this.options.baseAlias,
      this.as
    )}`;
  }

  _on(baseAlias, joinAlias) {
    let arr = [];
    this.foreignKeys.forEach(key => {
      arr.push(`${baseAlias}.${key} = ${joinAlias}.${key}`);
    });
    return arr.join(" AND ");
  }
}

class From extends AbstractQuery {
  constructor(query, from, options = {}) {
    super(query, from, options);
  }

  toSql() {
    if (this.isDerivedTable) {
      return `FROM (${this.table.toSql()}) ${this.as}`;
    }
    return `FROM ${this.table}`;
  }
}

class Select extends Abstract {
  constructor(attributes, alias, options = {}) {
    super();
    this.attributes = attributes || ["*"];
    this.alias = alias;
    this.hasJoin = options.join;
    if (options.join && !alias) {
      throw new Error("As key is required, if sql statement includes join");
    }
    this.alias = alias;
  }

  getAttribute() {
    if (this.hasJoin) {
      return `${this.attributes.map(attr => {
        return `${this.alias}.${attr}`;
      })}`;
    }
    return `${this.attributes}`;
  }

  toSql() {
    return `${this.getAttribute()}`;
  }
}

class Where extends Abstract {
  constructor(obj, options = {}) {
    super();
    this.obj = obj;
    this.options = options;
    this.comparator = options.comparator || "=";
  }
  /*
  array2Sql(obj, joinStr, isSeparated) {
    if (!Array.isArray(obj)) {
      obj = [obj];
    }
  
    const sql_arr = obj.map(element => {
      return this.toSqlArray(element);
    });
  
    if (obj.length > 1) {
      if (isSeparated) {
        const sql = sql_arr.join(` ${joinStr} `);
        return `(${sql})`;
      }
      return sql_arr.join(` ${joinStr} `);
    }
    return ` ${joinStr} ${sql_arr}`;
  }
  
  toSqlArray(obj) {
    const arr = [];
    Object.keys(obj).forEach(key => {
      arr.push(`${key} ${obj[key]}`);
    });
    return arr;
  }
  
  toSql(obj) {
    let result = "";
    const symbolArr = Object.getOwnPropertySymbols(obj);
    for (let sym in symbolArr) {
      const val = obj[symbolArr[sym]];
  
      if (Object.getOwnPropertySymbols(val).length > 0) {
        return this.toSql(obj[symbolArr[sym]]);
      }
  
      const joinStr = Symbol.keyFor(symbolArr[sym]);
      const isSeperated = symbolArr.length > 1 ? true : false;
      result += this.array2Sql(val, joinStr, isSeperated);
    }
    return result;
  }
*/

  toSql() {
    const attrObj = this.obj;
    let paramsArr = [],
      sql = "";
    Object.keys(attrObj).forEach(key => {
      if (this._excludeKeyword(key)) {
        return;
      }

      let val = attrObj[key];
      if (Array.isArray(val)) {
        val.forEach(element => {
          paramsArr.push(`${key} ${element}`);
        });
      } else if (typeof val === "string") {
        if (val.search("<") >= 0 || val.search(">") >= 0) {
          paramsArr.push(`${key} ${val} `);
        } else if (this.options.like) {
          paramsArr.push(`${key} ${this.comparator} '%${val}%'`);
        } else {
          paramsArr.push(`${key} ${this.comparator} '${val}'`);
        }
      } else if (typeof val === "number") {
        paramsArr.push(`${key} ${this.comparator} ${val}`);
      } else {
        throw new Error("지원하지 않는 형식입니다." + val);
      }
    });

    if (paramsArr.length) {
      sql = paramsArr.join(" AND ");
    }
    return `WHERE ${sql}`;
  }

  _excludeKeyword(key) {
    if (excludeArr.indexOf(key) >= 0) {
      return true;
    }
    return false;
  }
}

class GroupBy extends Abstract {
  /**
   * @param {Array} [group]
   * @param {Object} [options]
   */
  constructor(group = [], options = {}) {
    super();
    this.group = group;
    this.options = this.options;
    this.hasJoin = options.hasJoin;
    this.as = options.alias;
  }

  toSql() {
    if (this.hasJoin) {
      return `GROUP BY ${this.as}.${this.group.join(",")}`;
    }
    return `GROUP BY ${this.group.join(",")}`;
  }
}

class OrderBy extends Abstract {
  constructor(order, options = {}) {
    super();
    this.order = order;
    this.options = this.options;
    this.hasJoin = options.hasJoin;
    this.as = options.alias;
  }

  toSql() {
    if (this.hasJoin) {
      return `ORDER BY ${this.as}.${this.order.join(",")}`;
    }
    return `ORDER BY ${this.order.join(",")}`;
  }
}

class Limit extends Abstract {
  constructor(options = {}) {
    super();
    this.options = options;
    this.offset = options.offset || 0;
    this.count = options.count || 100;
  }

  toSql() {
    return `LIMIT ${this.offset}, ${this.count}`;
  }
}

class Insert extends Abstract {
  constructor(obj, options = {}) {
    super();
    this.obj = obj;
    this.table = obj.table;
    this.fieldValue = Array.isArray(obj.fieldValue)
      ? obj.fieldValue
      : [obj.fieldValue];
    this.option = options;
    this.onDupKeyUpdate = options.onDuplicateKeyUpdate;
  }

  fields() {
    return `(${Object.keys(this.fieldValue[0]).join(", ")})`;
  }

  values() {
    let rows = [];
    Object.values(this.fieldValue).forEach(obj => {
      const row = `(${Object.values(obj)
        .map(x => (typeof x === "string" ? `'${x}'` : x))
        .join(", ")})`;
      rows.push(row);
    });
    return rows.join(", ");
  }

  // onDuplicateKeyUpdate(obj) {
  // 	const fieldValueArr = [];
  // 	Object.keys(obj).forEach(key => {
  // 		if (typeof obj[key] === "string") {
  // 			fieldValueArr.push(`${key} = '${obj[key]}'`);
  // 		} else {
  // 			fieldValueArr.push(`${key} = ${obj[key]}`);
  // 		}
  // 	});
  // 	return fieldValueArr.join(", ");
  // }

  toSql() {
    let sql = `INSERT INTO ${
      this.table
    } ${this.fields()} VALUES ${this.values()}`;
    if (this.onDupKeyUpdate) {
      // @ts-ignore
      return `${sql} ON DUPLICATE KEY UPDATE ${this.buildParam(
        this.onDupKeyUpdate
      )}`;
    }
    return sql;
  }
}

class Update extends Abstract {
  constructor(obj, options = {}) {
    super();
    this.obj = obj;
    this.table = obj.table;
    this.fieldValue = obj.fieldValue;
    this.option = options;
  }

  toSql() {
    return `UPDATE ${this.table} SET ${this.buildParam(this.fieldValue)}`;
  }
}

class Delete extends Abstract {
  constructor(obj, options = {}) {
    super();
    this.obj = obj;
    this.table = obj.table;
    this.option = options;
  }

  toSql() {
    return `DELETE FROM ${this.table}`;
  }
}

module.exports = {
  Select,
  From,
  Join,
  Where,
  GroupBy,
  OrderBy,
  Limit,
  Insert,
  Update,
  Delete
};
