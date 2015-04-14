# can-set

## equal

```
set..equal({type: "critical"}, {type: "critical"}) //-> true
```

## subset

```
set..subset({type: "critical"}, {}) //-> true
```

## union

```
set.union( 
  {start: 0, end: 99}, 
  {start: 100, end: 199},
  {...} ) //-> {start: 0, end: 199}
```

## intersection

```
set.intersection( 
  {completed: true, due: "tomorrow"}, 
  {completed: true, type: "critical"},
  {...} ) //-> {completed: true, due: "tomorrow", type: "critical"}
```


## difference

```
set.difference( {} , {completed: true}, {...} ) //-> {completed: false}
```
