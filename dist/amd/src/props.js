/*can-set@1.4.0#src/props*/
define([
    'require',
    'exports',
    'module',
    './helpers',
    './clause',
    'can-util/js/each'
], function (require, exports, module) {
    var h = require('./helpers');
    var clause = require('./clause');
    var each = require('can-util/js/each');
    var within = function (value, range) {
        return value >= range[0] && value <= range[1];
    };
    var numericProperties = function (setA, setB, property1, property2) {
        return {
            sAv1: +setA[property1],
            sAv2: +setA[property2],
            sBv1: +setB[property1],
            sBv2: +setB[property2]
        };
    };
    var diff = function (setA, setB, property1, property2) {
        var numProps = numericProperties(setA, setB, property1, property2);
        var sAv1 = numProps.sAv1, sAv2 = numProps.sAv2, sBv1 = numProps.sBv1, sBv2 = numProps.sBv2, count = sAv2 - sAv1 + 1;
        var after = {
            difference: [
                sBv2 + 1,
                sAv2
            ],
            intersection: [
                sAv1,
                sBv2
            ],
            union: [
                sBv1,
                sAv2
            ],
            count: count,
            meta: 'after'
        };
        var before = {
            difference: [
                sAv1,
                sBv1 - 1
            ],
            intersection: [
                sBv1,
                sAv2
            ],
            union: [
                sAv1,
                sBv2
            ],
            count: count,
            meta: 'before'
        };
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
                count: count,
                meta: 'equal'
            };
        } else if (sAv1 === sBv1 && sBv2 < sAv2) {
            return after;
        } else if (sAv2 === sBv2 && sBv1 > sAv1) {
            return before;
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
                count: count,
                meta: 'subset'
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
                count: count,
                meta: 'superset'
            };
        } else if (sAv1 < sBv1 && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return before;
        } else if (sBv1 < sAv1 && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return after;
        } else if (sAv2 === sBv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sBv2
                ],
                count: count,
                meta: 'disjoint-before'
            };
        } else if (sBv2 === sAv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sAv2
                ],
                count: count,
                meta: 'disjoint-after'
            };
        }
        if (!isNaN(count)) {
            return {
                count: count,
                meta: 'disjoint'
            };
        }
    };
    var cleanUp = function (value, enumData) {
        if (!value) {
            return enumData;
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!value.length) {
            return enumData;
        }
        return value;
    };
    var stringConvert = {
        '0': false,
        'false': false,
        'null': undefined,
        'undefined': undefined
    };
    var convertToBoolean = function (value) {
        if (typeof value === 'string') {
            return value.toLowerCase() in stringConvert ? stringConvert[value.toLowerCase()] : true;
        }
        return value;
    };
    var props = {
        'enum': function (prop, enumData) {
            var compares = new clause.Where({});
            compares[prop] = function (vA, vB, A, B) {
                vA = cleanUp(vA, enumData);
                vB = cleanUp(vB, enumData);
                var data = h.arrayUnionIntersectionDifference(vA, vB);
                if (!data.difference.length) {
                    delete data.difference;
                }
                each(data, function (value, prop) {
                    if (Array.isArray(value)) {
                        if (h.arraySame(enumData, value)) {
                            data[prop] = undefined;
                        } else if (value.length === 1) {
                            data[prop] = value[0];
                        }
                    }
                });
                return data;
            };
            return compares;
        },
        paginate: function (propStart, propEnd, translateToStartEnd, reverseTranslate) {
            var compares = {};
            var makeResult = function (result, index) {
                var res = {};
                each([
                    'intersection',
                    'difference',
                    'union'
                ], function (prop) {
                    if (result[prop]) {
                        var set = {
                            start: result[prop][0],
                            end: result[prop][1]
                        };
                        res[prop] = reverseTranslate(set)[index === 0 ? propStart : propEnd];
                    }
                });
                if (result.count) {
                    res.count = result.count;
                }
                return res;
            };
            compares[propStart] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
                var result = makeResult(res, 0);
                result.getSubset = function (a, b, bItems, algebra, options) {
                    return bItems;
                };
                result.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    return [
                        aItems,
                        bItems
                    ];
                };
                return result;
            };
            compares[propEnd] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var data = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
                var res = makeResult(data, 1);
                res.getSubset = function (a, b, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    var numProps = numericProperties(tA, tB, 'start', 'end');
                    var aStartValue = numProps.sAv1, aEndValue = numProps.sAv2;
                    var bStartValue = numProps.sBv1;
                    if (!('end' in tB) || !('end' in tA)) {
                        return bItems.slice(aStartValue, aEndValue + 1);
                    }
                    return bItems.slice(aStartValue - bStartValue, aEndValue - bStartValue + 1);
                };
                res.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    if (data.meta.indexOf('after') >= 0) {
                        if (data.intersection) {
                            bItems = bItems.slice(0, data.intersection[0] - +tB.start);
                        }
                        return [
                            bItems,
                            aItems
                        ];
                    }
                    if (data.intersection) {
                        aItems = aItems.slice(0, data.intersection[0] - +tA.start);
                    }
                    return [
                        aItems,
                        bItems
                    ];
                };
                return res;
            };
            return new clause.Paginate(compares);
        },
        'boolean': function (propertyName) {
            var compares = new clause.Where({});
            compares[propertyName] = function (propA, propB) {
                propA = convertToBoolean(propA);
                propB = convertToBoolean(propB);
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
                } else if (propA === propB) {
                    return true;
                }
            };
            return compares;
        },
        'sort': function (prop, sortFunc) {
            if (!sortFunc) {
                sortFunc = h.defaultSort;
            }
            var compares = {};
            compares[prop] = sortFunc;
            return new clause.Order(compares);
        },
        'id': function (prop) {
            var compares = {};
            compares[prop] = prop;
            return new clause.Id(compares);
        }
    };
    var assignExcept = function (d, s, props) {
        for (var prop in s) {
            if (!props[prop]) {
                d[prop] = s[prop];
            }
        }
        return d;
    };
    var translateToOffsetLimit = function (set, offsetProp, limitProp) {
        var newSet = assignExcept({}, set, {
            start: 1,
            end: 1
        });
        if ('start' in set) {
            newSet[offsetProp] = set.start;
        }
        if ('end' in set) {
            newSet[limitProp] = set.end - set.start + 1;
        }
        return newSet;
    };
    var translateToStartEnd = function (set, offsetProp, limitProp) {
        var except = {};
        except[offsetProp] = except[limitProp] = 1;
        var newSet = assignExcept({}, set, except);
        if (offsetProp in set) {
            newSet.start = parseInt(set[offsetProp], 10);
        }
        if (limitProp in set) {
            newSet.end = newSet.start + parseInt(set[limitProp]) - 1;
        }
        return newSet;
    };
    props.offsetLimit = function (offsetProp, limitProp) {
        offsetProp = offsetProp || 'offset';
        limitProp = limitProp || 'limit';
        return props.paginate(offsetProp, limitProp, function (set) {
            return translateToStartEnd(set, offsetProp, limitProp);
        }, function (set) {
            return translateToOffsetLimit(set, offsetProp, limitProp);
        });
    };
    props.rangeInclusive = function (startIndexProperty, endIndexProperty) {
        startIndexProperty = startIndexProperty || 'start';
        endIndexProperty = endIndexProperty || 'end';
        return props.paginate(startIndexProperty, endIndexProperty, function (set) {
            var except = {};
            except[startIndexProperty] = except[endIndexProperty] = 1;
            var newSet = assignExcept({}, set, except);
            if (startIndexProperty in set) {
                newSet.start = set[startIndexProperty];
            }
            if (endIndexProperty in set) {
                newSet.end = set[endIndexProperty];
            }
            return newSet;
        }, function (set) {
            var except = {
                start: 1,
                end: 1
            };
            var newSet = assignExcept({}, set, except);
            newSet[startIndexProperty] = set.start;
            newSet[endIndexProperty] = set.end;
            return newSet;
        });
    };
    var nestedLookup = function (obj, propNameArray) {
        if (obj === undefined) {
            return undefined;
        }
        if (propNameArray.length === 1) {
            return obj[propNameArray[0]];
        } else {
            return nestedLookup(obj[propNameArray[0]], propNameArray.slice(1));
        }
    };
    props.dotNotation = function (dotProperty) {
        var compares = new clause.Where({});
        compares[dotProperty] = function (aVal, bVal, a, b, propertyName) {
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
});