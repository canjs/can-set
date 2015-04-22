var set = require("./set-core");
var comparators = require("./comparators");
set.comparators = comparators;
if(typeof window !== "undefined" && !require.resolve) {
	window.set = set;
}

module.exports = set;
