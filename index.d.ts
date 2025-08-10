// Type definitions for @jsquery/core
// Project: jsQuery - Enterprise SQL Query Builder  
// Definitions by: jsQuery Team & Claude AI

declare module '@jsquery/core' {
  
  // Basic types
  type SQLValue = string | number | boolean | null;
  type ColumnName = string;
  type TableName = string;
  
  // Constructor options
  interface JSQueryOptions {
    performance?: boolean;
    cache?: boolean;
    pooling?: boolean;
    profile?: 'speed' | 'memory' | 'minimal';
  }
  
  // Query options
  interface QueryOptions {
    isRoot?: boolean;
    hasJoin?: boolean;
    baseAlias?: string;
    as?: string;
    skipCache?: boolean;
    profile?: boolean;
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
    fieldValue: Record<string, SQLValue>[] | Record<string, SQLValue>;
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
    where?: Record<string, SQLValue>;
  }
  
  // Function return types
  type ComparatorFunction = [symbol, string];
  type SQLFunction = string;
  
  // Performance statistics types
  interface CacheStats {
    size: number;
    hitRate: number;
    hits: number;
    misses: number;
    evictions: number;
  }
  
  interface PerformanceStats {
    cache: {
      sql: CacheStats;
      functions: CacheStats;
      templates: CacheStats;
    };
    objectPool: {
      created: number;
      reused: number;
      currentSize: number;
    };
    queries: {
      total: number;
      cached: number;
      compiled: number;
    };
    memory: {
      heapUsed: number;
      heapTotal: number;
    };
    timing: {
      avgQueryTime: number;
      totalQueryTime: number;
    };
  }
  
  // Lazy query types
  interface LazyQueryStats {
    compiled: boolean;
    accessCount: number;
    compilationTime: number;
    lastAccessed: number;
    dependencies: string[];
    queryType: string;
    hasOptions: boolean;
  }
  
  interface LazyBuilderStats {
    totalQueries: number;
    compiled: number;
    uncompiled: number;
    totalAccess: number;
    totalCompilationTime: number;
    avgCompilationTime: number;
    byType: Record<string, number>;
  }
  
  class LazyQuery {
    toSql(): string;
    toString(): string;
    where(conditions: Record<string, SQLValue>): LazyQuery;
    orderBy(orderFields: string[] | string): LazyQuery;
    limit(offset: number, count: number): LazyQuery;
    getStats(): LazyQueryStats;
  }
  
  class LazyBatch {
    select(bindParam: SelectQueryParams, options?: QueryOptions): LazyBatch;
    insert(bindParam: InsertQueryParams, options?: QueryOptions): LazyBatch;
    update(bindParam: UpdateQueryParams, options?: QueryOptions): LazyBatch;
    delete(bindParam: DeleteQueryParams, options?: QueryOptions): LazyBatch;
    execute(): LazyQuery[];
    compile(): string[];
  }
  
  class LazyQueryBuilder {
    select(bindParam: SelectQueryParams, options?: QueryOptions): LazyQuery;
    insert(bindParam: InsertQueryParams, options?: QueryOptions): LazyQuery;
    update(bindParam: UpdateQueryParams, options?: QueryOptions): LazyQuery;
    delete(bindParam: DeleteQueryParams, options?: QueryOptions): LazyQuery;
    batch(): LazyBatch;
    getStats(): LazyBuilderStats;
    clear(): void;
    destroy(): void;
  }
  
  // Main JSQuery class
  class JSQuery {
    constructor(options?: JSQueryOptions);
    
    // Query methods
    selectQuery(bindParam: SelectQueryParams, options?: QueryOptions): string;
    insertQuery(bindParam: InsertQueryParams, options?: QueryOptions): string;
    updateQuery(bindParam: UpdateQueryParams, options?: QueryOptions): string;
    deleteQuery(bindParam: DeleteQueryParams, options?: QueryOptions): string;
    
    // Performance methods
    getPerformanceStats(): PerformanceStats;
    clearCache(): void;
    destroy(): void;
    
    // Lazy query methods
    lazy(): LazyQueryBuilder;
    
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