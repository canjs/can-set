/*src/comparators*/
define(function (require, exports, module) {
    var h = require('./helpers');
    function makeComparator(fn) {
        return function () {
            var result = {};
            h.each(arguments, function (propertyName) {
                result[propertyName] = fn;
            });
            return result;
        };
    }
    var within = function (value, range) {
        return value >= range[0] && value <= range[1];
    };
    var diff = function (setA, setB, property1, property2) {
        var sAv1 = setA[property1], sAv2 = setA[property2], sBv1 = setB[property1], sBv2 = setB[property2], count = sAv2 - sAv1 + 1;
        if (sAv1 === sBv1 && sAv2 === sBv2) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count
            };
        } else if (within(sAv1, [
                sBv1,
                sBv2
            ]) && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sBv2
                ],
                count: count
            };
        } else if (within(sBv1, [
                sAv1,
                sAv2
            ]) && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return {
                intersection: [
                    sBv1,
                    sBv2
                ],
                difference: [
                    null,
                    null
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count
            };
        } else if (sAv1 < sBv1 && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return {
                difference: [
                    sAv1,
                    sBv1 - 1
                ],
                merge: 'befre',
                intersection: [
                    sBv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sBv2
                ],
                count: count
            };
        } else if (sBv1 < sAv1 && within(sBv2, [
                sAv1,
                sAv2
            ]) || sAv1 === sBv1 && sBv2 < sAv2) {
            return {
                difference: [
                    sBv2 + 1,
                    sAv2
                ],
                insertNeeds: 'after',
                intersection: [
                    sAv1,
                    sBv2
                ],
                union: [
                    sBv1,
                    sAv2
                ],
                count: count
            };
        } else if (sAv2 === sBv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                insertNeeds: 'before',
                union: [
                    sAv1,
                    sBv2
                ],
                count: count
            };
        } else if (sBv2 === sAv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                insertNeeds: 'after',
                union: [
                    sBv1,
                    sAv2
                ],
                count: count
            };
        }
        if (!isNaN(count)) {
            return { count: count };
        }
    };
    module.exports = {
        rangeInclusive: function (startIndexProperty, endIndexProperty) {
            var compares = {};
            var makeResult = function (result, index) {
                var res = {};
                if (result.intersection) {
                    res.intersection = result.intersection[index];
                }
                if (result.difference) {
                    res.difference = result.difference[index];
                }
                if (result.union) {
                    res.union = result.union[index];
                }
                if (result.count) {
                    res.count = result.count;
                }
                return res;
            };
            compares[startIndexProperty] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(A, B, startIndexProperty, endIndexProperty);
                return makeResult(res, 0);
            };
            compares[endIndexProperty] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(A, B, startIndexProperty, endIndexProperty);
                return makeResult(res, 1);
            };
            return compares;
        },
        'boolean': makeComparator(function (propA, propB) {
            var notA = !propA, notB = !propB;
            if (propA === notB && propB === notA) {
                return {
                    difference: !propB,
                    union: undefined
                };
            } else if (propA === undefined) {
                return {
                    difference: !propB,
                    intersection: propB,
                    union: undefined
                };
            }
        })
    };
});