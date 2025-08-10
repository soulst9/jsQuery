/* jshint esversion: 6 */
// @ts-check

const QueryInterface = require("./query-interface");
const { CompileWhere } = require('./compile');
const Op = require('./operator');
const Cp = require('./comparator');
const Fn = require('./function');
const { QueryTemplateCache, ObjectPool, StringOptimizer } = require('./performance-cache');
const { LazyQueryBuilder } = require('./lazy-query');

const comparatorsSet = new Set(Object.keys(Cp));
const functionsSet = new Set(Object.keys(Fn));

class JSQuery {
  constructor(options = {}) {
    // Performance optimization options
    this.performanceMode = options.performance !== false; // enabled by default
    this.cacheEnabled = options.cache !== false;
    this.poolingEnabled = options.pooling !== false;
    
    // Core components
    this.queryInterface = new QueryInterface();
    this.compileWhere = new CompileWhere();
    
    // Performance components
    if (this.performanceMode) {
      this.templateCache = new QueryTemplateCache();
      this.stringOptimizer = new StringOptimizer();
      this.lazyBuilder = new LazyQueryBuilder(this);
      
      // Object pools for frequently created objects
      this.arrayPool = new ObjectPool(
        () => [],
        (arr) => arr.length = 0,
        50
      );
      
      this.objectPool = new ObjectPool(
        () => ({}),
        (obj) => {
          for (const key in obj) {
            delete obj[key];
          }
        },
        30
      );
    }
    
    // Performance metrics
    this.metrics = {
      queriesExecuted: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0
    };
  }

  selectQuery(bindParam, options) {
    return this._executeWithPerformance('select', bindParam, options);
  }

  insertQuery(bindParam, options) {
    return this._executeWithPerformance('insert', bindParam, options);
  }

  updateQuery(bindParam, options) {
    return this._executeWithPerformance('update', bindParam, options);
  }

  deleteQuery(bindParam, options) {
    return this._executeWithPerformance('delete', bindParam, options);
  }

  // Performance-optimized query execution
  _executeWithPerformance(queryType, bindParam, options = {}) {
    const startTime = this.performanceMode ? process.hrtime.bigint() : null;
    
    try {
      // Generate cache key if caching is enabled
      let cacheKey = null;
      if (this.cacheEnabled && this.templateCache) {
        cacheKey = `${queryType}:${this.templateCache.templateCache.generateKey({
          params: bindParam,
          options: options
        })}`;
        
        // Try to get from cache
        const cached = this.templateCache.getCachedSQL('query', cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Execute query with appropriate method
      let result;
      switch (queryType) {
        case 'select':
          result = this.queryInterface.selectQuery(bindParam, options);
          break;
        case 'insert':
          result = this.queryInterface.insertQuery(bindParam, options);
          break;
        case 'update':
          result = this.queryInterface.updateQuery(bindParam, options);
          break;
        case 'delete':
          result = this.queryInterface.deleteQuery(bindParam, options);
          break;
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }

      // Cache the result
      if (this.cacheEnabled && this.templateCache && cacheKey) {
        this.templateCache.setCachedSQL('query', cacheKey, result);
      }

      return result;
    } finally {
      // Update performance metrics
      if (this.performanceMode && startTime) {
        const endTime = process.hrtime.bigint();
        const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        this.metrics.queriesExecuted++;
        this.metrics.totalExecutionTime += executionTime;
        this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.queriesExecuted;
      }
    }
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

  // Performance monitoring and optimization methods
  getPerformanceStats() {
    const stats = {
      metrics: this.metrics,
      performance: this.performanceMode,
      caching: this.cacheEnabled,
      pooling: this.poolingEnabled
    };

    if (this.templateCache) {
      stats.cache = this.templateCache.getStats();
    }

    if (this.arrayPool) {
      stats.pools = {
        arrays: this.arrayPool.getStats(),
        objects: this.objectPool.getStats()
      };
    }

    return stats;
  }

  clearCache() {
    if (this.templateCache) {
      this.templateCache.clear();
    }
    
    if (this.arrayPool) {
      this.arrayPool.clear();
      this.objectPool.clear();
    }

    // Reset metrics
    this.metrics = {
      queriesExecuted: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0
    };
  }

  // Optimize performance settings
  optimizeFor(profile) {
    switch (profile) {
      case 'memory':
        this.cacheEnabled = false;
        this.poolingEnabled = true;
        if (this.templateCache) this.templateCache.clear();
        break;
      case 'speed':
        this.cacheEnabled = true;
        this.poolingEnabled = true;
        break;
      case 'minimal':
        this.cacheEnabled = false;
        this.poolingEnabled = false;
        this.performanceMode = false;
        break;
      default:
        throw new Error(`Unknown optimization profile: ${profile}`);
    }
  }

  // Warm up cache with common queries
  warmupCache(queries) {
    if (!this.cacheEnabled || !queries || !Array.isArray(queries)) {
      return;
    }

    queries.forEach(({ type, params, options }) => {
      try {
        switch (type) {
          case 'select':
            this.selectQuery(params, options);
            break;
          case 'insert':
            this.insertQuery(params, options);
            break;
          case 'update':
            this.updateQuery(params, options);
            break;
          case 'delete':
            this.deleteQuery(params, options);
            break;
        }
      } catch (error) {
        // Ignore errors during warmup
      }
    });
  }

  // Lazy query methods
  lazy() {
    if (!this.performanceMode || !this.lazyBuilder) {
      throw new Error('Lazy queries require performance mode to be enabled');
    }
    return this.lazyBuilder;
  }

  // Create a lazy batch
  batch() {
    return this.lazy().batch();
  }

  // Destroy resources
  destroy() {
    if (this.lazyBuilder) {
      this.lazyBuilder.destroy();
    }
    
    if (this.templateCache) {
      this.templateCache.clear();
    }
    
    if (this.arrayPool) {
      this.arrayPool.clear();
      this.objectPool.clear();
    }
  }
}

module.exports = JSQuery;
