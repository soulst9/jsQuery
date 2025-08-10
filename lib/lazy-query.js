/* jshint esversion: 6 */
// @ts-check

/**
 * Lazy evaluation system for jsQuery
 * Defers expensive operations until actually needed
 */

class LazyQuery {
  constructor(queryBuilder, queryType, bindParam, options = {}) {
    this.queryBuilder = queryBuilder;
    this.queryType = queryType;
    this.bindParam = bindParam;
    this.options = options;
    
    // Lazy evaluation state
    this._compiled = false;
    this._sql = null;
    this._dependencies = new Set();
    this._lastAccessed = Date.now();
    
    // Performance tracking
    this.compilationTime = 0;
    this.accessCount = 0;
  }

  // Main SQL generation - only compiled when needed
  toSql() {
    this.accessCount++;
    this._lastAccessed = Date.now();
    
    if (!this._compiled) {
      this._compile();
    }
    
    return this._sql;
  }

  toString() {
    return this.toSql();
  }

  // Lazy compilation
  _compile() {
    if (this._compiled) return;
    
    const startTime = process.hrtime.bigint();
    
    try {
      // Use the query builder to generate SQL
      switch (this.queryType) {
        case 'select':
          this._sql = this.queryBuilder._executeWithPerformance('select', this.bindParam, this.options);
          break;
        case 'insert':
          this._sql = this.queryBuilder._executeWithPerformance('insert', this.bindParam, this.options);
          break;
        case 'update':
          this._sql = this.queryBuilder._executeWithPerformance('update', this.bindParam, this.options);
          break;
        case 'delete':
          this._sql = this.queryBuilder._executeWithPerformance('delete', this.bindParam, this.options);
          break;
        default:
          throw new Error(`Unknown query type: ${this.queryType}`);
      }
      
      this._compiled = true;
      
      const endTime = process.hrtime.bigint();
      this.compilationTime = Number(endTime - startTime) / 1000000; // milliseconds
      
    } catch (error) {
      this._compiled = false;
      throw error;
    }
  }

  // Check if query needs recompilation
  _needsRecompilation() {
    // Simple dependency checking - can be extended
    return !this._compiled || this._dependencies.size > 0;
  }

  // Add dependency tracking
  addDependency(key) {
    this._dependencies.add(key);
    this._compiled = false; // Mark for recompilation
  }

  removeDependency(key) {
    this._dependencies.delete(key);
  }

  clearDependencies() {
    this._dependencies.clear();
  }

  // Query modification methods (invalidate cache)
  where(conditions) {
    this._invalidate();
    if (this.bindParam.where) {
      Object.assign(this.bindParam.where, conditions);
    } else {
      this.bindParam.where = conditions;
    }
    return this;
  }

  orderBy(orderFields) {
    this._invalidate();
    this.bindParam.orderby = Array.isArray(orderFields) ? orderFields : [orderFields];
    return this;
  }

  limit(offset, count) {
    this._invalidate();
    this.bindParam.limit = { offset, count };
    return this;
  }

  _invalidate() {
    this._compiled = false;
    this._sql = null;
  }

  // Performance and debugging info
  getStats() {
    return {
      compiled: this._compiled,
      accessCount: this.accessCount,
      compilationTime: this.compilationTime,
      lastAccessed: this._lastAccessed,
      dependencies: Array.from(this._dependencies),
      queryType: this.queryType,
      hasOptions: Object.keys(this.options).length > 0
    };
  }
}

class LazyQueryBuilder {
  constructor(jsQueryInstance) {
    this.jsQuery = jsQueryInstance;
    this.lazyQueries = new Map();
    this.cleanupInterval = null;
    this.maxAge = 300000; // 5 minutes
    
    // Start cleanup timer
    this._startCleanup();
  }

  // Create lazy queries
  select(bindParam, options = {}) {
    const key = this._generateKey('select', bindParam, options);
    
    if (this.lazyQueries.has(key)) {
      return this.lazyQueries.get(key);
    }

    const lazyQuery = new LazyQuery(this.jsQuery, 'select', bindParam, options);
    this.lazyQueries.set(key, lazyQuery);
    
    return lazyQuery;
  }

