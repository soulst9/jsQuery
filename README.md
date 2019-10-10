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

