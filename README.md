# can-set

__can-set__ is a utility for comparing [sets](http://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation) that 
are represented by the parameters commonly passed to service requests.

For example, the set `{type: "critical"}` might represent all 
critical todos.  It is a superset of the set `{type: "critical", due: "today"}` 
which might represent all critical todos due today.

__can-set__ is useful for building caching and other data-layer
optimizations.  [can-connect] uses can-set to create data modeling
utilities and middleware for the client. 


## Set

In __can-set__ a set is a plain JavaScript object 
like `{start: 0, end: 100, filter: "top"}`.  Often, these are the 
parameters you pass to the server to retrieve some list of data.

Unlike [set mathmatics](http://en.wikipedia.org/wiki/Set_(mathematics)), these
set objects don't contain the items of the set, instead they represent the items within the set.

### Special Sets

Unlike in common [set mathmatics](http://en.wikipedia.org/wiki/Set_(mathematics)) the set `{}` represents the 
superset of all sets.  For instance if you load all items represented by set `{}`, you have loaded 
every item in that "universe".

## equal.equal(a, b, algebra) -> Boolean

Returns true if the two sets the exact same.

```js
set.equal({type: "critical"}, {type: "critical"}) //-> true
```

## set.subset(a, b, algebra) -> Boolean

Returns true if _A_ is a subset of _B_ or _A_ is equal to _B_.

```js
set.subset({type: "critical"}, {}) //-> true
set.subset({}, {}) //-> true
```

## set.properSubset(a, b, algebra)

Returns true if _A_ is a subset of _B_ and _A_ is no equal to _B_.

```js
set.properSubset({type: "critical"}, {}) //-> true
set.properSubset({}, {}) //-> false
```

## set.intersection(a, b, algebra) -> set

Returns a set that represents the intersection of sets _A_ and _B_ (_A_ ∩ _B_).

```js
set.intersection( 
  {completed: true, due: "tomorrow"}, 
  {completed: true, type: "critical"},
  {...} ) //-> {completed: true, due: "tomorrow", type: "critical"}
```


## set.difference(a, b, algebra) -> set|null|undefined

Returns a set that represents the difference of sets _A_ and _B_ (_A_ \ _B_).

If `null` is returned, that means that _A_ is a subset of _B_, but no set object
can be returned that represents that set.

If `undefined` is returned, that means there is no difference or the sets are not comparable.

```js
// A has all of B
set.difference( {} , {completed: true}, set.boolean("completed") ) //-> {completed: false}

// A has all of B, but we can't figure out how to create a set object
set.difference( {} , {completed: true} ) //-> null

// A is totally inside B
set.difference( {completed: true}, {} )  //-> undefined
```

## set.count(a, algebra) -> Number

Returns the number of items that might be loaded by set _A_. This makes use of set.Algebra's
`count` method.  By default, this returns Infinity.

## set.union(a, b, algebra) -> set | undefined

Returns a set that represents the union of _A_ and _B_ (_A_ ∪ _B_).

```js
set.union( 
  {start: 0, end: 99}, 
  {start: 100, end: 199},
  {...} ) //-> {start: 0, end: 199}
```


## new set.Algebra(compare, [count])

Creates an object that can perform binary operations on sets with an awareness of
how certain properties represent the set.

### compare `Object<String: comparitor>`

An object of property names and `comparitor` functions.

```js
{
  // return the difference or undefined if a difference can not be taken
  completed: function(A, B){
    if(A === undefined) {
      return !B;
    }
    return undefined;
  }
}
```

### comparitor(aValue, bValue, a, b, algebra)

A comparitor function returns information 

- `aValue` - the value of A's property in a set difference A and B (A \ B).
- `bValue` - the value of A's property in a set difference A and B (A \ B).
- `a` - the A set in a set difference A and B (A \ B).
- `a` - the B set in a set difference A and B (A \ B).
- returns 
	- intersection - A set that represents the intersection of A and B.
	
	- [difference] - A set that represents all items in A that are not in B. For example:
	
	  ```
	  A{start: 0, end: 10} \ B{start: 5, end: 10} = {start: 0, end: 4}
	  ```
	  
	  If a set exists, but can not be represented, `null` should be provided.
	  For example:
	  
	  ```
	  A{} \ B{type: "tacos"} = null
	  ```
	  
	  By providing `null`, we know that B is a subset of A.
	  
	- [merge] - Additional metadata that can be used if merging the difference and
	  B set. For example,
	
	  ```
	  A = {start: 0, end: 10} 
	  B = {start: 5, end: 10}
	  difference = {start: 0, end: 4}
	  merge = "before"
	  ```
	  
	  Setting merge to before might mean that the items loaded by the `difference`
	  set can be inserted before the `B` set.
	  



