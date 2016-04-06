/*src/get*/
var compare = require('./compare.js');
var h = require('./helpers.js');
var filterData = function (data, clause, comparators) {
    return h.filter.call(data, function (item) {
        var isSubset = compare.subset(item, clause, undefined, undefined, undefined, comparators, {});
        return isSubset;
    });
};
module.exports = {
    subsetData: function (a, b, bData, algebra) {
        var aClauseProps = algebra.getClauseProperties(a);
        var bClauseProps = algebra.getClauseProperties(b);
        var options = {};
        var aData = filterData(bData, aClauseProps.where, algebra.clauses.where);
        if (aData.length && (aClauseProps.enabled.order || bClauseProps.enabled.order)) {
            options = {};
            var propName = h.firstProp(aClauseProps.order), compareOrder = algebra.clauses.order[propName];
            aData = aData.sort(function (aItem, bItem) {
                return compareOrder(a[propName], aItem, bItem);
            });
        }
        if (aData.length && (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate)) {
            options = {};
            compare.subset(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, algebra.clauses.paginate, options);
            h.each(options.getSubsets, function (filter) {
                aData = filter(a, b, aData, algebra, options);
            });
        }
        return aData;
    }
};