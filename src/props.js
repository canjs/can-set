var h = require("./helpers");
var clause = require("./clause");
var each = require("can-util/js/each/each");

var within = function(value, range){
	return value >= range[0] && value <= range[1];
};
var numericProperties = function(setA, setB, property1, property2){
	return {
		sAv1: +setA[property1],
		sAv2: +setA[property2],
		sBv1: +setB[property1],
		sBv2: +setB[property2],
	};
};

// diff from setA's perspective
var diff = function(setA, setB, property1, property2){
	// p for param
	// v for value
	var numProps = numericProperties(setA, setB, property1, property2);
	var sAv1 = numProps.sAv1,
		sAv2 = numProps.sAv2,
		sBv1 = numProps.sBv1,
		sBv2 = numProps.sBv2,
		count = sAv2 - sAv1 + 1;

	var after = {
		difference: [sBv2+1, sAv2],
		intersection: [sAv1,sBv2],
		union: [sBv1, sAv2],
		count: count,
		meta: "after"
	};
	var before = {
		difference: [sAv1, sBv1-1],
		intersection: [sBv1,sAv2],
		union: [sAv1, sBv2],
		count: count,
		meta: "before"
	};

	// if the sets are equal
	if(sAv1 === sBv1 && sAv2 === sBv2) {
		return {
			intersection: [sAv1,sAv2],
			union: [sAv1,sAv2],
			count: count,
			meta: "equal"
		};
	}
	// A starts at B but A ends later
	else if( sAv1 === sBv1 && sBv2 < sAv2 ) {
		return after;
	}
	// A end at B but A starts earlier
	else if( sAv2 === sBv2 && sBv1 > sAv1 ) {
		return before;
	}
	// B contains A
	else if( within(sAv1, [sBv1, sBv2]) && within(sAv2, [sBv1, sBv2]) ) {
		return {
			intersection: [sAv1,sAv2],
			union: [sBv1, sBv2],
			count: count,
			meta: "subset"
		};
	}
	// A contains B
	else if( within(sBv1, [sAv1, sAv2]) && within(sBv2, [sAv1, sAv2]) ) {
		return {
			intersection: [sBv1,sBv2],
			// there is a difference in what A has
			difference: [null, null],
			union: [sAv1, sAv2],
			count: count,
			meta: "superset"
		};
	}
	// setA starts earlier and overlaps setB
	else if(sAv1 < sBv1 && within(sAv2, [sBv1, sBv2]) ) {
		return before;
	}
	// setB starts earlier and overlaps setA
	else if(sBv1 < sAv1 && within(sBv2, [sAv1, sAv2]) ) {
		return after;
	}
	// side by side ... nothing intersection
	else if(sAv2 === sBv1-1) {
		return {
			difference: [sAv1,sAv2],
			union: [sAv1, sBv2],
			count: count,
			meta: "disjoint-before"
		};
	}

	else if(sBv2 === sAv1 - 1) {
		return {
			difference: [sAv1,sAv2],
			union: [sBv1, sAv2],
			count: count,
			meta: "disjoint-after"
		};
	}
	if(!isNaN(count)) {
		return {
			count: count,
			meta: "disjoint"
		};
	}

};

var cleanUp = function(value, enumData) {
	if(!value) {
		return enumData;
	}
	if(!Array.isArray(value)) {
		value = [value];
	}
	if(!value.length) {
		return enumData;
	}
	return value;
};
var stringConvert = {"0": false, "false": false, "null": undefined, "undefined": undefined};
var convertToBoolean = function(value){
	if(typeof value === "string") {
		return value.toLowerCase() in stringConvert ? stringConvert[value.toLowerCase()] : true;
	}

	return value;
};

