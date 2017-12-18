/*can-set@1.3.3#src/set*/
define([
    'require',
    'exports',
    'module',
    './set-core',
    'can-namespace',
    './props',
    './clause',
    './helpers'
], function (require, exports, module) {
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