@module {{}} can-set
@parent can-core
@group can-set.types types
@group can-set.properties properties

@description

can-set is a utility for comparing [can-set/Set sets] that are represented by the parameters commonly passed to service requests.

@type {Object}

Once you've imported the `can-set` module into your project, use it to create a `set.Algebra` and then use that to compare and perform operations on sets.  

```js
var set = require('can-set');
// create an algebra
var algebra = new set.Algebra(
    // specify the unique identifier on data
    set.props.id("_id"),  
    // specify that completed can be true, false or undefined
    set.props.boolean("completed"),
    // specify properties that define pagination
    set.props.rangeInclusive("start","end"),
    // specify the property that controls sorting
    set.props.sort("orderBy"),
)

// compare two sets
algebra.subset({start: 2, end: 3}, {start: 1, end: 4}) //-> true
algebra.difference({} , {completed: true}) //-> {completed: false}

// perform operations on sets
algebra.getSubset({start: 2,end: 3},{start: 1,end: 4},
            [{id: 1},{id: 2},{id: 3},{id: 4}])
//-> [{id: 2},{id: 3}]
```

@body

## Use

A [can-set/Set] is a plain JavaScript object used to represent a
[https://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation set] of data usually returned by the server.  For example,
a list of all completed todos might be represented by:

```
{complete: true}
```

This set might be passed to [can-connect/can/map/map.getList] like:

```
Todo.getList({complete: true})
```

A [can-set.Algebra] is used to detail the behavior of these sets,
often using already provided [can-set.props] comparators:

```
var todoAlgebra = new set.Algebra(
  set.props.boolean("complete"),
  set.props.id("_id")
);
```

Using an algebra, all sorts of special behaviors can be performed. For
example, if we already loaded the incomplete todos (`{complete: false}`) and
wanted to load all todos (`{}`), we could use a set [can-set.Algebra.prototype.difference] to figure out how to load
only the data that hasn't been loaded.

```js
todoAlgebra.difference({}, {complete: false}) //-> {complete: true}
```

These algebra's are typically used internally by either [can-connect] or
[can-fixture] to provide these special behaviors:

```js
var cacheConnection = connect([
  require("can-connect/data/memory-cache/memory-cache")
],{
  algebra: todoAlgebra
});

var todoConnection = connect([
  require("can-connect/data/url/url"),
  require("can-connect/cache-requests/cache-requests")
],{
  cacheConnection: cacheConnection,
  url: "/todos",
  algebra: todoAlgebra
});
```

```js
var todoStore = fixture.store([
    { _id : 1, name : 'Do the dishes', complete: true },
    { _id : 2, name : 'Walk the dog', complete: false }
  ],
  todoAlgebra );

fixture("/todos/{_id}", todoStore);
```

The best way to think about `can-set` is that its a way to detail
the behavior of your service layer so other utilities can benefit.
