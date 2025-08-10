# jsQuery

A lightweight JavaScript library that converts JavaScript objects into SQL statements. Build complex SQL queries using familiar JavaScript syntax.

## ✨ Features

- 🔄 **Object-to-SQL Conversion**: Transform JS objects to SQL statements
- 🛡️ **SQL Injection Protection**: Built-in escaping and validation
- 🏗️ **Query Builder**: Support for SELECT, INSERT, UPDATE, DELETE
- 🔧 **Functions & Operators**: 60+ MySQL functions and comparison operators
- 🎯 **Subqueries**: Nested query support
- ✅ **Type Safe**: Input validation and error handling
- 🧪 **Tested**: Comprehensive test suite with 23+ test cases
- 🚀 **High Performance**: Enterprise-grade caching and optimization
- ⚡ **Lazy Evaluation**: Defer compilation until needed
- 📊 **Performance Monitoring**: Built-in metrics and profiling
- 🎛️ **Configurable**: Multiple optimization profiles

## 📦 Installation

```bash
npm install @jsquery/core
```

## 🚀 Quick Start

```javascript
const JSQuery = require('@jsquery/core');

// Basic usage
const jsQuery = new JSQuery();
const query = jsQuery.selectQuery({
  select: ["id", "name", "email"],
  from: { table: "users" },
  where: { active: 1 }
});
// Output: SELECT id, name, email FROM users WHERE active = 1

// High-performance mode (recommended for production)
const optimized = new JSQuery({ 
  performance: true,  // Enable all optimizations
  cache: true,        // Query caching
  pooling: true       // Object pooling
});

// Advanced query with functions
const advancedQuery = optimized.selectQuery({
  select: [
    "id",
    JSQuery.fn('upper', 'name', 'display_name'),
    JSQuery.fn('date_format', 'created_at', '%Y-%m-%d', 'created_date'),
    JSQuery.fn('if', 'age >= 18', "'Adult'", "'Minor'", 'age_group')
  ],
  from: { table: "users" },
  where: {
    created_at: JSQuery.fn('gtthan', JSQuery.fn('date_sub', JSQuery.fn('now'), 30, 'DAY'))
  }
});

// Lazy evaluation for complex queries
const lazyQuery = optimized.lazy()
  .select({
    select: ['id', 'name'],
    from: { table: 'users' }
  })
  .where({ active: 1 })
  .orderBy(['created_at DESC'])
  .limit(0, 10);

// SQL is compiled only when needed
const sql = lazyQuery.toSql();

// Performance monitoring
const stats = optimized.getPerformanceStats();
console.log('Cache Hit Rate:', stats.cache.sql.hitRate);
```

## 🔍 API Reference

### Select Queries

```javascript
// Basic SELECT
jsQuery.selectQuery({
  select: ["column1", "column2"],
  from: { table: "table_name" }
});

// SELECT with WHERE
jsQuery.selectQuery({
  select: ["*"],
  from: { table: "users" },
  where: { 
    age: JSQuery.fn('gtthan', 18),
    status: 'active'
  }
});

// SELECT with JOIN
jsQuery.selectQuery({
  select: ["u.name", "p.title"],
  from: { table: "users", options: { as: "u" } },
  join: [{
    table: "posts",
    type: "LEFT JOIN",
    foreignKeys: ["user_id"],
    options: { as: "p" }
  }]
});
```

### Insert Queries

```javascript
jsQuery.insertQuery({
  insert: {
    table: "users",
    fieldValue: [
      { name: "John", email: "john@example.com", age: 30 },
      { name: "Jane", email: "jane@example.com", age: 25 }
    ]
  }
});
```

### Update Queries  

```javascript
jsQuery.updateQuery({
  update: {
    table: "users",
    fieldValue: { 
      name: "John Updated",
      last_modified: JSQuery.fn('now')
    }
  },
  where: { id: 1 }
});
```

### Delete Queries

```javascript
jsQuery.deleteQuery({
  delete: { table: "users" },
  where: { inactive: 1 }
});
```

## 🛠️ Available Functions & Operators

### Comparison Operators
- `JSQuery.fn('eq', value)` - Equals (=)
- `JSQuery.fn('gtthan', value)` - Greater than (>)  
- `JSQuery.fn('gtthaneq', value)` - Greater than or equal (>=)
- `JSQuery.fn('lessthan', value)` - Less than (<)
- `JSQuery.fn('lessthaneq', value)` - Less than or equal (<=)
- `JSQuery.fn('noteq', value)` - Not equal (!=)
- `JSQuery.fn('like', value)` - LIKE pattern matching

