/*src/set*/
define(function (require, exports, module) {
    var set = require('./set-core');
    var ns = require('can-util/namespace');
    var props = require('./props');
    set.comparators = props;
    set.props = props;
    set.helpers = require('./helpers');
    module.exports = ns.set = set;
});