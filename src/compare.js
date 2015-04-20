var h = require("./helpers");

var compareHelpers;


var loop = function(a, b, aParent, bParent, prop, compares, options) {
	var checks = options.checks;
	console.log("loop", a, b);
	for(var i =0 ; i < checks.length; i++) {
		var res = checks[i](a, b, aParent, bParent, prop, compares || {}, options);
		if(res !== undefined) {
			return res;
		}
	}
	return options["default"];
};

var addToResult = function(fn, name){
	
	return function(a, b, aParent, bParent, prop, compares, options){
		var res = fn.apply(this, arguments);
		console.log(name, res);
		if(res === true) {
			if(prop !== undefined && ! ( prop in options.result )) {
				options.result[prop] = a;
			}
			return true;
		} else {
			return res;
		}
	};
	
};

var reverse = function(fn) {
	return function(a, b, aParent, bParent, prop, compares, options){
		return fn.call(this, b,a, bParent, aParent, prop, compares, options);
	};
};

module.exports = compareHelpers = {
	equal: function(a, b, aParent, bParent, prop, compares, options) {
		options.checks = [
			compareHelpers.equalComparesType,
			compareHelpers.equalBasicTypes,
			compareHelpers.equalArrayLike,
			compareHelpers.equalObject
		];
		options["default"] = false;
		
		return loop(a, b, aParent, bParent, prop, compares, options);
	},
	equalComparesType: function(a, b, aParent, bParent, prop, compares, options){
		if(typeof compares === "function") {
			var compareResult = compares(a, b, aParent, bParent, prop, options);
			if(typeof compareResult === "boolean") {
				return compareResult;
			} else if(compareResult && typeof compareResult === "object"){
				// equal objects intersect but have no difference either way
				if( ("intersection" in compareResult) && !("difference" in compareResult)) {
					var reverseResult =  compares(b, a,bParent, aParent, prop, options);
					return ("intersection" in reverseResult) && !("difference" in reverseResult);
				}
				return false;
			}
			return compareResult;
		}
	},
	equalBasicTypes: function(a, b, aParent, bParent, prop,compares, options){
		if (a === null || b === null) {
			return a === b;
		}
		if (a instanceof Date || b instanceof Date) {
			return a === b;
		}
		if (options.deep === -1) {
			return aType === 'object' || a === b;
		}
		if (typeof a !== typeof b || h.isArrayLike(a) !== h.isArrayLike(b)) {
			return false;
		}
		if (a === b) {
			return true;
		}
	},
	equalArrayLike: function( a, b, aParent, bParent, prop, compares, options ) {
		if(h.isArrayLike(a) && h.isArrayLike(b) ) {
			if (a.length !== b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				var compare = compares[i] === undefined ? compares['*'] : compares[i];
				if (!loop(a[i], b[i], a, b, i, compare, options)) {
					return false;
				}
			}
			return true;
		}
	},
	equalObject: function( a, b, aParent, bParent, prop, compares, options ){
		var aType = typeof a;
		if(aType === 'object' || aType === 'function') {
			var bCopy = h.extend({}, b);
			if(options.deep === false) {
				options.deep = -1;
			}
			
			for (var prop in a) {
				compare = compares[prop] === undefined ? compares['*'] : compares[prop];
				if (! loop(a[prop], b[prop], a, b, prop, compare, options ) ) {
					return false;
				}
				delete bCopy[prop];
			}
			// go through bCopy props ... if there is no compare .. return false
			for (prop in bCopy) {
				if (compares[prop] === undefined || !loop(undefined, b[prop], a, b, prop, compares[prop], options) ) {
					return false;
				}
			}
			return true;
		}
		
	},
	subset: function(a, b, aParent, bParent, prop, compares, options) {
		options.checks = [
			compareHelpers.subsetComparesType,
			compareHelpers.equalBasicTypes,
			compareHelpers.equalArrayLike,
			compareHelpers.equalObject
		];
		options["default"] = false;
		
		return loop(a, b, aParent, bParent, prop, compares, options);
	},
	/**
	 * Checks if A is a subset of B.  If A is a subset of B if:
	 * - A \ B = undefined
	 * - A ∩ B = defined
	 * - B ∩ A = defined
	 */
	subsetComparesType: function(a, b, aParent, bParent, prop, compares, options){
		if(typeof compares === "function") {
			var compareResult = compares(a, b, aParent, bParent, prop, options);
			console.log(compareResult);
			if(typeof compareResult === "boolean") {
				return compareResult;
			} else if(compareResult && typeof compareResult === "object"){
				// A \ B subset intersects in both directions
				// but does not diff from 
				if( ("intersection" in compareResult) && !("difference" in compareResult)) {
					var reverseResult =  compares(b, a,bParent, aParent, prop, options);
					return ("intersection" in reverseResult);
				}
				return false;
			}
			return compareResult;
		}
	},
	// returns true if A is superset of B
	// A is a superset if it has fewer properties
	properSupersetObject: function( a, b, aParent, bParent, prop, compares, options ){
		var bType = typeof b;
		var hasAdditionalProp = false;
		if(bType === 'object' || bType === 'function') {
			var aCopy = h.extend({}, a);
			if(options.deep === false) {
				options.deep = -1;
			}
			
			for (var prop in b) {
				compare = compares[prop] === undefined ? compares['*'] : compares[prop];
				// run the comparison no matter what
				var compareResult = loop(a[prop], b[prop], a, b, prop, compare, options );
				// if there wasn't a prop or we performed a diff
				if( !(prop in a) ||  options.performedDifference ) {
					hasAdditionalProp = true;
				} else if(!compareResult) {
					return false;
				}
				delete aCopy[prop];
			}
			// go through aCopy props ... if there is no compare .. return false
			for (prop in aCopy) {
				if (compares[prop] === undefined || !loop(undefined, b[prop], a, b, prop, compares[prop], options) ) {
					return false;
				}
			}
			return hasAdditionalProp;
		}
		
	},
	/**
	 * Checks if A is a subset of B.  If A is a subset of B, A \ B will be undefined. But B \ A will be defined.
	 */
	properSubsetComparesType: function(a, b, aParent, bParent, prop, compares, options){
		if(typeof compares === "function") {
			var compareResult = compares(a, b, aParent, bParent, prop, options);
			console.log(compareResult);
			if(typeof compareResult === "boolean") {
				return compareResult;
			} else if(compareResult && typeof compareResult === "object"){
				// A \ B subset intersects in both directions
				// but does not diff from 
				if( ("intersection" in compareResult) && !("difference" in compareResult)) {
					var reverseResult =  compares(b, a,bParent, aParent, prop, options);
					return ("intersection" in reverseResult) && ("difference" in reverseResult);
				}
				return false;
			}
			return compareResult;
		}
	},

	difference: function(a, b, aParent, bParent, prop, compares, options){
		// a subset is always a difference
		// go through a ... compare to b ....
		// if A has something {foo: "bar"} that B doesn't {} -> return false
		// if B has something that A doesn't and no diff -> return undefined
		// if A \ B returns a diff ... keep it
		options.result = {};
		options.performedDifference = 0;
		options.checks = [
			compareHelpers.differenceComparesType,
			addToResult(compareHelpers.equalBasicTypes,"equalBasicTypes"),
			addToResult(compareHelpers.equalArrayLike,"equalArrayLike"),
			addToResult(compareHelpers.properSupersetObject, "properSubsetObject")
		];
		
		options["default"] = true;
		
		var res = loop(a, b, aParent, bParent, prop, compares, options);
		if(res === true && options.performedDifference) {
			return options.result;
		}
		return res;
	},
	differenceComparesType: function(a, b, aParent, bParent, prop, compares, options){
		if(typeof compares === "function") {
			var compareResult = compares(a, b, aParent, bParent, prop, options);
			if(typeof compareResult === "boolean") {
				if(res === true) {
					options.result[prop] = a;
					return true;
				} else {
					return res;
				}
			} else if(compareResult && typeof compareResult === "object"){
				// is there a difference?
				if("difference" in compareResult) {
					if(compareResult.difference != null) {
						options.result[prop] = compareResult.difference;
						options.performedDifference++;
						return true;
					} else {
						return compareResult.difference;
					}
				} else {
					// if the same ... then OK ... return the union
					if( compareHelpers.equalComparesType.apply(this, arguments) ) {
						options.performedDifference++;
						options.result[prop] = compareResult.union;
					} else {
						return false;
					}
				}
			}
		}
	},
	// A has every property B has ... and then some
	diffObject: function(a, b, aParent, bParent, prop, compares, options){
		var aType = typeof a;
		if(aType === 'object' || aType === 'function') {
			var bCopy = h.extend({}, b);
			if(options.deep === false) {
				options.deep = -1;
			}
			
			for (var prop in a) {
				compare = compares[prop] === undefined ? compares['*'] : compares[prop];
				if (! loop(a[prop], b[prop], a, b, prop, compare, options ) ) {
					return false;
				}
				delete bCopy[prop];
			}
			// go through bCopy props ... if there is no compare .. return false
			for (prop in bCopy) {
				if (compares[prop] === undefined || !loop(undefined, b[prop], a, b, prop, compares[prop], options) ) {
					return false;
				}
			}
			return true;
		}
	},
	// A u B
	union: function(a, b, aParent, bParent, prop, compares, options){
		// if everything is the same OR doesn't have a property on the left or right (only)
		// and union values
		options.result = {};
		options.performedUnion = 0;
		options.checks = [
			compareHelpers.unionComparesType,
			addToResult(compareHelpers.equalBasicTypes,"equalBasicTypes"),
			addToResult(compareHelpers.unionArrayLike,"unionArrayLike"),
			addToResult(compareHelpers.unionObject, "unionObject")
		];
		
		options["default"] = false;
		
		var res = loop(a, b, aParent, bParent, prop, compares, options);
		if(res === true) {
			return options.result;
		}
		return false;
	},
	unionComparesType: function(a, b, aParent, bParent, prop, compares, options){
		if(typeof compares === "function") {
			var compareResult = compares(a, b, aParent, bParent, prop, options);
			if(typeof compareResult === "boolean") {
				if(res === true) {
					options.result[prop] = a;
					return true;
				} else {
					return res;
				}
			} else if(compareResult && typeof compareResult === "object"){
				// is there a difference?
				if("union" in compareResult) {
					if(compareResult.union !== undefined) {
						options.result[prop] = compareResult.union;
					}
					options.performedUnion++;
					return true;
				}
			}
		}
	},
	// if everything is the same OR doesn't have a property on the left or right (only)
	unionObject: function(a, b, aParent, bParent, prop, compares, options){
		var subsetCompare = function(a, b, aParent, bParent, prop){
			var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
			
			if (! loop(a, b, aParent, bParent, prop, compare, options ) ) {
				var subsetCheck;
				if( !(prop in aParent)) {
					subsetCheck = "subsetB";
				}
				if( !(prop in bParent) ) {
					subsetCheck = "subsetA";
				}
				if(subsetCheck) {
					if( !options.subset ) {
						options.subset = subsetCheck;
					}
					return options.subset === subsetCheck;
				}
				
				return false;
			}
		};
		
		
		var aType = typeof a;
		if(aType === 'object' || aType === 'function') {
			return h.eachInUnique(a, 
				subsetCompare, 
				b, 
				subsetCompare, 
				true);
		}
	},
	// this might be expensive, but work that out later
	unionArrayLike: function( a, b, aParent, bParent, prop, compares, options ) {
		if(h.isArrayLike(a) && h.isArrayLike(b) ) {
			var combined = h.makeArray(a) = h.makeArray(b);
			// unique's the combination
			h.doubleLoop(combined, function(item, cur){
				return !compareHelpers.equal(cur, item, aParent, bParent, undefined, compares['*'], {"default": false});
			});
			options.result[prop] = combined;
			return true;
		}
	},
};