var props = {
	/**
	 * @function can-set.props.enum enum
	 * @parent can-set.props
	 *
	 * @signature `set.props.enum(property, propertyValues)`
	 *
	 * Makes a prop for a set of values.
	 *
	 * ```
	 * var compare = set.props.enum("type", ["new","accepted","pending","resolved"])
	 * ```
	 */
	'enum': function(prop, enumData){
		var compares = new clause.Where({});
		compares[prop] = function(vA, vB, A, B){
			vA = cleanUp(vA, enumData);
			vB = cleanUp(vB, enumData);

			var data = h.arrayUnionIntersectionDifference(vA, vB);
			// if the difference is empty ... there is no difference
			if( !data.difference.length ) {
				delete data.difference;
			}

			// if any of them have everything, return undefined
			each(data, function(value, prop){
				if(Array.isArray(value)) {
					if(h.arraySame(enumData, value)) {
						data[prop] = undefined;
					} else if(value.length === 1) {
						data[prop] = value[0];
					}
				}
			});

			return data;
		};
		return compares;
	},
	paginate: function(propStart, propEnd, translateToStartEnd, reverseTranslate) {

		var compares = {};
		var makeResult = function(result, index) {
			var res = {};
			each(["intersection","difference","union"], function(prop){
				if(result[prop]) {
					var set = {start: result[prop][0], end: result[prop][1]};
					res[prop] = reverseTranslate(set)[index === 0 ? propStart: propEnd];
				}
			});
			if(result.count) {
				res.count = result.count;
			}
			return res;
		};

		// returns the `start` properties values for different algebra methods and a
		// getSubset+getUnion that really dont do anything.
		compares[propStart] = function(vA, vB, A, B){
			if(vA === undefined) {
				return;
			}

			var res = diff(translateToStartEnd(A), translateToStartEnd(B), "start", "end");

			var result = makeResult(res, 0);

			result.getSubset = function(a, b, bItems, algebra, options){
				return bItems;
			};
			result.getUnion = function(a, b, aItems, bItems, algebra, options){
				return [aItems,bItems];
			};
			return result;
		};
		// returns the `end` property values for different algebra methods and
		// a getSubset+getUnion that actually perform a mution on the items.
		compares[propEnd] = function(vA, vB, A, B){
			if(vA === undefined) {
				return;
			}
			var data= diff(translateToStartEnd(A), translateToStartEnd(B), "start", "end");
			var res = makeResult( data, 1);
			// if getSubset ... remove from the .get
			res.getSubset = function(a, b, bItems, algebra, options){
				var tA = translateToStartEnd(a);
				var tB = translateToStartEnd(b);
				var numProps = numericProperties(tA, tB, "start", "end");
				var aStartValue = numProps.sAv1,
					aEndValue = numProps.sAv2;

				var bStartValue = numProps.sBv1;

				if(  ! ("end" in tB) || ! ("end" in tA)  ) {
					return bItems.slice(aStartValue, aEndValue+1);
				}
				return bItems.slice( aStartValue - bStartValue, aEndValue - bStartValue + 1 );
			};
			res.getUnion = function(a, b, aItems, bItems, algebra, options){
				var tA = translateToStartEnd(a);
				var tB = translateToStartEnd(b);
				// if a is after b
				if(data.meta.indexOf("after") >= 0) {
					// if they overlap ... shave some off
					if(data.intersection) {
						bItems = bItems.slice( 0, data.intersection[0]- (+tB.start)  );
					}
					return [bItems, aItems];
				}

				if(data.intersection) {
					aItems = aItems.slice( 0, data.intersection[0]- (+tA.start)  );
				}
				return [aItems,bItems];
			};

			return res;
		};
		return new clause.Paginate(compares);
	},
	/**
	 * @function can-set.props.boolean boolean
	 * @parent can-set.props
	 *
	 * @description Supports boolean properties.
	 *
	 * @signature `set.props.boolean(property)`
	 *
	 * Makes a compare object with a `property` function that has the following logic:
	 *
	 * ```js
	 * A(true) ∪ B(false) = undefined
	 *
	 * A(undefined) \ B(true) = false
	 * A(undefined) \ B(false) = true
	 * ```
	 *
	 * It understands that `true` and `false` are complementary sets that combined to `undefined`. Another way to think of this is that if you load `{complete: false}` and `{complete: true}` you've loaded `{}`.
	 *
	 * @param {String} property The name of the boolean property.
	 * @param {can-set.compares} A `Compares` object that can be an argument to [can-set.Algebra]
	 */
	"boolean": function(propertyName) {
		var compares = new clause.Where({});
		compares[propertyName] = function(propA, propB) {
			// prop a is probably true
			propA = convertToBoolean(propA);
			propB = convertToBoolean(propB);
			var notA = !propA,
				notB = !propB;
			if( propA === notB && propB === notA ) {
				return {
					difference: !propB,
					union: undefined
				};
			} else if(propA === undefined) {
				return {
					difference: !propB,
					intersection: propB,
					union: undefined
				};
			} else  if(propA === propB) {
				return true;
			}
		};
		return compares;
	},
	/**
	 * @function can-set.props.sort sort
	 * @parent can-set.props
	 *
	 * @description Defines the sortable property and behavior.
	 *
	 * @signature `set.props.sort(prop, [sortFunc])`
	 *
	 * Defines the sortable property and behavior.
	 *
	 * ```js
	 * var algebra = new set.Algebra(set.props.sort("sortBy"));
	 * algebra.index(
	 *   {sortBy: "name desc"},
	 *   [{name: "Meyer"}],
	 *   {name: "Adams"}) //-> 1
	 *
	 * algebra.index(
	 *   {sortBy: "name"},
	 *   [{name: "Meyer"}],
	 *   {name: "Adams"}) //-> 0
	 * ```
	 *
	 *   @param  {String} prop The sortable property.
	 *   @param  {function(sortPropValue, item1, item2)} [sortFunc] The
	 *   sortable behavior. The default behavior assumes the sort property value
	 *   looks like `PROPERTY DIRECTION` (ex: `name desc`).
	 *   @return {can-set.compares} Returns a compares that can be used to create
	 *   a `set.Algebra`.
	 */
	"sort": function(prop, sortFunc) {
		if(!sortFunc) {
			sortFunc = h.defaultSort;
		}
		var compares = {};
		compares[prop] = sortFunc;
		return new clause.Order(compares);
	},
	/**
	 * @function can-set.props.id id
	 * @parent can-set.props
	 *
	 * @description Defines the identify property.
	 *
	 * @signature `set.props.id(prop)`
	 *
	 * Defines the property name on items that uniquely
	 * identifies them. This is the default sorted property if no
	 * [can-set.props.sort] is provided.
	 *
	 * ```js
	 * var algebra = new set.Algebra(set.props.id("_id"));
	 * algebra.index(
	 *   {sortBy: "name desc"},
	 *   [{name: "Meyer"}],
	 *   {name: "Adams"}) //-> 1
	 *
	 * algebra.index(
	 *   {sortBy: "name"},
	 *   [{name: "Meyer"}],
	 *   {name: "Adams"}) //-> 0
	 * ```
	 *
	 *   @param  {String} prop The property name that defines the unique property id.
	 *   @return {can-set.compares} Returns a compares that can be used to create
	 *   a `set.Algebra`.
	 */
	"id": function(prop){
		var compares = {};
		compares[prop] = prop;
		return new clause.Id(compares);
	}
};

