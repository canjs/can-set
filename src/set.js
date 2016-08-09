var set = require("./set-core");

var props = require("./props");
set.comparators = props; // For backward compatibility
set.props = props;
set.helpers = require("./helpers");



if(typeof window !== "undefined" && !require.resolve) {
	window.set = set;
}

module.exports = set;
