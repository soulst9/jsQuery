/* jshint esversion: 6 */
// Enhanced function test suite for jsQuery

const JSQuery = require('../index');

// Simple test runner (reuse from basic.test.js)
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
    console.log('🧪 Running jsQuery Enhanced Functions Tests...\n');
    
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
  
  assertContains(actual, expected, message = '') {
    if (!actual.includes(expected)) {
      throw new Error(`${message}\n  Expected to contain: ${expected}\n  Actual: ${actual}`);
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

// Date/Time Functions Tests
runner.test('Date functions - NOW, CURDATE, CURTIME', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('now', 'current_time'),
      JSQuery.fn('curdate', 'current_date'),
      JSQuery.fn('curtime', 'current_time_only')
    ],
    from: { table: 'dual' }
  });
  
  runner.assertContains(query, 'NOW() current_time', 'NOW function failed');
  runner.assertContains(query, 'CURDATE() current_date', 'CURDATE function failed');
  runner.assertContains(query, 'CURTIME() current_time_only', 'CURTIME function failed');
});

runner.test('Date extraction functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('year', 'created_at', 'created_year'),
      JSQuery.fn('month', 'created_at', 'created_month'),
      JSQuery.fn('day', 'created_at', 'created_day')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, 'YEAR(created_at) created_year', 'YEAR function failed');
  runner.assertContains(query, 'MONTH(created_at) created_month', 'MONTH function failed');
  runner.assertContains(query, 'DAY(created_at) created_day', 'DAY function failed');
});

runner.test('Date arithmetic functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('date_add', 'created_at', 30, 'DAY', 'future_date'),
      JSQuery.fn('datediff', 'updated_at', 'created_at', 'days_diff')
    ],
    from: { table: 'posts' }
  });
  
  runner.assertContains(query, 'DATE_ADD(created_at, INTERVAL 30 DAY) future_date', 'DATE_ADD function failed');
  runner.assertContains(query, 'DATEDIFF(updated_at, created_at) days_diff', 'DATEDIFF function failed');
});

// String Functions Tests
runner.test('String manipulation functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('upper', 'name', 'name_upper'),
      JSQuery.fn('lower', 'email', 'email_lower'),
      JSQuery.fn('length', 'description', 'desc_length')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, 'UPPER(name) name_upper', 'UPPER function failed');
  runner.assertContains(query, 'LOWER(email) email_lower', 'LOWER function failed');
  runner.assertContains(query, 'LENGTH(description) desc_length', 'LENGTH function failed');
});

runner.test('String concatenation functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('concat', 'first_name', 'last_name', 'full_name'),
      JSQuery.fn('concat_ws', ' ', 'first_name', 'last_name', 'spaced_name')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, "CONCAT('first_name', 'last_name') full_name", 'CONCAT function failed');
  runner.assertContains(query, "CONCAT_WS(' ', 'first_name', 'last_name') spaced_name", 'CONCAT_WS function failed');
});

runner.test('Substring functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('substring', 'name', 1, 3, 'name_prefix'),
      JSQuery.fn('left', 'email', 5, 'email_start'),
      JSQuery.fn('right', 'phone', 4, 'phone_end')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, 'SUBSTRING(name, 1, 3) name_prefix', 'SUBSTRING function failed');
  runner.assertContains(query, 'LEFT(email, 5) email_start', 'LEFT function failed');
  runner.assertContains(query, 'RIGHT(phone, 4) phone_end', 'RIGHT function failed');
});

// Mathematical Functions Tests
runner.test('Basic math functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('abs', 'balance', 'abs_balance'),
      JSQuery.fn('round', 'price', 2, 'rounded_price'),
      JSQuery.fn('ceil', 'rating', 'ceiling_rating')
    ],
    from: { table: 'products' }
  });
  
  runner.assertContains(query, 'ABS(balance) abs_balance', 'ABS function failed');
  runner.assertContains(query, 'ROUND(price, 2) rounded_price', 'ROUND function failed');
  runner.assertContains(query, 'CEIL(rating) ceiling_rating', 'CEIL function failed');
});