var assignExcept = function(d, s, props){
	for(var prop in s) {
		if(!props[prop]) {
			d[prop] = s[prop];
		}
	}
	return d;
};
var translateToOffsetLimit = function(set, offsetProp, limitProp) {
	var newSet = assignExcept({}, set, {start: 1, end: 1});
	if("start" in set) {
		newSet[offsetProp] = set.start;
	}
	if("end" in set) {
		newSet[limitProp] = (set.end - set.start) + 1;
	}
	return newSet;
};
var translateToStartEnd = function(set, offsetProp, limitProp) {
	var except = {};
	except[offsetProp] = except[limitProp] = 1;
	var newSet = assignExcept({}, set,except);
	if(offsetProp in set) {
		newSet.start = parseInt(set[offsetProp],10);
	}
	if(limitProp in set) {
		newSet.end = newSet.start + parseInt(set[limitProp]) - 1;
	}
	return newSet;
};
/**
 * @function can-set.props.offsetLimit offsetLimit
 * @parent can-set.props
 *
 * @description Supports sets that include a limit and offset.
 *
 * @signature `set.props.offsetLimit( [offsetProperty][, limitProperty] )`
 *
 * Makes a prop for two ranged properties that specify a range of items
 * that includes both the offsetProperty and limitProperty.  For example, set like:
 * `{offset: 20, limit: 10}` loads 10 items starting at index 20.
 *
 * ```
 * new set.Algebra( set.props.offsetLimit("offset","limit") );
 * ```
 *
 *   @param  {String} offsetProperty The offset property name on sets.  Defaults to `"offset"` if none is provided.
 *   @param  {String} limitProperty The offset limit name on sets. Defaults to `"limit"` if none is provided.
 *   @return {can-set.compares} Returns a comparator used to build a set algebra.
 */
