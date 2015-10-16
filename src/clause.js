var h = require("./helpers");

var clause = {};

clause.TYPES = [
	'where',
	'order',
	'paginate'
];

// define clause type classes
h.each(clause.TYPES, function(type) {
	var className = type.replace(/^./, type[0].toUpperCase());

	clause[className] = function(compare) {
		h.extend(this, compare);
	};

	clause[className].type = type;
});

module.exports = clause;
