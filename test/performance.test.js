/* jshint esversion: 6 */
// Performance benchmarks and profiler for jsQuery

const JSQuery = require('../index');

class PerformanceBenchmark {
  constructor() {
    this.results = [];
  }

  async benchmark(name, iterations, testFn) {
    console.log(`\n🏃 Running benchmark: ${name} (${iterations} iterations)`);
    
    // Warm up
    for (let i = 0; i < Math.min(iterations / 10, 100); i++) {
      await testFn();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const startMemory = process.memoryUsage();
    const startTime = process.hrtime.bigint();

    // Run benchmark
    for (let i = 0; i < iterations; i++) {
      await testFn();
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const avgTime = totalTime / iterations;
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    const result = {
      name,
      iterations,
      totalTime: totalTime.toFixed(2),
      avgTime: avgTime.toFixed(4),
      opsPerSecond: (1000 / avgTime).toFixed(0),
      memoryDelta: (memoryDelta / 1024 / 1024).toFixed(2), // MB
      throughput: (iterations / (totalTime / 1000)).toFixed(0)
    };

    console.log(`  ⏱️  Total: ${result.totalTime}ms | Avg: ${result.avgTime}ms | Ops/sec: ${result.opsPerSecond}`);
    console.log(`  🧠 Memory: ${result.memoryDelta}MB | Throughput: ${result.throughput} ops/sec`);

    this.results.push(result);
    return result;
  }

  compareResults(baseline, optimized) {
    const speedImprovement = ((baseline.avgTime - optimized.avgTime) / baseline.avgTime * 100);
    const throughputImprovement = ((optimized.throughput - baseline.throughput) / baseline.throughput * 100);
    const memoryImprovement = ((baseline.memoryDelta - optimized.memoryDelta) / Math.abs(baseline.memoryDelta) * 100);

    console.log(`\n📊 Performance Comparison:`);
    console.log(`  Speed improvement: ${speedImprovement > 0 ? '+' : ''}${speedImprovement.toFixed(1)}%`);
    console.log(`  Throughput improvement: ${throughputImprovement > 0 ? '+' : ''}${throughputImprovement.toFixed(1)}%`);
    console.log(`  Memory improvement: ${memoryImprovement > 0 ? '+' : ''}${memoryImprovement.toFixed(1)}%`);

    return {
      speedImprovement,
      throughputImprovement,
      memoryImprovement
    };
  }

  generateReport() {
    console.log('\n📋 Performance Report Summary');
    console.log('=' .repeat(50));
    
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   Avg Time: ${result.avgTime}ms | Ops/sec: ${result.opsPerSecond} | Memory: ${result.memoryDelta}MB`);
    });
  }
}

// Benchmark test scenarios
async function runPerformanceTests() {
  console.log('🚀 jsQuery Performance Testing Suite\n');
  
  const benchmark = new PerformanceBenchmark();
  const iterations = 10000;

  // Test data
  const simpleSelectParams = {
    select: ["id", "name", "email"],
    from: { table: "users" },
    where: { active: 1 }
  };

  const complexSelectParams = {
    select: [
      "id", 
      "name", 
      JSQuery.fn('upper', 'email', 'email_upper'),
      JSQuery.fn('date_format', 'created_at', '%Y-%m-%d', 'created_date'),
      JSQuery.fn('if', 'active = 1', "'Yes'", "'No'", 'active_text')
    ],
    from: { table: "users" },
    where: {
      active: 1,
      created_at: JSQuery.fn('gtthan', JSQuery.fn('date_sub', JSQuery.fn('now'), 30, 'DAY'))
    },
    orderby: ["created_at"],
    limit: { offset: 0, count: 50 }
  };

  // Baseline tests (without performance optimizations)
  console.log('🔍 Baseline Performance (No Optimizations)');
  const baselineQuery = new JSQuery({ performance: false, cache: false, pooling: false });

  const baselineSimple = await benchmark.benchmark(
    'Baseline Simple SELECT',
    iterations,
    () => baselineQuery.selectQuery(simpleSelectParams)
  );

  const baselineComplex = await benchmark.benchmark(
    'Baseline Complex SELECT',
    iterations / 2, // Complex queries take longer
    () => baselineQuery.selectQuery(complexSelectParams)
  );

  // Optimized tests (with all performance features)
  console.log('\n🚀 Optimized Performance (All Features Enabled)');
  const optimizedQuery = new JSQuery({ performance: true, cache: true, pooling: true });

  const optimizedSimple = await benchmark.benchmark(
    'Optimized Simple SELECT',
    iterations,
    () => optimizedQuery.selectQuery(simpleSelectParams)
  );

  const optimizedComplex = await benchmark.benchmark(
    'Optimized Complex SELECT',
    iterations / 2,
    () => optimizedQuery.selectQuery(complexSelectParams)
  );

  // Cache effectiveness test
  console.log('\n💾 Cache Effectiveness Test');
  const cachedQuery = new JSQuery({ performance: true, cache: true, pooling: true });

  await benchmark.benchmark(
    'Cached Repeated Queries',
    iterations * 2,
    () => {
      // Same query repeated - should hit cache
      cachedQuery.selectQuery(simpleSelectParams);
      cachedQuery.selectQuery(simpleSelectParams);
    }
  );

  // Function performance test
  console.log('\n🔧 Function Performance Test');
  const functionParams = {
    select: [
      JSQuery.fn('concat', 'first_name', 'last_name', 'full_name'),
      JSQuery.fn('upper', 'email', 'email_upper'),
      JSQuery.fn('round', 'balance', 2, 'rounded_balance'),
      JSQuery.fn('date_format', 'created_at', '%Y-%m-%d', 'created_date'),
      JSQuery.fn('if', 'active = 1', "'Yes'", "'No'", 'active_text')
    ],
    from: { table: "users" }
  };

  await benchmark.benchmark(
    'Function-Heavy Query',
    iterations / 4,
    () => optimizedQuery.selectQuery(functionParams)
  );

  // Memory stress test
  console.log('\n🧠 Memory Stress Test');
  await benchmark.benchmark(
    'High-Volume Query Generation',
    iterations / 10,
    () => {
      for (let i = 0; i < 100; i++) {
        const params = {
          select: [`id${i}`, `name${i}`, `email${i}`],
          from: { table: `table${i}` },
          where: { [`field${i}`]: i }
        };
        optimizedQuery.selectQuery(params);
      }
    }
  );

  // Performance comparisons
  console.log('\n🔬 Performance Analysis');
  benchmark.compareResults(baselineSimple, optimizedSimple);
  benchmark.compareResults(baselineComplex, optimizedComplex);

  // Show performance stats
  console.log('\n📈 Query Performance Statistics');
  const stats = optimizedQuery.getPerformanceStats();
  console.log('Metrics:', stats.metrics);
  console.log('Cache Stats:', stats.cache);
  console.log('Pool Stats:', stats.pools);

  // Generate final report
  benchmark.generateReport();

  // Specific performance recommendations
  console.log('\n💡 Performance Recommendations');
  if (stats.metrics.cacheHits / (stats.metrics.cacheHits + stats.metrics.cacheMisses) > 0.5) {
    console.log('  ✅ Cache is effective - keep caching enabled');
  } else {
    console.log('  ⚠️  Low cache hit rate - consider disabling cache for varied queries');
  }

  if (stats.pools.arrays.reuseRate > '50%') {
    console.log('  ✅ Object pooling is effective');
  } else {
    console.log('  ⚠️  Object pooling has low reuse rate');
  }

  console.log('  💡 For best performance:');
  console.log('    - Use jsQuery.optimizeFor("speed") for high-throughput scenarios');
  console.log('    - Use jsQuery.optimizeFor("memory") for memory-constrained environments');
  console.log('    - Pre-warm cache with common queries using warmupCache()');
  console.log('    - Monitor performance with getPerformanceStats()');
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { PerformanceBenchmark, runPerformanceTests };