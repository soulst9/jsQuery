const Func = (module.exports = {
  count: (...arg) => {
    return Func.isAlias(`COUNT(${arg[0]})`, arg[1]);
  },
  ifnull: (...arg) => {
    return Func.isAlias(
      `IFNULL(${arg[0]}, ${Func.ifisString(arg[1])})`,
      arg[2]
    );
  },
  convert_tz: (...arg) => {
    return Func.isAlias(
      `CONVERT_TZ(${arg[0]}, '${arg[1]}', '${arg[2]}')`,
      arg[3]
    );
  },
  
  // Date/Time Functions
  now: (...arg) => {
    return Func.isAlias('NOW()', arg[0]);
  },
  curdate: (...arg) => {
    return Func.isAlias('CURDATE()', arg[0]);
  },
  curtime: (...arg) => {
    return Func.isAlias('CURTIME()', arg[0]);
  },
  date: (...arg) => {
    return Func.isAlias(`DATE(${arg[0]})`, arg[1]);
  },
  time: (...arg) => {
    return Func.isAlias(`TIME(${arg[0]})`, arg[1]);
  },
  year: (...arg) => {
    return Func.isAlias(`YEAR(${arg[0]})`, arg[1]);
  },
  month: (...arg) => {
    return Func.isAlias(`MONTH(${arg[0]})`, arg[1]);
  },
  day: (...arg) => {
    return Func.isAlias(`DAY(${arg[0]})`, arg[1]);
  },
  dayofweek: (...arg) => {
    return Func.isAlias(`DAYOFWEEK(${arg[0]})`, arg[1]);
  },
  dayofyear: (...arg) => {
    return Func.isAlias(`DAYOFYEAR(${arg[0]})`, arg[1]);
  },
  week: (...arg) => {
    return Func.isAlias(`WEEK(${arg[0]})`, arg[1]);
  },
  weekday: (...arg) => {
    return Func.isAlias(`WEEKDAY(${arg[0]})`, arg[1]);
  },
  date_add: (...arg) => {
    return Func.isAlias(
      `DATE_ADD(${arg[0]}, INTERVAL ${arg[1]} ${arg[2]})`,
      arg[3]
    );
  },
  date_sub: (...arg) => {
    return Func.isAlias(
      `DATE_SUB(${arg[0]}, INTERVAL ${arg[1]} ${arg[2]})`,
      arg[3]
    );
  },
  datediff: (...arg) => {
    return Func.isAlias(`DATEDIFF(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  date_format: (...arg) => {
    return Func.isAlias(
      `DATE_FORMAT(${arg[0]}, ${Func.ifisString(arg[1])})`,
      arg[2]
    );
  },
  unix_timestamp: (...arg) => {
    if (arg.length === 0) {
      return Func.isAlias('UNIX_TIMESTAMP()', arg[0]);
    }
    return Func.isAlias(`UNIX_TIMESTAMP(${arg[0]})`, arg[1]);
  },
  from_unixtime: (...arg) => {
    if (arg.length > 1 && arg[1]) {
      return Func.isAlias(
        `FROM_UNIXTIME(${arg[0]}, ${Func.ifisString(arg[1])})`,
        arg[2]
      );
    }
    return Func.isAlias(`FROM_UNIXTIME(${arg[0]})`, arg[1]);
  },
  
  // String Functions
  concat: (...arg) => {
    const alias = arg[arg.length - 1];
    const values = arg.slice(0, -1);
    const concatValues = values.map(val => 
      typeof val === 'string' ? Func.ifisString(val) : val
    ).join(', ');
    return Func.isAlias(`CONCAT(${concatValues})`, alias);
  },
  concat_ws: (...arg) => {
    const alias = arg[arg.length - 1];
    const separator = Func.ifisString(arg[0]);
    const values = arg.slice(1, -1);
    const concatValues = values.map(val => 
      typeof val === 'string' ? Func.ifisString(val) : val
    ).join(', ');
    return Func.isAlias(`CONCAT_WS(${separator}, ${concatValues})`, alias);
  },
  substring: (...arg) => {
    if (arg.length === 4) {
      // SUBSTRING(str, pos, len) AS alias
      return Func.isAlias(
        `SUBSTRING(${arg[0]}, ${arg[1]}, ${arg[2]})`,
        arg[3]
      );
    } else if (arg.length === 3) {
      // SUBSTRING(str, pos) AS alias
      return Func.isAlias(`SUBSTRING(${arg[0]}, ${arg[1]})`, arg[2]);
    }
    throw new Error('substring function requires 2-3 arguments plus alias');
  },
  substr: (...arg) => {
    // Alias for substring
    return Func.substring(...arg);
  },
  left: (...arg) => {
    return Func.isAlias(`LEFT(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  right: (...arg) => {
    return Func.isAlias(`RIGHT(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  upper: (...arg) => {
    return Func.isAlias(`UPPER(${arg[0]})`, arg[1]);
  },
  lower: (...arg) => {
    return Func.isAlias(`LOWER(${arg[0]})`, arg[1]);
  },
  trim: (...arg) => {
    return Func.isAlias(`TRIM(${arg[0]})`, arg[1]);
  },
  ltrim: (...arg) => {
    return Func.isAlias(`LTRIM(${arg[0]})`, arg[1]);
  },
  rtrim: (...arg) => {
    return Func.isAlias(`RTRIM(${arg[0]})`, arg[1]);
  },
  length: (...arg) => {
    return Func.isAlias(`LENGTH(${arg[0]})`, arg[1]);
  },
  char_length: (...arg) => {
    return Func.isAlias(`CHAR_LENGTH(${arg[0]})`, arg[1]);
  },
  replace: (...arg) => {
    return Func.isAlias(
      `REPLACE(${arg[0]}, ${Func.ifisString(arg[1])}, ${Func.ifisString(arg[2])})`,
      arg[3]
    );
  },
  reverse: (...arg) => {
    return Func.isAlias(`REVERSE(${arg[0]})`, arg[1]);
  },
  locate: (...arg) => {
    if (arg.length === 4) {
      // LOCATE(substr, str, pos) AS alias
      return Func.isAlias(
        `LOCATE(${Func.ifisString(arg[0])}, ${arg[1]}, ${arg[2]})`,
        arg[3]
      );
    } else if (arg.length === 3) {
      // LOCATE(substr, str) AS alias
      return Func.isAlias(
        `LOCATE(${Func.ifisString(arg[0])}, ${arg[1]})`,
        arg[2]
      );
    }
    throw new Error('locate function requires 2-3 arguments plus alias');
  },
  
  // Mathematical Functions
  abs: (...arg) => {
    return Func.isAlias(`ABS(${arg[0]})`, arg[1]);
  },
  ceil: (...arg) => {
    return Func.isAlias(`CEIL(${arg[0]})`, arg[1]);
  },
  ceiling: (...arg) => {
    return Func.isAlias(`CEILING(${arg[0]})`, arg[1]);
  },
  floor: (...arg) => {
    return Func.isAlias(`FLOOR(${arg[0]})`, arg[1]);
  },
  round: (...arg) => {
    if (arg.length === 3) {
      // ROUND(number, decimals) AS alias
      return Func.isAlias(`ROUND(${arg[0]}, ${arg[1]})`, arg[2]);
    }
    return Func.isAlias(`ROUND(${arg[0]})`, arg[1]);
  },
  mod: (...arg) => {
    return Func.isAlias(`MOD(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  pow: (...arg) => {
    return Func.isAlias(`POW(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  power: (...arg) => {
    return Func.isAlias(`POWER(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  sqrt: (...arg) => {
    return Func.isAlias(`SQRT(${arg[0]})`, arg[1]);
  },
  exp: (...arg) => {
    return Func.isAlias(`EXP(${arg[0]})`, arg[1]);
  },
  log: (...arg) => {
    if (arg.length === 3) {
      // LOG(base, number) AS alias
      return Func.isAlias(`LOG(${arg[0]}, ${arg[1]})`, arg[2]);
    }
    return Func.isAlias(`LOG(${arg[0]})`, arg[1]);
  },
  log10: (...arg) => {
    return Func.isAlias(`LOG10(${arg[0]})`, arg[1]);
  },
  log2: (...arg) => {
    return Func.isAlias(`LOG2(${arg[0]})`, arg[1]);
  },
  sin: (...arg) => {
    return Func.isAlias(`SIN(${arg[0]})`, arg[1]);
  },
  cos: (...arg) => {
    return Func.isAlias(`COS(${arg[0]})`, arg[1]);
  },
  tan: (...arg) => {
    return Func.isAlias(`TAN(${arg[0]})`, arg[1]);
  },
  asin: (...arg) => {
    return Func.isAlias(`ASIN(${arg[0]})`, arg[1]);
  },
  acos: (...arg) => {
    return Func.isAlias(`ACOS(${arg[0]})`, arg[1]);
  },
  atan: (...arg) => {
    return Func.isAlias(`ATAN(${arg[0]})`, arg[1]);
  },
  atan2: (...arg) => {
    return Func.isAlias(`ATAN2(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  pi: (...arg) => {
    return Func.isAlias('PI()', arg[0]);
  },
  radians: (...arg) => {
    return Func.isAlias(`RADIANS(${arg[0]})`, arg[1]);
  },
  degrees: (...arg) => {
    return Func.isAlias(`DEGREES(${arg[0]})`, arg[1]);
  },
  sign: (...arg) => {
    return Func.isAlias(`SIGN(${arg[0]})`, arg[1]);
  },
  rand: (...arg) => {
    if (arg.length > 0) {
      return Func.isAlias(`RAND(${arg[0]})`, arg[1]);
    }
    return Func.isAlias('RAND()', arg[0]);
  },
  
  // Aggregate Functions
  sum: (...arg) => {
    return Func.isAlias(`SUM(${arg[0]})`, arg[1]);
  },
  avg: (...arg) => {
    return Func.isAlias(`AVG(${arg[0]})`, arg[1]);
  },
  min: (...arg) => {
    return Func.isAlias(`MIN(${arg[0]})`, arg[1]);
  },
  max: (...arg) => {
    return Func.isAlias(`MAX(${arg[0]})`, arg[1]);
  },
  count_distinct: (...arg) => {
    return Func.isAlias(`COUNT(DISTINCT ${arg[0]})`, arg[1]);
  },
  group_concat: (...arg) => {
    if (arg.length === 3) {
      // GROUP_CONCAT(column SEPARATOR 'separator') AS alias
      return Func.isAlias(
        `GROUP_CONCAT(${arg[0]} SEPARATOR ${Func.ifisString(arg[1])})`,
        arg[2]
      );
    }
    return Func.isAlias(`GROUP_CONCAT(${arg[0]})`, arg[1]);
  },
  std: (...arg) => {
    return Func.isAlias(`STD(${arg[0]})`, arg[1]);
  },
  stddev: (...arg) => {
    return Func.isAlias(`STDDEV(${arg[0]})`, arg[1]);
  },
  variance: (...arg) => {
    return Func.isAlias(`VARIANCE(${arg[0]})`, arg[1]);
  },
  
  // Conditional Functions
  if: (...arg) => {
    if (arg.length !== 4) {
      throw new Error('if function requires exactly 3 arguments plus alias: condition, true_value, false_value, alias');
    }
    return Func.isAlias(
      `IF(${arg[0]}, ${arg[1]}, ${arg[2]})`,
      arg[3]
    );
  },
  case_when: (...arg) => {
    // Complex CASE statement builder
    // Usage: case_when([condition1, value1], [condition2, value2], else_value, alias)
    if (arg.length < 3) {
      throw new Error('case_when requires at least 2 when conditions plus else and alias');
    }
    
    const alias = arg[arg.length - 1];
    const elseValue = arg[arg.length - 2];
    const whenClauses = arg.slice(0, -2);
    
    let caseStatement = 'CASE';
    whenClauses.forEach(whenClause => {
      if (Array.isArray(whenClause) && whenClause.length === 2) {
        caseStatement += ` WHEN ${whenClause[0]} THEN ${whenClause[1]}`;
      } else {
        throw new Error('WHEN clauses must be arrays with [condition, value]');
      }
    });
    caseStatement += ` ELSE ${elseValue} END`;
    
    return Func.isAlias(caseStatement, alias);
  },
  coalesce: (...arg) => {
    if (arg.length < 2) {
      throw new Error('coalesce requires at least 1 argument plus alias');
    }
    const alias = arg[arg.length - 1];
    const values = arg.slice(0, -1);
    return Func.isAlias(`COALESCE(${values.join(', ')})`, alias);
  },
  nullif: (...arg) => {
    return Func.isAlias(`NULLIF(${arg[0]}, ${arg[1]})`, arg[2]);
  },
  greatest: (...arg) => {
    if (arg.length < 2) {
      throw new Error('greatest requires at least 1 argument plus alias');
    }
    const alias = arg[arg.length - 1];
    const values = arg.slice(0, -1);
    return Func.isAlias(`GREATEST(${values.join(', ')})`, alias);
  },
  least: (...arg) => {
    if (arg.length < 2) {
      throw new Error('least requires at least 1 argument plus alias');
    }
    const alias = arg[arg.length - 1];
    const values = arg.slice(0, -1);
    return Func.isAlias(`LEAST(${values.join(', ')})`, alias);
  },
  isAlias: (attr, as) => {
    if (as) {
      return `${attr} ${as}`;
    }
    return `${attr}`;
  },
  ifisString: val => {
    if (typeof val === "string") {
      // SQL injection prevention: escape single quotes and backslashes
      const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "''");
      return `'${escaped}'`;
    }
    else return val;
  },
  
  // Validate function arguments
  validateArgs: (...args) => {
    return args.map(arg => {
      if (arg === null || arg === undefined) return 'NULL';
      if (typeof arg === 'string') return Func.ifisString(arg);
      if (typeof arg === 'number') {
        if (!isFinite(arg)) throw new Error('Invalid number in function argument');
        return arg;
      }
      return arg;
    });
  }
});
