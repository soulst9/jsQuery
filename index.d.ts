// Type definitions for jsQuery
// Project: jsQuery
// Definitions by: jsQuery Team

declare module 'jsquery' {
  
  // Basic types
  type SQLValue = string | number | boolean | null;
  type ColumnName = string;
  type TableName = string;
  
  // Query options
  interface QueryOptions {
    isRoot?: boolean;
    hasJoin?: boolean;
    baseAlias?: string;
    as?: string;
  }
  
  // SELECT query types
  interface FromClause {
    table: TableName | SelectQueryParams;
    options?: QueryOptions;
  }
  
  interface JoinClause {
    table: TableName | SelectQueryParams;
    type: string; // 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', etc.
    foreignKeys: string[];
    options?: QueryOptions;
  }
  
  interface LimitClause {
    offset: number;
    count: number;
  }
  
  interface SelectQueryParams {
    select: ColumnName[];
    from: FromClause;
    join?: JoinClause[];
    where?: Record<string, SQLValue>;
    groupby?: ColumnName[];
    orderby?: ColumnName[];
    limit?: LimitClause;
  }
  
  // INSERT query types
  interface InsertClause {
    table: TableName;
    fieldValue: Record<string, SQLValue>[];
    onDuplicateKeyUpdate?: Record<string, SQLValue>;
  }
  
  interface InsertQueryParams {
    insert: InsertClause;
    select?: SelectQueryParams;
  }
  
  // UPDATE query types
  interface UpdateClause {
    table: TableName;
    fieldValue: Record<string, SQLValue>;
  }
  
  interface UpdateQueryParams {
    update: UpdateClause;
    where?: Record<string, SQLValue>;
    orderby?: ColumnName[];
    limit?: LimitClause;
  }
  
  // DELETE query types
  interface DeleteClause {
    table: TableName;
  }
  
  interface DeleteQueryParams {
    delete: DeleteClause;
    where: Record<string, SQLValue>;
  }
  
  // Function return types
  type ComparatorFunction = [symbol, string];
  type SQLFunction = string;
  
  // Main JSQuery class
  class JSQuery {
    constructor();
    
    // Query methods
    selectQuery(bindParam: SelectQueryParams, options?: QueryOptions): string;
    insertQuery(bindParam: InsertQueryParams, options?: QueryOptions): string;
    updateQuery(bindParam: UpdateQueryParams, options?: QueryOptions): string;
    deleteQuery(bindParam: DeleteQueryParams, options?: QueryOptions): string;
    
    // Static utility methods
    static and(...conditions: Record<string, SQLValue>[]): Record<symbol, Record<string, SQLValue>[]>;
    static or(...conditions: Record<string, SQLValue>[]): Record<symbol, Record<string, SQLValue>[]>;
    static fn(functionName: string, ...args: SQLValue[]): ComparatorFunction | SQLFunction;
  }
  
  // Export the class
  export = JSQuery;
}

// Global type augmentation for Node.js require
declare global {
  namespace NodeJS {
    interface Require {
      (id: 'jsquery'): typeof import('jsquery');
    }
  }
}