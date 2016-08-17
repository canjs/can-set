/*src/set*/
define(function (require, exports, module) {
    var set = require('./set-core');
    var props = require('./props');
    set.comparators = props;
    set.props = props;
    set.helpers = require('./helpers');
    if (typeof window !== 'undefined' && !require.resolve) {
        window.set = set;
    }
    module.exports = set;
});