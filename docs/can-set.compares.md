@typedef {Object<String,can-set.prop>} can-set.compares Compares
@parent can-set.types


@description An object of property names and `prop` functions.



@option {Object<String,can-set.prop>}

```js
{

	// return `true` if the values should be considered the same:
	lastName: function( aValue, bValue ) {
		return ( "" + aValue ).toLowerCase() === ( "" + bValue ).toLowerCase();
	}
}
```
