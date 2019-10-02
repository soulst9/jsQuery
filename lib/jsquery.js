/* jshint esversion: 6 */
// @ts-check

const QueryInterface = require("./query-interface");

class JSQuery {
  constructor() {
		this.queryInterface = new QueryInterface();
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
}

module.exports = JSQuery;