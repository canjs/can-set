@property {{}} can-set.props
@parent can-set

@description Contains a collection of prop generating functions.

The following functions create `compares` objects that can be mixed together to create a set `Algebra`.

```js
var algebra = new set.Algebra(
  {
    // ignore this property in set algebra
    sessionId:  function(){ return true }
  },
  set.props.boolean("completed"),
  set.props.rangeInclusive("start","end")
);
```
