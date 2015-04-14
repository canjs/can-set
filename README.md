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

## compare

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
