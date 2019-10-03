# jsQuery

Begin to build a library that helps you easily change an already defined object type to an sql statement

# Create Instance
const jsQuery = new JSQuery();

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
    ]
  }
);
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
      options: { as: "a"}
    }
  }
);
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