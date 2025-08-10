/* jshint esversion: 6 */
// @ts-check

const { CompileWhere } = require('./compile');
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
    if (!obj || typeof obj !== 'object') {
      throw new Error('buildParam requires a valid object');
    }
    
    const fieldValueArr = [];
    Object.keys(obj).forEach(key => {
      if (typeof key !== 'string' || key.trim() === '') {
        throw new Error('Invalid field name: must be non-empty string');
      }
      
      const value = obj[key];
      if (typeof value === "string") {
        // Use enhanced escaping
        const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
        fieldValueArr.push(`${key} = '${escaped}'`);
      } else if (typeof value === 'number') {
        if (!isFinite(value)) {
          throw new Error(`Invalid number value for field ${key}`);
        }
        fieldValueArr.push(`${key} = ${value}`);
      } else if (value === null || value === undefined) {
        fieldValueArr.push(`${key} = NULL`);
      } else if (typeof value === 'boolean') {
        fieldValueArr.push(`${key} = ${value ? 1 : 0}`);
      } else {
        fieldValueArr.push(`${key} = ${value}`);
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

  buildAttribute(attr, alias) {
    const startPos = attr.indexOf("(");
    const endPos = attr.indexOf(",");
    if (startPos > 0 && endPos > 0) {
      const origin_name = attr.substring(startPos+1, endPos);
      return attr.replace(origin_name, `${alias}.${origin_name}`);
    }
    return `${alias}.${attr}`;
  }

  getAttribute() {
    if (this.hasJoin) {
      return this.attributes.map(attr => {
        return `${this.buildAttribute(attr, this.alias)}`;
      }).join(", ");
    }
    return this.attributes.join(", ");
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
    this.compileWhere = new CompileWhere();
  }

  toSql() {
    return `WHERE ${this.compileWhere.compile(this.obj)}`;
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
