var h = require("./helpers"),
	compare = require("./compare");

// set.subset({foo: "bar"},{}) //-> true

// algebra = new Alegbra()
// algebra.getSubset()


var Algebra = function(){
	this.clauses = {where: {}, sort: {}, paginate: {} };
	h.each( arguments, function(arg){
		h.extend( clauses[arg.constructor.type || "where"], arg);
	});
};

Algebra.make = function(compare, count){
	if(compare instanceof Algebra) {
		return compare;
	} else {
		return new Algebra(compare, count);
	}
};

h.extend(Algebra.prototype, {
	getClauseProperties: function(set){
		var setClone = h.extend({},set);
		var clauseProps = {};
		var self = this;
		["sort","paginate"].forEach(function(clauseName){
			var valuesForClause = clauseProps[clauseName] = {};
			for( var prop in this.clauses[clauseName] ) {
				if(prop in setClone) {
					valuesForClause[prop] = setClone[prop];
					delete setClone[prop];
				}
			}
		});
		clauseProps.where = setClone;
	},
	equal: function(a, b){
		var aClauseProps = this.getClauseProperties(a),
			bClauseProps = this.getClauseProperties(b);
			
		var result = compare.equal(aClauseProps.where, bClauseProps.where, undefined, undefined, undefined, this.clauses.where, {});
		if(result) {
			if(h.isEmptyObject(aClauseProps.paginate) && h.isEmptyObject(bClauseProps.paginate)) {
				return result;
			} else {
				result = compare.equal(aClauseProps.sort, bClauseProps.sort, undefined, undefined, undefined, this.clauses.sort, {});
				if(result) {
					return compare.equal(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, this.clauses.paginate, {});
				}
			}
		}
		
		return result;
	},
	subset: function(a, b){
		// A is a subset of B if A has every property in B
		return compare.subset(a, b, undefined, undefined, undefined, this.compare, {});
	},
	properSubset: function(a, b){
		return this.subset(a, b) && !this.equal(a, b);
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
	},
	union: function(a, b){
		// if everything is equal or has a difference
		return compare.union(a, b, undefined, undefined, undefined, this.compare, {});
	},
	intersection: function(a, b){
		// if everything is equal or has a difference
		return compare.intersection(a, b, undefined, undefined, undefined, this.compare, {});
	},
	count: function(a){
		return compare.count(a, {}, undefined, undefined, undefined, this.compare, {});
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
	},
	properSubset: function(a, b, config) {
		return Algebra.make(config).properSubset(a, b);
	},
	union: function(a, b, config) {
		return Algebra.make(config).union(a, b);
	},
	intersection: function(a, b, config){
		return Algebra.make(config).intersection(a, b);
	},
	count: function(a, config){
		return Algebra.make(config).count(a);
	}
};
