/*src/set*/
define(function (require, exports, module) {
    var set = require('./set-core');
    var comparators = require('./comparators');
    set.comparators = comparators;
    set.helpers = require('./helpers');
    if (typeof window !== 'undefined' && !require.resolve) {
        window.set = set;
    }
    module.exports = set;
});