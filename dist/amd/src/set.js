/*src/set*/
define(function (require, exports, module) {
    var set = require('./set-core');
    var comparators = require('./comparators');
    set.comparators = comparators;
    module.exports = set;
});