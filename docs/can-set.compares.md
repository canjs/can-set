@typedef {Object<String,can-set.comparator>} can-set.compares Compares
@parent can-set.types

@description An object of property names and `comparator` functions.

```js
{
  // return `true` if the values should be considered the same:
  lastName: function(aValue, bValue){
    return (""+aValue).toLowerCase() === (""+bValue).toLowerCase();
  }
}
```


@option {Object<String,can-set.comparator>}
