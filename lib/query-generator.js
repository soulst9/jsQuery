/* jshint esversion: 6 */
// @ts-check

const ClassType = require("./class-type");
const {
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
} = require("./query-class");

class AbstractGenerator {
  constructor() {
    this._classList = {};
  }

  static toClass(keyword, ...arg) {
    switch (keyword) {
      case ClassType.SELECT:
        return new Select(...arg);
      case ClassType.FROM:
        return new From(...arg);
      case ClassType.WHERE:
        return new Where(...arg);
      case ClassType.JOIN:
        return new Join(...arg);
      case ClassType.GROUPBY:
        return new GroupBy(...arg);
      case ClassType.ORDERBY:
        return new OrderBy(...arg);
      case ClassType.LIMIT:
        return new Limit(...arg);
      case ClassType.INSERT:
        return new Insert(...arg);
      case ClassType.UPDATE:
        return new Update(...arg);
      case ClassType.DELETE:
        return new Delete(...arg);
      default:
        throw new Error("Unknown ClassType : " + keyword);
    }
  }

  get toClass() {
    // @ts-ignore
    return this.constructor.toClass;
  }

  setClass(classType, ...arg) {
    if (classType === ClassType.JOIN) {
      this._classList[classType].push(this.toClass(classType, ...arg));
    } else {
      this._classList[classType] = this.toClass(classType, ...arg);
    }
  }

  getClass(className) {
    // @ts-ignore
    return this._classList[className];
  }

  toSqlByClass(className) {
    const _class = this.getClass(className);
    if (_class === undefined) {
      return undefined;
    }

    if (className === ClassType.SELECT) {
      // @ts-ignore
      return this.selectAll();
    } else if (className === ClassType.JOIN) {
      const result = _class.map(join => {
        return join.toSql();
      });
      return result.join(" ");
    } else {
      return _class.toSql();
    }
  }

  mergeClass(arrayClassOrder) {
    const sql = [];
    arrayClassOrder.forEach(className => {
      const _class = this.toSqlByClass(className);
      if (_class) {
        sql.push(_class);
      }
    });
    return sql;
  }

  toSql() {
    return this.mergeClass().join(" ");
  }
}

class SelectQuery extends AbstractGenerator {
  constructor(bindParam, options = {}) {
    super();
    if (!bindParam.select) {
      throw new Error("{select} key is required");
    }
    if (!bindParam.from) {
      throw new Error("{from} key is required");
    }
    this.options = options;
    this.isRoot = this.options.isRoot =
      options.isRoot === undefined ? true : false;
    this.hasJoin = this.options.hasJoin =
      (bindParam.join ? true : false) || options.hasJoin || false;

    // From Class
    super.setClass(
      ClassType.FROM,
      this.constructor,
      bindParam.from.table,
      Object.assign({}, bindParam.from.options, { isRoot: false })
    );

    // Join Class
    if (bindParam.join) {
      this._classList[ClassType.JOIN] = [];
      bindParam.join.forEach(join => {
        super.setClass(
          ClassType.JOIN,
          this.constructor,
          join.table,
          join.type,
          join.foreignKeys,
          Object.assign({}, this.options, {
            isRoot: false,
            hasJoin: this.hasJoin,
            baseAlias: this.aliasName
          })
        );
      });
    }

    // Select Class
    // @ts-ignore
    super.setClass(
      ClassType.SELECT,
      bindParam.select,
      this._classList.from.as,
      Object.assign({}, { join: this.hasJoin })
    );

    // Where Class
    if (bindParam.where) {
      super.setClass(
        ClassType.WHERE,
        bindParam.where,
        Object.assign({}, { join: this.hasJoin })
      );
    }

    // GroupBy Class
    if (bindParam.groupby) {
      super.setClass(
        ClassType.GROUPBY,
        bindParam.groupby,
        Object.assign({}, { baseAlias: this.aliasName, join: this.hasJoin })
      );
    }

    // OrderBy Class
    if (bindParam.orderby) {
      super.setClass(
        ClassType.ORDERBY,
        bindParam.orderby,
        Object.assign({}, { baseAlias: this.aliasName, join: this.hasJoin })
      );
    }

    // Limit Class
    if (bindParam.limit) {
      super.setClass(
        ClassType.LIMIT,
        bindParam.limit,
        Object.assign(
          {},
          { offset: bindParam.limit.offset, limit: bindParam.limit.count }
        )
      );
    }
  }

  selectAll() {
    const selectAll = [];
    selectAll.push(this.getClass(ClassType.SELECT).getAttribute());
    const joinClass = this.getClass(ClassType.JOIN);

    if (this.isRoot && joinClass) {
      joinClass.forEach(join => {
        selectAll.push(join.getAttribute());
      });
    }
    return `SELECT ${selectAll.join(", ")}`;
  }

  get aliasName() {
    let child = this.getClass(ClassType.FROM).getTable();
    while (child instanceof SelectQuery) {
      child = child.getClass(ClassType.FROM).getTable();
    }
    return child;
  }

  mergeClass(className) {
    return super.mergeClass([
      ClassType.SELECT,
      ClassType.FROM,
      ClassType.JOIN,
      ClassType.WHERE,
      ClassType.GROUPBY,
      ClassType.ORDERBY,
      ClassType.LIMIT
    ]);
  }
}

class InsertQuery extends AbstractGenerator {
  constructor(bindParam, options) {
    super();

    if (!bindParam.insert) {
      throw new Error("{insert} key is required");
    }

    super.setClass(
      ClassType.INSERT,
      bindParam.insert,
      Object.assign(
        {},
        { onDuplicateKeyUpdate: bindParam.insert.onDuplicateKeyUpdate }
      )
    );

    if (bindParam.select) {
    }
  }

  mergeClass() {
    return super.mergeClass([ClassType.INSERT, ClassType.SELECT]);
  }
}

class UpdateQuery extends AbstractGenerator {
  constructor(bindParam, options) {
    super();
    if (!bindParam.update) {
      throw new Error("{update} key is required");
    }

    // @ts-ignore
    this._classList[ClassType.UPDATE] = this.toClass(
      ClassType.UPDATE,
      bindParam.update,
      Object.assign({})
    );

    if (bindParam.where) {
      super.setClass(ClassType.WHERE, bindParam.where, Object.assign({}));
    }
    if (bindParam.orderby) {
      super.setClass(ClassType.ORDERBY, bindParam.orderby);
    }
    if (bindParam.limit) {
      super.setClass(
        ClassType.LIMIT,
        bindParam.limit,
        Object.assign(
          {},
          { offset: bindParam.limit.offset, limit: bindParam.limit.count }
        )
      );
    }
  }

  mergeClass() {
    return super.mergeClass([
      ClassType.UPDATE,
      ClassType.WHERE,
      ClassType.ORDERBY,
      ClassType.LIMIT
    ]);
  }
}

class DeleteQuery extends AbstractGenerator {
  constructor(bindParam, options) {
    super();
    if (!bindParam.delete) {
      throw new Error("{delete} key is required");
    }
    if (!bindParam.where) {
      throw new Error("{where} key is required");
    }

    super.setClass(ClassType.DELETE, bindParam.delete);
    if (bindParam.where) {
      super.setClass(ClassType.WHERE, bindParam.where);
    }
  }

  mergeClass() {
    return super.mergeClass([ClassType.DELETE, ClassType.WHERE]);
  }
}

module.exports = {
  SelectQuery,
  InsertQuery,
  UpdateQuery,
  DeleteQuery
};
