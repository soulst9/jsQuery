/* jshint esversion: 6 */
// @ts-check

const ClassType = require('./class-type');
const { SelectQuery, InsertQuery, UpdateQuery, DeleteQuery } = require('./query-generator');

class QueryInterface {

  selectQuery(bindParam, options) {
    return new SelectQuery(bindParam, options).toSql();
  }

  insertQuery(bindParam, options) {
    return new InsertQuery(bindParam, options).toSql();
  }

  updateQuery(bindParam, options) {
    return new UpdateQuery(bindParam, options).toSql();
  }

  deleteQuery(bindParam, options) {
    return new DeleteQuery(bindParam, options).toSql();
  }
}


module.exports = QueryInterface;
