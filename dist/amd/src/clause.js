/*can-set@1.5.0#src/clause*/
define([
    'require',
    'exports',
    'module',
    'can-util/js/assign',
    'can-util/js/each'
], function (require, exports, module) {
    var assign = require('can-util/js/assign');
    var each = require('can-util/js/each');
    var clause = {};
    module.exports = clause;
    clause.TYPES = [
        'where',
        'order',
        'paginate',
        'id'
    ];
    each(clause.TYPES, function (type) {
        var className = type.charAt(0).toUpperCase() + type.substr(1);
        clause[className] = function (compare) {
            assign(this, compare);
        };
        clause[className].type = type;
    });
});