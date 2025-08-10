/* jshint esversion: 6 */
// Performance optimization demonstration for jsQuery

const JSQuery = require('../index');

console.log('🚀 jsQuery Performance Optimization Demo\n');

// 1. Basic Usage vs Performance Mode
console.log('1️⃣ Basic vs Performance Mode Comparison');

const basicQuery = new JSQuery({ performance: false, cache: false });
const optimizedQuery = new JSQuery({ performance: true, cache: true, pooling: true });

const testParams = {
  select: ['id', 'name', JSQuery.fn('upper', 'email', 'email_upper')],
  from: { table: 'users' },
  where: { active: 1 }
};

console.log('Basic Query:', basicQuery.selectQuery(testParams));
console.log('Optimized Query:', optimizedQuery.selectQuery(testParams));
console.log('✅ Both produce identical SQL, but optimized version caches results\n');

// 2. Cache Effectiveness Demo
console.log('2️⃣ Cache Effectiveness Demo');

const start = process.hrtime.bigint();

// Execute same query 1000 times
for (let i = 0; i < 1000; i++) {
  optimizedQuery.selectQuery(testParams);
}

const end = process.hrtime.bigint();
const timeMs = Number(end - start) / 1000000;

console.log(`1000 identical queries executed in: ${timeMs.toFixed(2)}ms`);
console.log('Performance Stats:', optimizedQuery.getPerformanceStats().metrics);
console.log('Cache Hit Rate:', optimizedQuery.getPerformanceStats().cache.sql.hitRate, '\n');

// 3. Lazy Query Demo  
console.log('3️⃣ Lazy Query Evaluation Demo');

const lazyQuery = optimizedQuery.lazy().select({
  select: ['id', 'name', JSQuery.fn('concat', 'first_name', 'last_name', 'full_name')],
  from: { table: 'users' }
});

console.log('Lazy query created (not compiled yet)');
console.log('Lazy query stats:', lazyQuery.getStats());

// Chain modifications without recompiling
lazyQuery.where({ active: 1 }).orderBy(['created_at DESC']).limit(0, 10);
console.log('Modifications added (still not compiled)');

// Now compile when needed
const sql = lazyQuery.toSql();
console.log('Final SQL:', sql);
console.log('Compilation time:', lazyQuery.getStats().compilationTime.toFixed(2) + 'ms\n');

// 4. Batch Operations Demo
console.log('4️⃣ Batch Operations Demo');

const batch = optimizedQuery.batch()
  .select({
    select: ['id', 'name'],
    from: { table: 'users' }
  })
  .select({
    select: ['id', 'title'],
    from: { table: 'posts' }
  })
  .select({
    select: [JSQuery.fn('count', '*', 'total')],
    from: { table: 'comments' }
  });

const batchResults = batch.compile();
console.log('Batch compiled 3 queries:');
batchResults.forEach((sql, index) => {
  console.log(`  ${index + 1}. ${sql}`);
});
console.log();

// 5. Performance Profiles Demo
console.log('5️⃣ Performance Profile Optimization');

const profileQuery = new JSQuery({ performance: true });

console.log('Original settings:');
console.log(`  Cache: ${profileQuery.cacheEnabled}`);
console.log(`  Pooling: ${profileQuery.poolingEnabled}`);
console.log(`  Performance: ${profileQuery.performanceMode}`);

// Optimize for speed
profileQuery.optimizeFor('speed');
console.log('\nAfter optimizeFor("speed"):');
console.log(`  Cache: ${profileQuery.cacheEnabled}`);
console.log(`  Pooling: ${profileQuery.poolingEnabled}`);

// Optimize for memory
profileQuery.optimizeFor('memory');
console.log('\nAfter optimizeFor("memory"):');
console.log(`  Cache: ${profileQuery.cacheEnabled}`);
console.log(`  Pooling: ${profileQuery.poolingEnabled}`);

// 6. Cache Warmup Demo
console.log('\n6️⃣ Cache Warmup Demo');

const warmupQuery = new JSQuery({ performance: true, cache: true });

// Common queries to warm up
const commonQueries = [
  {
    type: 'select',
    params: { select: ['*'], from: { table: 'users' } }
  },
  {
    type: 'select', 
    params: { select: ['id', 'name'], from: { table: 'posts' }, where: { published: 1 } }
  },
  {
    type: 'update',
    params: { update: { table: 'users', fieldValue: { last_login: JSQuery.fn('now') } }, where: { id: 1 } }
  }
];

console.log('Warming up cache with common queries...');
warmupQuery.warmupCache(commonQueries);

console.log('Cache stats after warmup:');
const warmupStats = warmupQuery.getPerformanceStats();
console.log(`  SQL Cache size: ${warmupStats.cache.sql.size} entries`);
console.log(`  Hit rate: ${warmupStats.cache.sql.hitRate}`);

// 7. Memory and Performance Monitoring
console.log('\n7️⃣ Performance Monitoring');

const monitorQuery = new JSQuery({ performance: true, cache: true, pooling: true });

// Generate some load
for (let i = 0; i < 100; i++) {
  monitorQuery.selectQuery({
    select: [`field_${i}`, JSQuery.fn('upper', `col_${i}`, `upper_${i}`)],
    from: { table: `table_${i % 5}` },
    where: { active: 1 }
  });
}

const finalStats = monitorQuery.getPerformanceStats();
console.log('Final Performance Report:');
console.log(`  Total Queries: ${finalStats.metrics.queriesExecuted}`);
console.log(`  Average Execution Time: ${finalStats.metrics.averageExecutionTime.toFixed(4)}ms`);
console.log(`  Cache Hit Rate: ${finalStats.cache.sql.hitRate}`);
console.log(`  Memory Usage: ${finalStats.cache.sql.memory}`);

console.log('\n🎯 Key Performance Benefits:');
console.log('  ✅ Automatic query caching with 99%+ hit rates');
console.log('  ✅ Lazy evaluation prevents unnecessary compilation');
console.log('  ✅ Object pooling reduces garbage collection');
console.log('  ✅ Optimized string operations for better throughput');
console.log('  ✅ Configurable performance profiles');
console.log('  ✅ Real-time performance monitoring');

console.log('\n💡 Best Practices:');
console.log('  1. Enable performance mode for production: new JSQuery({ performance: true })');
console.log('  2. Use lazy queries for complex, conditional queries');
console.log('  3. Warm up cache with common queries at startup');
console.log('  4. Monitor performance with getPerformanceStats()');
console.log('  5. Choose appropriate optimization profile with optimizeFor()');

// Cleanup resources
optimizedQuery.destroy();
profileQuery.destroy();
warmupQuery.destroy();
monitorQuery.destroy();

console.log('\n🏁 Demo completed - resources cleaned up!');