props.offsetLimit = function(offsetProp, limitProp){
	offsetProp = offsetProp || "offset";
	limitProp = limitProp || "limit";
	return props.paginate(
		offsetProp, limitProp,
		function(set){
			return translateToStartEnd(set, offsetProp, limitProp);
		}, function(set){
			return translateToOffsetLimit(set, offsetProp, limitProp);
		});
};

/**
 * @function can-set.props.rangeInclusive rangeInclusive
 * @parent can-set.props
 *
 * @description Supports ranged properties.
 *
 * @signature `set.props.rangeInclusive(startIndexProperty, endIndexProperty)`
 *
 * Makes a prop for two ranged properties that specify a range of items
 * that includes both the startIndex and endIndex.  For example, a range of
 * [0,20] loads 21 items.
 *
 * ```
 * set.props.rangeInclusive("start","end")
 * ```
 *
 *   @param  {String} startIndexProperty The starting property name
 *   @param  {String} endIndexProperty The ending property name
 *   @return {can-set.compares} Returns a prop
 */
props.rangeInclusive = function(startIndexProperty, endIndexProperty){
	startIndexProperty = startIndexProperty || "start";
	endIndexProperty = endIndexProperty || "end";
	return props.paginate(
		startIndexProperty,
		endIndexProperty,
		function(set){
			var except = {};
			except[startIndexProperty] = except[endIndexProperty] = 1;
			var newSet = assignExcept({}, set,except);
			if(startIndexProperty in set) {
				newSet.start = set[startIndexProperty];
			}
			if(endIndexProperty in set) {
				newSet.end = set[endIndexProperty];
			}
			return newSet;
		}, function(set){
			var except = {start: 1, end: 1};
			var newSet = assignExcept({}, set,except);
			newSet[startIndexProperty] = set.start;
			newSet[endIndexProperty] = set.end;
			return newSet;
		});
};

var nestedLookup = function(obj, propNameArray) {
	if (obj === undefined) {
		return undefined;
	}

	if (propNameArray.length === 1) {
		return obj[propNameArray[0]];
	} else {
		return nestedLookup(obj[propNameArray[0]], propNameArray.slice(1));
	}
};
/**
 * @function can-set.props.dotNotation dotNotation
 * @parent can-set.props
 *
 * @description Supports MongoDB-style 'dot notation' properties.
 *
 * @signature `set.props.dotNotation(dotProperty)`
 *
 * Defines a property that specifies a MongoDB-style nested property match.
 * For example, a set property of "address.city" matches against the value of the nested `{address: {city}}` value.
 *
 * ```
 * set.props.dotNotation("address.city")
 * ```
 *
 *   @param  {String} dotProperty The MongoDB-style nested property name
 *   @return {can-set.compares} Returns a comparator used to build a set algebra
 */
props.dotNotation = function(dotProperty){
	var compares = new clause.Where({});

	compares[dotProperty] = function(aVal, bVal, a, b, propertyName) {
		// if the value wasn't picked out from the parent try a dotNotation lookup
		if (aVal === undefined) {
			aVal = nestedLookup(a, propertyName.split('.'));
		}
		if (bVal === undefined) {
			bVal = nestedLookup(b, propertyName.split('.'));
		}

		return aVal === bVal;
	};

	return compares;
};

module.exports = props;
