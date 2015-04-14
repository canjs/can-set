# can-set

## equal

```js
set.equal({type: "critical"}, {type: "critical"}) //-> true
```

## subset

```js
set.subset({type: "critical"}, {}) //-> true
set.subset({}, {}) //-> true
```

## properSubset

```js
set.properSubset({type: "critical"}, {}) //-> true
set.properSubset({}, {}) //-> false
```


## union

```js
set.union( 
  {start: 0, end: 99}, 
  {start: 100, end: 199},
  {...} ) //-> {start: 0, end: 199}
```

## intersection

```js
set.intersection( 
  {completed: true, due: "tomorrow"}, 
  {completed: true, type: "critical"},
  {...} ) //-> {completed: true, due: "tomorrow", type: "critical"}
```


## difference

```js
set.difference( {} , {completed: true}, {...} ) //-> {completed: false}
set.difference( {completed: true}, {}, {...} )  //-> null


set.difference( {start: 0, end: 99}, {start: 50, end: 99} })

set.difference( {start: 0, end: 99}, {start: 50, end: 98} })
```

## compare `Object<String: comparitor>`




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

### comparitor(aValue, bValue, a, b, compare)

A comparitor function returns information 

- `aValue` - the value of A's property in a set difference A and B (A \ B).


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
	  
	- [count] - the total number of items that are represented by the difference set. This 
	  can be useful indicator to find the smallest diff that should be loaded. If count
	  is not provided, it is assumed to be Infinity.
	  



