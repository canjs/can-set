@property {{}} can-set.comparators
@parent can-set

@description Contains a collection of comparator generating functions.

The following functions create `compares` objects that can be mixed together to create a set `Algebra`.

```js
var algebra = new set.Algebra(
  {
    // ignore this property in set algebra
    sessionId:  function(){ return true }
  },
  set.comparators.boolean("completed"),
  set.comparators.rangeInclusive("start","end")
);
```
