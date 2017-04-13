/*can-set@1.1.0#src/set*/
define(function (require, exports, module) {
    var set = require('./set-core');
    var ns = require('can-namespace');
    var props = require('./props');
    var clause = require('./clause');
    set.comparators = props;
    set.props = props;
    set.helpers = require('./helpers');
    set.clause = clause;
    module.exports = ns.set = set;
});