### MySQL Functions

#### Date/Time Functions
- `JSQuery.fn('now')` - Current timestamp (NOW())
- `JSQuery.fn('curdate')` - Current date (CURDATE())
- `JSQuery.fn('curtime')` - Current time (CURTIME())
- `JSQuery.fn('date', column)` - Extract date part (DATE())
- `JSQuery.fn('year', column)` - Extract year (YEAR())
- `JSQuery.fn('month', column)` - Extract month (MONTH())
- `JSQuery.fn('day', column)` - Extract day (DAY())
- `JSQuery.fn('date_add', date, interval, unit)` - Add time interval
- `JSQuery.fn('date_sub', date, interval, unit)` - Subtract time interval
- `JSQuery.fn('datediff', date1, date2)` - Difference between dates
- `JSQuery.fn('date_format', date, format)` - Format date string
- `JSQuery.fn('unix_timestamp', date?)` - Convert to Unix timestamp
- `JSQuery.fn('from_unixtime', timestamp, format?)` - Convert from Unix timestamp

#### String Functions
- `JSQuery.fn('concat', str1, str2, ...)` - Concatenate strings
- `JSQuery.fn('concat_ws', separator, str1, str2, ...)` - Concatenate with separator
- `JSQuery.fn('substring', string, pos, length?)` - Extract substring
- `JSQuery.fn('upper', string)` - Convert to uppercase
- `JSQuery.fn('lower', string)` - Convert to lowercase
- `JSQuery.fn('trim', string)` - Remove leading/trailing spaces
- `JSQuery.fn('length', string)` - String length
- `JSQuery.fn('replace', string, search, replace)` - Replace substring
- `JSQuery.fn('left', string, length)` - Left portion of string
- `JSQuery.fn('right', string, length)` - Right portion of string

#### Mathematical Functions
- `JSQuery.fn('abs', number)` - Absolute value
- `JSQuery.fn('round', number, decimals?)` - Round number
- `JSQuery.fn('ceil', number)` - Ceiling (round up)
- `JSQuery.fn('floor', number)` - Floor (round down)
- `JSQuery.fn('pow', base, exponent)` - Power function
- `JSQuery.fn('sqrt', number)` - Square root
- `JSQuery.fn('mod', dividend, divisor)` - Modulo operation
- `JSQuery.fn('rand', seed?)` - Random number

#### Aggregate Functions
- `JSQuery.fn('count', column)` - COUNT function
- `JSQuery.fn('sum', column)` - SUM function
- `JSQuery.fn('avg', column)` - Average (AVG)
- `JSQuery.fn('min', column)` - Minimum value
- `JSQuery.fn('max', column)` - Maximum value
- `JSQuery.fn('count_distinct', column)` - COUNT(DISTINCT column)
- `JSQuery.fn('group_concat', column, separator?)` - GROUP_CONCAT

#### Conditional Functions
- `JSQuery.fn('if', condition, true_value, false_value)` - IF statement
- `JSQuery.fn('case_when', [condition1, value1], [condition2, value2], else_value)` - CASE WHEN
- `JSQuery.fn('coalesce', value1, value2, ...)` - First non-null value
- `JSQuery.fn('ifnull', column, default)` - IFNULL function

#### Other Functions
- `JSQuery.fn('convert_tz', datetime, from_tz, to_tz)` - CONVERT_TZ function

### Logical Operators
- `JSQuery.and(condition1, condition2, ...)` - AND operator
- `JSQuery.or(condition1, condition2, ...)` - OR operator

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🔒 Security

jsQuery includes built-in protection against SQL injection:

- ✅ **String Escaping**: Automatic escaping of single quotes and backslashes
- ✅ **Input Validation**: Type checking and validation for all inputs  
- ✅ **Parameter Binding**: Safe parameter binding for all query types
- ✅ **Error Handling**: Descriptive error messages without exposing internals

# example 1
```
const example1 = jsQuery.selectQuery(
  {
    select: ["_id", "idx", "name"],
    from: { 
      table: "tb_products"
    },
    where: {
      _id: 1
    },
    groupby: [
      "idx",
      "name"
    ],
    orderby: [
      "idx",
      "name"
    ],
    limit: {
      offset: 0,
      count: 10
    }
  }
);
```

**This is the result of a string type**

```
SELECT _id, idx, name FROM tb_products WHERE _id = 1 GROUP BY idx,name ORDER BY idx,name LIMIT 0, 10
```