runner.test('Advanced math functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('pow', 'base', 2, 'squared'),
      JSQuery.fn('sqrt', 'area', 'side_length'),
      JSQuery.fn('mod', 'id', 10, 'id_mod')
    ],
    from: { table: 'calculations' }
  });
  
  runner.assertContains(query, 'POW(base, 2) squared', 'POW function failed');
  runner.assertContains(query, 'SQRT(area) side_length', 'SQRT function failed');
  runner.assertContains(query, 'MOD(id, 10) id_mod', 'MOD function failed');
});

// Aggregate Functions Tests
runner.test('Aggregate functions', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('sum', 'amount', 'total_amount'),
      JSQuery.fn('avg', 'rating', 'avg_rating'),
      JSQuery.fn('count_distinct', 'user_id', 'unique_users')
    ],
    from: { table: 'orders' }
  });
  
  runner.assertContains(query, 'SUM(amount) total_amount', 'SUM function failed');
  runner.assertContains(query, 'AVG(rating) avg_rating', 'AVG function failed');
  runner.assertContains(query, 'COUNT(DISTINCT user_id) unique_users', 'COUNT_DISTINCT function failed');
});

runner.test('GROUP_CONCAT function', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('group_concat', 'name', 'all_names'),
      JSQuery.fn('group_concat', 'email', '|', 'piped_emails')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, 'GROUP_CONCAT(name) all_names', 'GROUP_CONCAT simple failed');
  runner.assertContains(query, "GROUP_CONCAT(email SEPARATOR '|') piped_emails", 'GROUP_CONCAT with separator failed');
});

// Conditional Functions Tests
runner.test('IF function', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('if', 'age >= 18', "'Adult'", "'Minor'", 'age_group')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, "IF(age >= 18, 'Adult', 'Minor') age_group", 'IF function failed');
});

runner.test('CASE WHEN function', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('case_when', 
        ['score >= 90', "'A'"], 
        ['score >= 80', "'B'"], 
        ['score >= 70', "'C'"], 
        "'F'", 
        'grade'
      )
    ],
    from: { table: 'students' }
  });
  
  runner.assertContains(query, 'CASE WHEN score >= 90 THEN', 'CASE WHEN structure failed');
  runner.assertContains(query, "ELSE 'F' END grade", 'CASE WHEN else clause failed');
});

runner.test('COALESCE function', () => {
  const query = jsQuery.selectQuery({
    select: [
      JSQuery.fn('coalesce', 'nickname', 'first_name', "'Anonymous'", 'display_name')
    ],
    from: { table: 'users' }
  });
  
  runner.assertContains(query, "COALESCE(nickname, first_name, 'Anonymous') display_name", 'COALESCE function failed');
});

// Error handling tests
runner.test('Function error handling', () => {
  runner.assertThrows(() => {
    JSQuery.fn('if', 'condition', 'true_val'); // Missing false_val and alias
  }, 'IF function should require exactly 4 arguments');
  
  runner.assertThrows(() => {
    JSQuery.fn('nonexistent_function', 'arg1');
  }, 'Should throw for non-existent function');
});

// Integration test with WHERE clause
runner.test('Functions in WHERE clause', () => {
  const query = jsQuery.selectQuery({
    select: ['id', 'name'],
    from: { table: 'users' },
    where: {
      created_at: JSQuery.fn('date_add', JSQuery.fn('curdate'), -30, 'DAY')
    }
  });
  
  runner.assertContains(query, 'DATE_ADD(CURDATE(), INTERVAL -30 DAY)', 'Nested functions in WHERE failed');
});

// Run the tests
if (require.main === module) {
  const success = runner.run();
  process.exit(success ? 0 : 1);
}

module.exports = TestRunner;