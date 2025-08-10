/* jshint esversion: 6 */
// @ts-check

/**
 * High-performance caching system for jsQuery
 * Features: LRU cache, template caching, query optimization
 */

class LRUCache {
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
    this.timers = new Map();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  generateKey(obj) {
    // Fast, collision-resistant key generation
    if (typeof obj === 'string') return `str:${obj}`;
    if (typeof obj !== 'object' || obj === null) return String(obj);
    
    // Sort keys for consistent hashing
    const keys = Object.keys(obj).sort();
    const parts = keys.map(key => `${key}:${this.generateKey(obj[key])}`);
    return `obj:{${parts.join(',')}}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key, value) {
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
    }

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
      this.evictions++;
    }

    // Add new entry
    const entry = {
      value: value,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);

    // Set TTL timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, this.ttl);
    this.timers.set(key, timer);
  }

  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(2) + '%' : '0%',
      memory: this.getMemoryUsage()
    };
  }

  getMemoryUsage() {
    // Rough estimate of memory usage
    let size = 0;
    for (const [key, value] of this.cache) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(value).length * 2;
    }
    return `${(size / 1024).toFixed(1)} KB`;
  }
}

class QueryTemplateCache {
  constructor() {
    this.templateCache = new LRUCache(500, 600000); // 10 minutes
    this.sqlCache = new LRUCache(1000, 300000); // 5 minutes
    this.functionCache = new LRUCache(200, 900000); // 15 minutes
  }

  // Cache compiled SQL templates
  getCachedSQL(templateKey, params) {
    const key = `${templateKey}:${this.templateCache.generateKey(params)}`;
    return this.sqlCache.get(key);
  }

  setCachedSQL(templateKey, params, sql) {
    const key = `${templateKey}:${this.templateCache.generateKey(params)}`;
    this.sqlCache.set(key, sql);
  }

  // Cache function compilations
  getCachedFunction(funcName, args) {
    const key = `${funcName}:${this.functionCache.generateKey(args)}`;
    return this.functionCache.get(key);
  }

  setCachedFunction(funcName, args, result) {
    const key = `${funcName}:${this.functionCache.generateKey(args)}`;
    this.functionCache.set(key, result);
  }

  // Cache query templates
  getCachedTemplate(structure) {
    const key = this.templateCache.generateKey(structure);
    return this.templateCache.get(key);
  }

  setCachedTemplate(structure, template) {
    const key = this.templateCache.generateKey(structure);
    this.templateCache.set(key, template);
  }

  getStats() {
    return {
      templates: this.templateCache.getStats(),
      sql: this.sqlCache.getStats(),
      functions: this.functionCache.getStats()
    };
  }

  clear() {
    this.templateCache.clear();
    this.sqlCache.clear();
    this.functionCache.clear();
  }
}

class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
    this.created = 0;
    this.reused = 0;
  }

  acquire() {
    if (this.pool.length > 0) {
      this.reused++;
      return this.pool.pop();
    }
    
    this.created++;
    return this.createFn();
  }

  release(obj) {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      created: this.created,
      reused: this.reused,
      reuseRate: this.created > 0 ? ((this.reused / (this.created + this.reused)) * 100).toFixed(1) + '%' : '0%'
    };
  }

  clear() {
    this.pool = [];
    this.created = 0;
    this.reused = 0;
  }
}

// String optimization utilities
class StringOptimizer {
  constructor() {
    this.stringPool = new Map();
  }

  // Intern frequently used strings
  intern(str) {
    if (this.stringPool.has(str)) {
      return this.stringPool.get(str);
    }
    this.stringPool.set(str, str);
    return str;
  }

  // Optimized string building for SQL
  buildSQL(parts) {
    // Use array join instead of string concatenation for better performance
    const filtered = parts.filter(part => part && part.trim());
    return filtered.join(' ');
  }

  // Template-based string building
  template(template, values) {
    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      return values[key] || match;
    });
  }
}

module.exports = {
  LRUCache,
  QueryTemplateCache,
  ObjectPool,
  StringOptimizer
};