  insert(bindParam, options = {}) {
    const key = this._generateKey('insert', bindParam, options);
    const lazyQuery = new LazyQuery(this.jsQuery, 'insert', bindParam, options);
    this.lazyQueries.set(key, lazyQuery);
    return lazyQuery;
  }

  update(bindParam, options = {}) {
    const key = this._generateKey('update', bindParam, options);
    const lazyQuery = new LazyQuery(this.jsQuery, 'update', bindParam, options);
    this.lazyQueries.set(key, lazyQuery);
    return lazyQuery;
  }

  delete(bindParam, options = {}) {
    const key = this._generateKey('delete', bindParam, options);
    const lazyQuery = new LazyQuery(this.jsQuery, 'delete', bindParam, options);
    this.lazyQueries.set(key, lazyQuery);
    return lazyQuery;
  }

  // Batch operations
  batch() {
    return new LazyBatch(this);
  }

  // Key generation for caching
  _generateKey(type, bindParam, options) {
    const keyData = { type, bindParam, options, timestamp: Date.now() };
    return JSON.stringify(keyData); // Simple key generation
  }

  // Cleanup old queries
  _startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const toDelete = [];
      
      for (const [key, lazyQuery] of this.lazyQueries) {
        if (now - lazyQuery._lastAccessed > this.maxAge) {
          toDelete.push(key);
        }
      }
      
      toDelete.forEach(key => this.lazyQueries.delete(key));
      
    }, 60000); // Cleanup every minute
  }

  // Get all lazy query stats
  getStats() {
    const stats = {
      totalQueries: this.lazyQueries.size,
      compiled: 0,
      uncompiled: 0,
      totalAccess: 0,
      totalCompilationTime: 0,
      avgCompilationTime: 0,
      byType: {}
    };

    for (const lazyQuery of this.lazyQueries.values()) {
      const queryStats = lazyQuery.getStats();
      
      if (queryStats.compiled) {
        stats.compiled++;
        stats.totalCompilationTime += queryStats.compilationTime;
      } else {
        stats.uncompiled++;
      }
      
      stats.totalAccess += queryStats.accessCount;
      
      if (!stats.byType[queryStats.queryType]) {
        stats.byType[queryStats.queryType] = 0;
      }
      stats.byType[queryStats.queryType]++;
    }

    stats.avgCompilationTime = stats.compiled > 0 
      ? (stats.totalCompilationTime / stats.compiled).toFixed(2)
      : 0;

    return stats;
  }

  // Clear all lazy queries
  clear() {
    this.lazyQueries.clear();
  }

  // Destroy and cleanup
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

class LazyBatch {
  constructor(lazyBuilder) {
    this.lazyBuilder = lazyBuilder;
    this.queries = [];
  }

  select(bindParam, options) {
    this.queries.push({ type: 'select', bindParam, options });
    return this;
  }

  insert(bindParam, options) {
    this.queries.push({ type: 'insert', bindParam, options });
    return this;
  }

  update(bindParam, options) {
    this.queries.push({ type: 'update', bindParam, options });
    return this;
  }

  delete(bindParam, options) {
    this.queries.push({ type: 'delete', bindParam, options });
    return this;
  }

  // Execute all queries lazily
  execute() {
    return this.queries.map(query => {
      switch (query.type) {
        case 'select':
          return this.lazyBuilder.select(query.bindParam, query.options);
        case 'insert':
          return this.lazyBuilder.insert(query.bindParam, query.options);
        case 'update':
          return this.lazyBuilder.update(query.bindParam, query.options);
        case 'delete':
          return this.lazyBuilder.delete(query.bindParam, query.options);
      }
    });
  }

  // Compile all queries at once
  compile() {
    const results = this.execute();
    return results.map(lazyQuery => lazyQuery.toSql());
  }
}

module.exports = {
  LazyQuery,
  LazyQueryBuilder,
  LazyBatch
};