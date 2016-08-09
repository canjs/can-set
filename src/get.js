var compare = require("./compare");
var h = require("./helpers");
var each = require("can-util/js/each/each");

var filterData = function(data, clause, props) {
	// reduce response to items in data that meet clause criteria
	return h.filter.call(data, function(item) {
		var isSubset = compare.subset(item, clause, undefined, undefined,
			undefined, props, {});

		return isSubset;
	});
};


module.exports = {
	subsetData: function(a, b, bData, algebra) {
		var aClauseProps = algebra.getClauseProperties(a);
		var bClauseProps = algebra.getClauseProperties(b);
		var options = {}; // options.getSubsets mutated by compare.subset

		// reduce response to items in data that meet where criteria
		var aData = filterData(bData, aClauseProps.where, algebra.clauses.where);

		// sort the data if needed
		if( aData.length && (aClauseProps.enabled.order || bClauseProps.enabled.order) ) {
			options = {};
			var propName = h.firstProp(aClauseProps.order),
				compareOrder = algebra.clauses.order[propName];
			aData = aData.sort(function(aItem, bItem){
				return compareOrder(a[propName], aItem, bItem);
			});
		}

		// paginate next
		if( aData.length && (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate) ) {
			options = {};

			// get pagination filters from options.getSubsets
			compare.subset(aClauseProps.paginate, bClauseProps.paginate, undefined,
				undefined, undefined, algebra.clauses.paginate, options);

			each(options.getSubsets, function(filter) {
				aData = filter(a, b, aData, algebra, options);
			});
		}

		return aData;
	}
};
