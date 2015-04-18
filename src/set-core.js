var h = require("./helpers"),
	compare = require("./compare");


var Algebra = function(compare, count){
	this.compare = compare;
	this.count = count;
};
Algebra.make = function(compare, count){
	if(compare instanceof Algebra) {
		return compare;
	} else {
		return new Algebra(compare, count);
	}
};

h.extend(Algebra.prototype, {
	equal: function(a, b){
		return compare.equal(a, b, undefined, undefined, undefined, this.compare, {});
	},
	subset: function(a, b){
		// A is a subset of B if A has every property in B
		var compares = this.compare || {};
		for (var prop in b) {
			if ( !compare.subset(a[prop], b[prop], a, b, prop, compares[prop], {}) ) {
				return false;
			}
		}
		return true;
	},
	// what a has that b doesn't
	/**
	 * // A has all of B
	 * set.difference( {} , {completed: true}, set.boolean("completed") ) //-> {completed: false}
	 * 
	 * // A has all of B, but we can't figure out how to create a set object
	 * set.difference( {} , {completed: true} ) //-> false
	 * 
	 * // A is totally inside B
	 * set.difference( {completed: true}, {} )  //-> undefined
	 * @param {Object} a
	 * @param {Object} b
	 */
	difference: function(a, b){
		// if everything is equal or has a difference
		return compare.difference(a, b, undefined, undefined, undefined, this.compare, {});
	}
});

module.exports = {
	Algebra : Algebra,
	difference: function(a, b, config) {
		return Algebra.make(config).difference(a, b);
	},
	equal: function(a, b, config) {
		return Algebra.make(config).equal(a, b);
	},
	subset: function(a, b, config) {
		return Algebra.make(config).subset(a, b);
	}
};
