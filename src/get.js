var compare = require("./compare");
var set = require("./set-core");
var h = require("./helpers");

var filterData = function(data, clause, comparators) {
	// reduce response to items in data that meet clause criteria
	return data.filter(function(item) {
	return h.filter.call(data.filter, function(item) {
		var inSubset = compare.subset(item, clause, undefined, undefined,
			undefined, comparators, {});

		return inSubset;
	});
};

module.exports = {
	getSubset: function(a, b, bData, algebra) {
		// make sure passed in algebra is Algebra and not comparators
		algebra = set.Algebra.make(algebra);

		var aClauseProps = algebra.getClauseProperties(a);
		var bClauseProps = algebra.getClauseProperties(b);

		var options = {}; // options.getSubsets mutated by compare.subset
		var subsetFilters = [];

		// reduce response to items in data that meet where criteria
		var aData = filterData(bData, aClauseProps.where, algebra.clauses.where);

		// if data requires further processing, get filters from optons.getSubsets
		if(aData.length) {
			h.each(['order', 'paginate'], function(clauseType) {
				if(aClauseProps.enabled[clauseType]) {
					options = {};

					compare.subset(aClauseProps[clauseType], bClauseProps[clauseType],
						undefined, undefined, undefined, algebra.clauses[clauseType],
						options);

					if(options.getSubsets.length) {
						subsetFilters = subsetFilters.concat(options.getSubsets);
					}
				}
			});
		};

		h.each(subsetFilters, function(filter) {
			aData = filter(a, b, aData, algebra, options);
		});
		
		return aData;
	},
	getUnion: function(a,b,aItems, bItems, algebra){
		var options = {};
		if(compare.subset(a, b, undefined, undefined, undefined, algebra, options)) {
			return bItems;
		} else if(compare.subset(b, a, undefined, undefined, undefined, algebra, options)) {
			return aItems;
		}

		var isUnion = compare.union(a, b, undefined, undefined, undefined, algebra, options);

		if(isUnion) {
			h.each(options.getUnions, function(filter){
				var items = filter(a,b, aItems, bItems, algebra, options);
				aItems = items[0];
				bItems = items[1];
			});
			return aItems.concat(bItems);
		}
	}
};
