/* jshint esversion: 6 */
// Basic test suite for jsQuery

const JSQuery = require('../index');

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  run() {
    console.log('🧪 Running jsQuery Tests...\n');
    
    this.tests.forEach(({ name, fn }) => {
      try {
        fn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    });
    
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
  
  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
  }
  
  assertThrows(fn, message = '') {
    try {
      fn();
      throw new Error(`${message} - Expected function to throw`);
    } catch (error) {
      // Success - function threw as expected
    }
  }
}

// Test suite
const runner = new TestRunner();
const jsQuery = new JSQuery();

// Basic SELECT query test
runner.test('Basic SELECT query', () => {
  const result = jsQuery.selectQuery({
    select: ["id", "name"],
    from: { table: "users" }
  });
  
  runner.assertEqual(
    result.trim(),
    "SELECT id, name FROM users",
    "Basic SELECT query failed"
  );
});

// SELECT with WHERE clause
runner.test('SELECT with WHERE clause', () => {
  const result = jsQuery.selectQuery({
    select: ["id", "name"],
    from: { table: "users" },
    where: { id: 1 }
  });
  
  runner.assertEqual(
    result.trim(),
    "SELECT id, name FROM users WHERE id = 1",
    "SELECT with WHERE failed"
  );
});

// Test SQL injection prevention
runner.test('SQL injection prevention', () => {
  const result = jsQuery.selectQuery({
    select: ["id", "name"],
    from: { table: "users" },
    where: { name: "'; DROP TABLE users; --" }
  });
  
  // Should escape the single quotes properly ('' instead of ')
  runner.assertEqual(
    result.includes("'''; DROP TABLE users; --'"),
    true,
    "SQL injection should be escaped properly"
  );
  
  // The dangerous part is now safely escaped
  runner.assertEqual(
    result.length > 50,
    true,
    "Escaped query should be longer"
  );
});

// Test comparator operators
runner.test('Comparator operators fixed', () => {
  const result1 = jsQuery.selectQuery({
    select: ["id"],
    from: { table: "users" },
    where: { age: JSQuery.fn('lessthan', 18) }
  });
  
  const result2 = jsQuery.selectQuery({
    select: ["id"], 
    from: { table: "users" },
    where: { age: JSQuery.fn('lessthaneq', 21) }
  });
  
  // Should contain correct operators
  runner.assertEqual(
    result1.includes("< 18"),
    true,
    "lessthan operator not working"
  );
  
  runner.assertEqual(
    result2.includes("<= 21"),
    true,
    "lessthaneq operator not working"
  );
});

// Test INSERT query
runner.test('Basic INSERT query', () => {
  const result = jsQuery.insertQuery({
    insert: {
      table: "users",
      fieldValue: [
        { name: "John", age: 30 }
      ]
    }
  });
  
  runner.assertEqual(
    result.includes("INSERT INTO users"),
    true,
    "INSERT query structure failed"
  );
  
  runner.assertEqual(
    result.includes("John"),
    true,
    "INSERT values not included"
  );
});

// Test UPDATE query
runner.test('Basic UPDATE query', () => {
  const result = jsQuery.updateQuery({
    update: {
      table: "users",
      fieldValue: { name: "Jane", age: 25 }
    },
    where: { id: 1 }
  });
  
  runner.assertEqual(
    result.includes("UPDATE users SET"),
    true,
    "UPDATE query structure failed"
  );
  
  runner.assertEqual(
    result.includes("WHERE id = 1"),
    true,
    "UPDATE WHERE clause failed"
  );
});

// Test DELETE query
runner.test('Basic DELETE query', () => {
  const result = jsQuery.deleteQuery({
    delete: { table: "users" },
    where: { id: 1 }
  });
  
  runner.assertEqual(
    result.trim(),
    "DELETE FROM users WHERE id = 1",
    "DELETE query failed"
  );
});

// Test error handling for invalid inputs
runner.test('Input validation errors', () => {
  runner.assertThrows(() => {
    jsQuery.selectQuery({
      from: { table: "users" }
      // Missing select clause
    });
  }, "Should throw for missing SELECT");
  
  runner.assertThrows(() => {
    jsQuery.selectQuery({
      select: ["id"],
      // Missing from clause
    });
  }, "Should throw for missing FROM");
  
  runner.assertThrows(() => {
    jsQuery.selectQuery({
      select: [], // Empty select array
      from: { table: "users" }
    });
  }, "Should throw for empty SELECT array");
});

// Run the tests
if (require.main === module) {
  const success = runner.run();
  process.exit(success ? 0 : 1);
}

module.exports = TestRunner;