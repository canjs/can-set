/*src/set-core*/
var h = require('./helpers.js'), compare = require('./compare.js');
var Algebra = function () {
    var compare = {};
    h.each(arguments, function (arg) {
        h.extend(compare, arg);
    });
    this.compare = compare;
};
Algebra.make = function (compare, count) {
    if (compare instanceof Algebra) {
        return compare;
    } else {
        return new Algebra(compare, count);
    }
};
h.extend(Algebra.prototype, {
    equal: function (a, b) {
        return compare.equal(a, b, undefined, undefined, undefined, this.compare, {});
    },
    subset: function (a, b) {
        return compare.subset(a, b, undefined, undefined, undefined, this.compare, {});
    },
    properSubset: function (a, b) {
        return this.subset(a, b) && !this.equal(a, b);
    },
    difference: function (a, b) {
        return compare.difference(a, b, undefined, undefined, undefined, this.compare, {});
    },
    union: function (a, b) {
        return compare.union(a, b, undefined, undefined, undefined, this.compare, {});
    },
    intersection: function (a, b) {
        return compare.intersection(a, b, undefined, undefined, undefined, this.compare, {});
    },
    count: function (a) {
        return compare.count(a, {}, undefined, undefined, undefined, this.compare, {});
    }
});
module.exports = {
    Algebra: Algebra,
    difference: function (a, b, config) {
        return Algebra.make(config).difference(a, b);
    },
    equal: function (a, b, config) {
        return Algebra.make(config).equal(a, b);
    },
    subset: function (a, b, config) {
        return Algebra.make(config).subset(a, b);
    },
    properSubset: function (a, b, config) {
        return Algebra.make(config).properSubset(a, b);
    },
    union: function (a, b, config) {
        return Algebra.make(config).union(a, b);
    },
    intersection: function (a, b, config) {
        return Algebra.make(config).intersection(a, b);
    },
    count: function (a, config) {
        return Algebra.make(config).count(a);
    }
};