var set = require("./set-core");
var ns = require("can-namespace");

var props = require("./props");
var clause = require("./clause");

set.comparators = props; // For backward compatibility
set.props = props;
set.helpers = require("./helpers");
set.clause = clause;

module.exports = ns.set = set;