# example 2
```
const example2 = jsQuery.selectQuery(
  {
    select: ["_id", "idx", "fKey"],
    from: { 
      table: {
        select: ["_id", "idx", "fKey"],
        from: { table: "tb_images" },
        where: {
          idx: 0
        }
      },
      options: { as: "a" }
    }
  }
);
```

**This is the result of a string type**

```
SELECT _id, idx, fKey FROM (SELECT _id, idx, fKey FROM tb_images WHERE idx = 0) a
```



# example 3

```
const example3 = jsQuery.selectQuery(
  {
    select: ["_id", "idx", "fKey"],
    from: { 
      table: {
        select: ["_id", "idx", "fKey"],
        from: { 
          table: {
            select: ["_id", "idx", "fKey"],
            from: { table: "tb_images" },
            where: {
              idx: 0
            }
          },
          options: { 
            as: 'a' 
          }
        },
      },
    }
  }
);
```

**This is the result of a string type**

```
SELECT _id, idx, fKey FROM (SELECT _id, idx, fKey FROM (SELECT _id, idx, fKey FROM tb_images WHERE idx = 0) a) tb_images
```



# example 4

```
const example4 = jsQuery.selectQuery(
  {
    select: ["_id", "idx", "name"],
    from: { 
      table: "tb_products"
    },
    join: [
      {
        table: {
          select: ["_id", "filename"],
          from: { table: "tb_images" },
          where: {
            idx: 0
          }
        },
        type: "LEFT JOIN",
        foreignKeys: ["_id"],
        options: {
          as: "b" 
        }
      }
    ]
  }
);
```

**This is the result of a string type**

```
SELECT tb_products._id, tb_products.idx, IFNULL(tb_products.name, ''), tb_images._id, tb_images.filename FROM tb_products LEFT JOIN (SELECT tb_images._id, tb_images.filename FROM tb_images WHERE idx = 0) tb_images ON tb_products._id = tb_images._id
```

#example 5

```
const q5 = jsQuery.selectQuery(
  {
    select: ["_id", "idx", JSQuery.fn("ifnull", "name", "")],
    from: { 
      table: "tb_products"
    },
    where: {
      idx: JSQuery.fn('gtthan', 10)
    }
  }
);
```

**This is the result of a string type**

```
SELECT _id, idx, CONVERT_TZ(createdAt, 'UTC', 'Asia/Seoul') createdAt FROM tb_products WHERE idx > 10
```





## INSERT QUERY

# example 1
```
const example1 = jsQuery.insertQuery({
  insert: {
    table: "tb_images",
    fieldValue: [ 
      {
        tabmenu: "products", 
        childmenu: "korea",
        content: "main",
        _id: 36,
        idx: 0,
        album: "products",
        fkey: "20190911/36",
        filename: "20190911170901_wtfxcxqx.jpg"    
      },
      {
        tabmenu: "products", 
        childmenu: "korea",
        content: "main",
        _id: 37,
        idx: 0,
        album: "products",
        fkey: "20190911/37",
        filename: "20190911170901_wtfxcxqx.jpg"    
      }
    ],
    onDuplicateKeyUpdate: {
      is_cancel: "1"
    }
  }
});
```
**This is the result of a string type**

```
INSERT INTO tb_images (tabmenu, childmenu, content, _id, idx, album, fkey, filename) VALUES ('products', 'korea', 'main', 36, 0, 'products', '20190911/36', '20190911170901_wtfxcxqx.jpg'), ('products', 'korea', 'main', 37, 0, 'products', '20190911/37', '20190911170901_wtfxcxqx.jpg') ON DUPLICATE KEY UPDATE filename = '20190911170901_wtfxcxqx.wepb'
```



## UPDATE QUERY

# example 1
```
const updateQuery = jsQuery.updateQuery({
  update: {
    table: "tb_images",
    fieldValue: {
      album: "products",
      fkey: "20190911/36",
      filename: "20190911170901_wtfxcxqx.jpg"
    },
  },
  where: {
    _id: 1
  }
});
```

**This is the result of a string type**

```
UPDATE tb_images SET album = 'products', fkey = '20190911/36', filename = '20190911170901_wtfxcxqx.jpg' WHERE _id = 1
```



## DELETE QUERY

# example 1
```
const deleteQuery = jsQuery.deleteQuery({
  delete: {
    table: "tb_images"
  },
  where: {
    _id: 1
  }
});
```

**This is the result of a string type**

```
DELETE FROM tb_images WHERE _id = 1
```

