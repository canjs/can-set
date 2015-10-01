var h = require("./helpers");
var clause = require('./clause');
var compare = require("./compare");

// set.subset({foo: "bar"},{}) //-> true

// algebra = new Alegbra()
// algebra.getSubset()


var Algebra = function(){
	this.clauses = clauses = { where: {}, order: {}, paginate: {} };

	h.each(arguments, function(arg) {
		if(arg) {
			h.extend(clauses[arg.constructor.type || 'where'], arg);
		}
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
	getClauseProperties: function(set, options) {
		options = options || {};

		var setClone = h.extend({}, set);
		var checkClauses = ['order', 'paginate'];
		var clauseProps = {
			enabled: {
				where: true,
				order: false,
				paginate: false
			}
		};

		if(options.omitClauses) {
			checkClauses = h.arrayUnionIntersectionDifference(
				checkClauses, options.omitClauses).difference;
		}

		h.each(checkClauses, function(clauseName) {
			var valuesForClause = {};
			var prop;

			for(prop in this.clauses[clauseName]) {
				if(prop in setClone) {
					valuesForClause[prop] = setClone[prop];
					delete setClone[prop];
				}
			}

			clauseProps[clauseName] = valuesForClause;
			clauseProps.enabled[clauseName] = !h.isEmptyObject(valuesForClause);
		});

		clauseProps.where = setClone;

		return clauseProps;
	},
	evaluateOperator: function(operator, a, b) {
		var aClauseProps = this.getClauseProperties(a);
		var bClauseProps = this.getClauseProperties(b);

		var result = operator(aClauseProps.where, bClauseProps.where,
			undefined, undefined, undefined, this.clauses.where, {});

		if(result && (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate)) {
			if(aClauseProps.enabled.order || bClauseProps.enabled.order) {
				result = operator(aClauseProps.order, bClauseProps.order, undefined,
					undefined, undefined, this.clauses.order, {});
			}

			if(result) {
				result = operator(aClauseProps.paginate, bClauseProps.paginate,
					undefined, undefined, undefined, this.clauses.paginate, {});
			}
		}

		return result;
	},
	equal: function(a, b) {
		return this.evaluateOperator(compare.equal, a, b);
	},
	subset: function(a, b){
		// A is a subset of B if A has every property in B
		return this.evaluateOperator(compare.subset, a, b);
	},
	whereSubset: function(a, b){
		var aClauseProps = this.getClauseProperties(a);
		var bClauseProps = this.getClauseProperties(b);

		return this.evaluateOperator(
			compare.subset,
			aClauseProps.where,
			bClauseProps.where
		);
	},
	whereInSubset: function(a, b){
		var aClauseProps = this.getClauseProperties(a);
		var bClauseProps = this.getClauseProperties(b);

		return this.evaluateOperator(
			compare.subset,
			h.extend(aClauseProps.where, aClauseProps.paginate),
			h.extend(bClauseProps.where, bClauseProps.paginate)
		);
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
	 * set.difference( {completed: true}, {} ) //-> undefined
	 * @param {Object} a
	 * @param {Object} b
	 */
	difference: function(a, b) {
		var self = this;
		var aClauseProps = this.getClauseProperties(a);
		var bClauseProps = this.getClauseProperties(b);
		var clauses = ['where', 'order', 'paginate'];
		var differentClauses = [];
		var result;

		h.each(clauses, function(clauseName) {
			if(!self.equal(aClauseProps[clauseName], bClauseProps[clauseName])) {
				differentClauses.push(clauseName);
			}
		});

		switch(differentClauses.length) {
			case 0 : {
				result = false;
				break;
			}
			case 1 : {
				result = compare.difference(aClauseProps[differentClauses[0]],
					bClauseProps[differentClauses[0]], undefined, undefined, undefined,
					this.clauses[differentClauses[0]], {});
				break;
			}
		}

		return result;
	},
	union: function(a, b){
		// if everything is equal or has a difference
		return this.evaluateOperator(compare.union, a, b);
	},
	intersection: function(a, b){
		// if everything is equal or has a difference
		return this.evaluateOperator(compare.intersection, a, b);
	},
	count: function(a){
		return this.evaluateOperator(compare.count, a, {});
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
	whereSubset: function(a, b, config) {
		return Algebra.make(config).whereSubset(a, b);
	},
	whereInSubset: function(a, b, config) {
		return Algebra.make(config).whereInSubset(a, b);
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
