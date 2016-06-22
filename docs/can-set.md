@module {{}} can-set
@parent can-core

@description

can-set is a utility for comparing [sets](http://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation) that are represented by the parameters commonly passed to service requests.

Once you've imported `set` into your project, use it to create a `set.Algebra` and then use that to compare and perform operations on sets.  

```js
var set = require('can-set');
// create an algebra
var algebra = new set.Algebra(
    // specify the unique identifier on data
    set.comparators.id("_id"),  
    // specify that completed can be true, false or undefined
    set.comparators.boolean("completed"),
    // specify properties that define pagination
    set.comparators.rangeInclusive("start","end"),
    // specify the property that controls sorting
    set.comparators.sort("orderBy"),
)

// compare two sets
algebra.subset({start: 2, end: 3}, {start: 1, end: 4}) //-> true
algebra.difference({} , {completed: true}) //-> {completed: false}

// perform operations on sets
algebra.getSubset({start: 2,end: 3},{start: 1,end: 4},
            [{id: 1},{id: 2},{id: 3},{id: 4}])
//-> [{id: 2},{id: 3}]
```
