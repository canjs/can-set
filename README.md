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


> - Install
> - Use
> - API
>   - [Algebra](#setalgebra)
>   - [comparators](#setcomparators)
>     - [boolean](#setcomparatorsboolean)
>     - [enum](#setcomparatorsenum)
>     - [rangeInclusive](#setcomparatorsrangeinclusive)
>   - [equal](#algebraequal)
>   - [subset](#algebrasubset)
>   - [properSubset](#algebrapropersubset)
>   - [intersection](#algebraintersection)
>   - [difference](#algebradifference)
>   - [union](#algebraunion)
>   - [count](#algebracount)
>   - [getUnion](#algebragetunion)
>   - [getSubset](#algebragetsubset)

> - [Contributing](#contributing)

## Install

Use npm to install `can-set`:

> npm install can-set --save

## Use

Use `require` in Node/Browserify workflows to import `can-set` like:

```
var set = require('can-set');
```

Use `define`, `require` or `import` in [StealJS](http://stealjs.com)  workflows to import `can-set` like:

```
import set from 'can-set'
```

Once you've imported `set` into your project, use it to create a `set.Algebra` and then
use that to compare and perform operations on sets.  

```js
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

Once you have the basics, you can use set algebra to all sorts of intelligent caching
and performance optimizations.  The following example
defines a `getTodos` function that gets todo data from a memory cache or from the server.

```
var algebra = new set.Algebra(
    set.comparators.boolean("completed")
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

In __can-set__ a set is a plain JavaScript object
like `{start: 0, end: 100, filter: "top"}`.  Often, these are the
parameters you pass to the server to retrieve some list of data.

Unlike [set mathmatics](http://en.wikipedia.org/wiki/Set_(mathematics)), these
set objects don't contain the items of the set, instead they represent the items within the set.

### Special Sets

Unlike in common [set mathmatics](http://en.wikipedia.org/wiki/Set_(mathematics)) the set `{}` represents the
superset of all sets.  For instance if you load all items represented by set `{}`, you have loaded
every item in that "universe".

## set.Algebra

`new set.Algebra(compares...)`

Creates an object that can perform binary operations on sets with an awareness of
how certain properties represent the set.

### compares `Object<String: comparator>`

An object of property names and `comparator` functions.

```js
{
  // return `true` if the values should be considered the same:
  lastName: function(aValue, bValue){
    return (""+aValue).toLowerCase() === (""+bValue).toLowerCase();
  }
}
```

### comparator(aValue, bValue, a, b, prop, algebra)

A comparator function returns algebra values for two values for a given property.


#### params

- `aValue` - the value of A's property in a set difference A and B (A \ B).
- `bValue` - the value of A's property in a set difference A and B (A \ B).
- `a` - the A set in a set difference A and B (A \ B).
- `a` - the B set in a set difference A and B (A \ B).

#### returns

A comparator function should either return a Boolean which indicates if `aValue` and `bValue` are
equal or an `AlgebraResult` object that details information about the union, intersection, and
difference of `aValue` and `bValue`.

An `AlgebraResult` object has the following values:

- [union] - A value the represents the union of A and B.
- [intersection] - A value that represents the intersection of A and B.
- [difference] - A value that represents all items in A that are not in B.
- [count] - The count of the items in A.

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

## set.comparators

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

### set.comparators.boolean

`set.comparators.boolean(property) -> compare`

Makes a compare object with a `property` function that has the following logic:

```
A(true) ∪ B(false) = undefined

A(undefined) \ B(true) = false
A(undefined) \ B(false) = true
```

It understands that `true` and `false` are complementary sets that
combined to `undefined`.  Another way to think of this is that if you
load `{complete: false}` and `{complete: true}` you've loaded `{}`.

### set.comparators.rangeInclusive

`set.comparators.rangeInclusive(startIndexProperty, endIndexProperty) -> compare`

Makes a comparator for two ranged properties that specify a range of items
that includes both the startIndex and endIndex.  For example, a range of
[0,20] loads 21 items.

### set.comparators.enum

`set.comparators.enum(property, propertyValues) -> compare`

Makes a comparator for a set of values.

```
var compare = set.comparators.enum("type", ["new","accepted","pending","resolved"])
```

## algebra.equal

`algebra.equal(a, b) -> Boolean`

Returns true if the two sets the exact same.

```js
algebra.equal({type: "critical"}, {type: "critical"}) //-> true
```

## algebra.subset

Returns true if _A_ is a subset of _B_ or _A_ is equal to _B_ (_A_ ⊆ _B_).

`algebra.subset(a, b) -> Boolean`

```js
algebra.subset({type: "critical"}, {}) //-> true
algebra.subset({}, {}) //-> true
```

## algebra.properSubset

Returns true if _A_ is a strict subset of _B_ (_A_ ⊂ _B_).

`algebra.properSubset(a, b)`


```js
algebra.properSubset({type: "critical"}, {}) //-> true
algebra.properSubset({}, {}) //-> false
```

## algebra.intersection

`algebra.intersection(a, b, algebra) -> set`

Returns a set that represents the intersection of sets _A_ and _B_ (_A_ ∩ _B_).

```js
algebra.intersection(
  {completed: true, due: "tomorrow"},
  {completed: true, type: "critical"},
) //-> {completed: true, due: "tomorrow", type: "critical"}
```


## algebra.difference

`algebra.difference(a, b) -> set|true|false`

Returns a set that represents the difference of sets _A_ and _B_ (_A_ \ _B_), or
returns if a difference exists.

If `true` is returned, that means that _B_ is a subset of _A_, but no set object
can be returned that represents that set.

If `false` is returned, that means there is no difference or the sets are not comparable.

```js
algebra1 = new set.Algebra(set.comparators.boolean("completed"));
algebra2 = new set.Algebra();

// A has all of B
algebra1.difference( {} , {completed: true} ) //-> {completed: false}

// A has all of B, but we can't figure out how to create a set object
algebra2.difference( {} , {completed: true} ) //-> true

// A is totally inside B
algebra2.difference( {completed: true}, {} )  //-> false
```

## algebra.union

`algebra.union(a, b) -> set | undefined`

Returns a set that represents the union of _A_ and _B_ (_A_ ∪ _B_).

```js
algebra.union(
  {start: 0, end: 99},
  {start: 100, end: 199},
) //-> {start: 0, end: 199}
```


## algebra.count

`algebra.count(a, algebra) -> Number`

Returns the number of items that might be loaded by set _A_. This makes use of set.Algebra's
By default, this returns Infinity.


## algebra.getSubset

`algebra.getSubset(a, b, bItems) //-> aItems`

Gets A set's items given a super set B and its items.

```
algebra.getSubset({type: "dog"},{},
  [{id: 1, type:"cat"},
   {id: 2, type: "dog"},
   {id: 3, type: "dog"},
   {id: 4, type: "zebra"}])
//-> [{id: 2, type: "dog"},{id: 3, type: "dog"}]
```

## algebra.getUnion

`algebra.getUnion(a, b, aItems, bItems) //-> unionItems`

Unifies items from set A and setB into a single array of items.

```
algebra = new set.Algebra(
    set.comparators.rangeInclusive("start","end")
);
algebra.getUnion(
    {start: 1,end: 2},
    {start: 2,end: 4},
    [{id: 1},{id: 2}],
    [{id: 2},{id: 3},{id: 4}]);
//-> [{id: 1},{id: 2},{id: 3},{id: 4}]
```

## algebra.index

`algebra.index(setA, aItems, item)`

Returns where `item` should be inserted into `aItems` which is represented by `setA`.

```
algebra = new set.Algebra(
    set.comparators.sort("orderBy")
);
algebra.index(
    {orderBy: "age"},
    [{id: 1, age: 3},{id: 2, age: 5},{id: 3, age: 8},{id: 4, age: 10}],
    {id: 6, age: 3})
    //-> 2
```

The default sort property is what is specified by
`set.comparators.id`. This means if that if the sort property
is not specified, it will assume the set is sorted by the specified
id property.


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
