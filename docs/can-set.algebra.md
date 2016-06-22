@function can-set.Algebra
@parent can-set

@description Creates an object that can perform binary operations on sets with
an awareness of how certain properties represent the set.

@signature `new set.Algebra(compares...)`

Creates an object that can perform binary operations on sets with
an awareness of how certain properties represent the set.

```js
var set = require("can-set");
var algebra = new set.Algebra(
  set.comparators.boolean("completed"),
  set.comparators.id("_id")
);
```

  @param {can-set.compares} compares Each argument is a compares. These
  are returned by the functions on [can-set.comparators] or can be created
  manually. 

  @return {can-set.Algebra} Returns an instance of an algebra.
