# can-set

[![Build Status](https://travis-ci.org/canjs/can-set.svg?branch=master)](https://travis-ci.org/canjs/can-set)

__can-set__ is a utility for comparing [sets](http://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation) that
are represented by the parameters commonly passed to service requests.

For example, the set `{type: "critical"}` might represent all
critical todos.  It is a superset of the set `{type: "critical", due: "today"}`
which might represent all critical todos due today.

__can-set__ is useful for building caching and other data-layer
optimizations.  It can be used in client or server
environments. [can-connect](http://connect.canjs.com) uses can-set to create data modeling
utilities and middleware for the client.

[Play around in this JSBin!](https://justinbmeyer.jsbin.com/faveda/4/edit?js,console)

- [Install](#install)
- [Use](#use)
- <code>[new set.Algebra(compares...)](#new-setalgebracompares)</code>
  - <code>[Compares Object\<String,Prop()\>](#compares-objectstringprop)</code>
  - <code>[prop(aValue, bValue, a, b, prop, algebra)](#propavalue-bvalue-a-b-prop-algebra)</code>
  - <code>[algebra.difference(a, b)](#algebradifferencea-b)</code>
  - <code>[algebra.equal(a, b)](#algebraequala-b)</code>
  - <code>[algebra.getSubset(a, b, bData)](#algebragetsubseta-b-bdata)</code>
  - <code>[algebra.getUnion(a, b, aItems, bItems)](#algebragetuniona-b-aitems-bitems)</code>
  - <code>[algebra.index(set, items, item)](#algebraindexset-items-item)</code>
  - <code>[algebra.count(set)](#algebracountset)</code>
  - <code>[algebra.has(set, props)](#algebrahasset-props)</code>
  - <code>[algebra.properSubset(a, b)](#algebrapropersubseta-b)</code>
  - <code>[algebra.subset(a, b)](#algebrasubseta-b)</code>
  - <code>[algebra.union(a, b)](#algebrauniona-b)</code>
- <code>[props Object](#props-object)</code>
  - <code>[set.props.boolean(property)](#setpropsbooleanproperty)</code>
  - <code>[set.props.rangeInclusive(startIndexProperty, endIndexProperty)](#setpropsrangeinclusivestartindexproperty-endindexproperty)</code>
  - <code>[set.props.enum(property, propertyValues)](#setpropsenumproperty-propertyvalues)</code>
  - <code>[set.props.sort(prop, [sortFunc])](#setpropssortprop-sortfunc)</code>
  - <code>[set.props.id(prop)](#setpropsidprop)</code>
- <code>[new set.Translate(clauseType, propertyName)](#new-settranslateclausetype-propertyname)</code>
- [Contributing](#contributing)


## Install

Use npm to install `can-set`:

> npm install can-set --save

## Use

Use `require` in Node/Browserify workflows to import `can-set` like:

```js
var set = require('can-set');
```

Use `define`, `require` or `import` in [StealJS](http://stealjs.com)  workflows to import `can-set` like:

```js
import set from 'can-set'
```

Once you've imported `set` into your project, use it to create a `set.Algebra` and then
use that to compare and perform operations on sets.  

```js
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

Once you have the basics, you can use set algebra to all sorts of intelligent caching
and performance optimizations.  The following example
defines a `getTodos` function that gets todo data from a memory cache or from the server.

```js
var algebra = new set.Algebra(
    set.props.boolean("completed")
);
var cache = [];

// `params` might look like `{complete: true}`
var getTodos = function(set, cb) {

  // Check cache for a superset of what we are looking for.
  for(var i = 0 ; i < cache.length; i++) {
    var cacheEntry = cache[i];
    if(algebra.subset( set, cacheEntry.set ) ) {

      // If a match is found get those items.
      var matchingTodos = algebra.getSubset(set, cacheEntry.set, cacheEntry.items)
      return cb(matchingTodos);
    }
  }

  // not in cache, get and save in cache
  $.get("/todos",set, function(todos){
    cache.push({
      set: set,
      items: todos
    });
    cb(todos);
  });
}
```



## API


## <code>new set.Algebra(compares...)</code>


Creates an object that can perform binary operations on sets with
an awareness of how certain properties represent the set.

```js
var set = require("can-set");
var algebra = new set.Algebra(
  set.props.boolean("completed"),
  set.props.id("_id")
);
```


1. __compares__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  Each argument is a compares. These
  are returned by the functions on [props](#props-object) or can be created
  manually.



- __returns__ <code>{[Algebra](#new-setalgebracompares)([compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra))}</code>:
  Returns an instance of an algebra.

### Compares `{Object\<String,Prop()\>}`

An object of property names and `prop` functions.
```js
{
  // return `true` if the values should be considered the same:
  lastName: function(aValue, bValue){
    return (""+aValue).toLowerCase() === (""+bValue).toLowerCase();
  }
}
```





### <code>prop(aValue, bValue, a, b, prop, algebra)</code>


A prop function returns algebra values for two values for a given property.


1. __aValue__ <code>{*}</code>:
  The value of A's property in a set difference A and B (A  B).
1. __bValue__ <code>{*}</code>:
  The value of A's property in a set difference A and B (A  B).
1. __a__ <code>{*}</code>:
  The A set in a set difference A and B (A  B).
1. __b__ <code>{*}</code>:
  The B set in a set difference A and B (A  B).

- __returns__ <code>{Object|Boolean}</code>:
  A prop function should either return a Boolean which indicates if `aValue` and `bValue` are
  equal or an `AlgebraResult` object that details information about the union, intersection, and difference of `aValue` and `bValue`.

  An `AlgebraResult` object has the following values:

  - `union` - A value the represents the union of A and B.
  - `intersection` - A value that represents the intersection of A and B.
  - `difference` - A value that represents all items in A that are not in B.
  - `count` - The count of the items in A.

  For example, if you had a `colors` property and A is `["Red","Blue"]` and B is `["Green","Yellow","Blue"]`, the
  AlgebraResult object might look like:

  ```js
  {
    union: ["Red","Blue","Green","Yellow"],
    intersection: ["Blue"],
    difference: ["Red"],
    count: 2000
  }
  ```

  The count is `2000` because there might be 2000 items represented by colors "Red" and "Blue".  Often
  the real number can not be known.


### <code>algebra.difference(a, b)</code>


Returns a set that represents the difference of sets _A_ and _B_ (_A_ \ _B_), or
returns if a difference exists.

```js
algebra1 = new set.Algebra(set.props.boolean("completed"));
algebra2 = new set.Algebra();

// A has all of B
algebra1.difference( {} , {completed: true} ) //-> {completed: false}

// A has all of B, but we can't figure out how to create a set object
algebra2.difference( {} , {completed: true} ) //-> true

// A is totally inside B
algebra2.difference( {completed: true}, {} )  //-> false
```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.

- __returns__ <code>{[Set](#set-object)|Boolean}</code>:
  If an object is returned, it is difference of sets _A_ and _B_ (_A_ \ _B_).

  If `true` is returned, that means that _B_ is a subset of _A_, but no set object
  can be returned that represents that set.

  If `false` is returned, that means there is no difference or the sets are not comparable.


### <code>algebra.equal(a, b)</code>


  Returns true if the two sets the exact same.

  ```js
  algebra.equal({type: "critical"}, {type: "critical"}) //-> true
  ```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.

- __returns__ <code>{Boolean}</code>:
  True if the two sets are equal.


### <code>algebra.getSubset(a, b, bData)</code>


Gets `a` set's items given a super set `b` and its items.

```js
algebra.getSubset(
  {type: "dog"},
  {},
  [{id: 1, type:"cat"},
   {id: 2, type: "dog"},
   {id: 3, type: "dog"},
   {id: 4, type: "zebra"}]
) //-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
```


1. __a__ <code>{[Set](#set-object)}</code>:
  The set whose data will be returned.
1. __b__ <code>{[Set](#set-object)}</code>:
  A superset of set `a`.
1. __bData__ <code>{Array\<Object\>}</code>:
  The data in set `b`.

- __returns__ <code>{Array\<Object\>}</code>:
  The data in set `a`.


### <code>algebra.getUnion(a, b, aItems, bItems)</code>


Unifies items from set A and setB into a single array of items.

```js
algebra = new set.Algebra(
  set.props.rangeInclusive("start","end")
);
algebra.getUnion(
  {start: 1,end: 2},
  {start: 2,end: 4},
  [{id: 1},{id: 2}],
  [{id: 2},{id: 3},{id: 4}]);
  //-> [{id: 1},{id: 2},{id: 3},{id: 4}]
```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.
1. __aItems__ <code>{Array\<Object\>}</code>:
  Set `a`'s items.
1. __bItems__ <code>{Array\<Object\>}</code>:
  Set `b`'s items.

- __returns__ <code>{Array\<Object\>}</code>:
  Returns items in both set `a` and set `b`.


### <code>algebra.index(set, items, item)</code>


Returns where `item` should be inserted into `items` which is represented by `set`.

```js
algebra = new set.Algebra(
  set.props.sort("orderBy")
);
algebra.index(
  {orderBy: "age"},
  [{id: 1, age: 3},{id: 2, age: 5},{id: 3, age: 8},{id: 4, age: 10}],
  {id: 6, age: 3}
)  //-> 2
```

The default sort property is what is specified by
[id](#setpropsidprop). This means if that if the sort property
is not specified, it will assume the set is sorted by the specified
id property.


1. __set__ <code>{[Set](#set-object)}</code>:
  The `set` that describes `items`.
1. __items__ <code>{Array\<Object\>}</code>:
  An array of data objects.
1. __item__ <code>{Object}</code>:
  The data object to be inserted.

- __returns__ <code>{Number}</code>:
  The position to insert `item`.


### <code>algebra.count(set)</code>


Returns the number of items that might be loaded by the `set`. This makes use of set.Algebra's
By default, this returns Infinity.

```js
var algebra =  new set.Algebra({
  set.props.rangeInclusive("start", "end")
});
algebra.count({start: 10, end: 19}) //-> 10
algebra.count({}) //-> Infinity
```


1. __set__ <code>{[Set](#set-object)}</code>:
  [description]

- __returns__ <code>{Number}</code>:
  The number of items in the set if known, `Infinity`
  if unknown.


### <code>algebra.has(set, props)</code>


Used to tell if the `set` contains the instance object `props`.

```
var algebra = new set.Algebra(
  new set.Translate("where","$where")
);
algebra.has(
  {"$where": {playerId: 5}},
  {id: 5, type: "3pt", playerId: 5, gameId: 7}
) //-> true
```


1. __set__ <code>{[Set](#set-object)}</code>:
  A set.
1. __props__ <code>{Object}</code>:
  An instance's raw data.

- __returns__ <code>{Boolean}</code>:
  Returns `true` if `props` belongs in `set` and
  `false` it not.


### <code>algebra.properSubset(a, b)</code>


Returns true if _A_ is a strict subset of _B_ (_A_ ⊂ _B_).

```js
algebra.properSubset({type: "critical"}, {}) //-> true
algebra.properSubset({}, {}) //-> false
```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.

- __returns__ <code>{Boolean}</code>:
  `true` if `a` is a subset of `b` and not equal to `b`.


### <code>algebra.subset(a, b)</code>


Returns true if _A_ is a subset of _B_ or _A_ is equal to _B_ (_A_ ⊆ _B_).

```js
algebra.subset({type: "critical"}, {}) //-> true
algebra.subset({}, {}) //-> true
```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.

- __returns__ <code>{Boolean}</code>:
  `true` if `a` is a subset of `b`.


### <code>algebra.union(a, b)</code>


Returns a set that represents the union of _A_ and _B_ (_A_ ∪ _B_).

```js
algebra.union(
  {start: 0, end: 99},
  {start: 100, end: 199},
) //-> {start: 0, end: 199}
```


1. __a__ <code>{[Set](#set-object)}</code>:
  A set.
1. __b__ <code>{[Set](#set-object)}</code>:
  A set.

- __returns__ <code>{[Set](#set-object)|undefined}</code>:
  If an object is returned, it is the union of _A_ and _B_ (_A_ ∪ _B_).

  If `undefined` is returned, it means a union can't be created.

## props `{Object}`

Contains a collection of prop generating functions.
The following functions create `compares` objects that can be mixed together to create a set `Algebra`.

```js
var set = require("can-set");
var algebra = new set.Algebra(
  {
    // ignore this property in set algebra
    sessionId:  function(){ return true }
  },
  set.props.boolean("completed"),
  set.props.rangeInclusive("start","end")
);
```




### <code>set.props.boolean(property)</code>


Makes a compare object with a `property` function that has the following logic:

```js
A(true) ∪ B(false) = undefined

A(undefined) \ B(true) = false
A(undefined) \ B(false) = true
```

It understands that `true` and `false` are complementary sets that combined to `undefined`. Another way to think of this is that if you load `{complete: false}` and `{complete: true}` you've loaded `{}`.


1. __property__ <code>{String}</code>:
  The name of the boolean property.
1. __A__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  `Compares` object that can be an argument to [Algebra](#new-setalgebracompares)


### <code>set.props.rangeInclusive(startIndexProperty, endIndexProperty)</code>


Makes a prop for two ranged properties that specify a range of items
that includes both the startIndex and endIndex.  For example, a range of
[0,20] loads 21 items.

```
set.props.rangeInclusive("start","end")
```


1. __startIndexProperty__ <code>{String}</code>:
  The starting property name
1. __endIndexProperty__ <code>{String}</code>:
  The ending property name

- __returns__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  Returns a prop


### <code>set.props.enum(property, propertyValues)</code>


Makes a prop for a set of values.

```
var compare = set.props.enum("type", ["new","accepted","pending","resolved"])
```


### <code>set.props.sort(prop, [sortFunc])</code>


Defines the sortable property and behavior.

```js
var algebra = new set.Algebra(set.props.sort("sortBy"));
algebra.index(
  {sortBy: "name desc"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 1

algebra.index(
  {sortBy: "name"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 0
```


1. __prop__ <code>{String}</code>:
  The sortable property.
1. __sortFunc__ <code>{function(sortPropValue, item1, item2)}</code>:
  The
  sortable behavior. The default behavior assumes the sort property value
  looks like `PROPERTY DIRECTION` (ex: `name desc`).

- __returns__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  Returns a compares that can be used to create
  a `set.Algebra`.


### <code>set.props.id(prop)</code>


Defines the property name on items that uniquely
identifies them. This is the default sorted property if no
[sort](#setpropssortprop-sortfunc) is provided.

```js
var algebra = new set.Algebra(set.props.id("_id"));
algebra.index(
  {sortBy: "name desc"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 1

algebra.index(
  {sortBy: "name"},
  [{name: "Meyer"}],
  {name: "Adams"}) //-> 0
```


1. __prop__ <code>{String}</code>:
  The property name that defines the unique property id.

- __returns__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  Returns a compares that can be used to create
  a `set.Algebra`.


## <code>new set.Translate(clauseType, propertyName)</code>


Localizes a clause's properties within another nested property.

```js
var algebra = new set.Algebra(
  new set.Translate("where","$where")
);
algebra.has(
  {$where: {complete: true}},
  {id: 5, complete: true}
) //-> true
```

This is useful when filters (which are `where` clauses) are
within a nested object.


1. __clause__ <code>{String}</code>:
  A clause type.  One of `'where'`, `'order'`, `'paginate'`, `'id'`.
1. __propertyName__ <code>{String|Object}</code>:
  The property name which contains the clauses's properties.

- __returns__ <code>{[Compares](#compares-objectstringproppropavalue-bvalue-a-b-prop-algebra)}</code>:
  A set compares object that can do the translation.



## Contributing

To setup your dev environment:

1. Clone and fork this repo.  
2. Run `npm install`.
3. Open `test.html` in your browser.  Everything should pass.
4. Run `npm test`.  Everything should pass.
5. Run `npm run-script build`.  Everything should build ok.

To publish:

1.  Update the version number in package.json and commit and push this.
2.  Run `npm publish`.  This should generate the dist folder.
3.  Create and checkout a "release" branch.
4.  Run `git add -f dist`.
5.  Commit the addition and tag it `git tag v0.2.0`.  Push the tag `git push origin --tags`.
