/* jshint esversion: 6 */
// @ts-check

const QueryInterface = require("./query-interface");
const { CompileWhere } = require('./compile');
const Op = require('./operator');
const Cp = require('./comparator');
const Fn = require('./function');
const comparatorsSet = new Set(Object.keys(Cp));
const functionsSet = new Set(Object.keys(Fn));

class JSQuery {
  constructor() {
    this.queryInterface = new QueryInterface();
    this.compileWhere = new CompileWhere();
  }

  selectQuery(bindParam, options) {
    return this.queryInterface.selectQuery(bindParam, options);
  }

  insertQuery(bindParam, options) {
    return this.queryInterface.insertQuery(bindParam, options);
  }

  updateQuery(bindParam, options) {
    return this.queryInterface.updateQuery(bindParam, options);
  }

  deleteQuery(bindParam, options) {
    return this.queryInterface.deleteQuery(bindParam, options);
  }

  static and(...arg) {
    return { [Op.and]: arg };
  }

  static or(...arg) {
    return { [Op.or]: arg };
  }

  static fn(fn,...arg) {
    if (comparatorsSet.has(fn)) {
      return Cp[fn](...arg);
    } else if (functionsSet.has(fn)) {
      return Fn[fn](...arg);
    } else {
      throw new Error('Not exist function name');
    }
  }
}

module.exports = JSQuery;
