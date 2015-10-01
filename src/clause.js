var h = require("./helpers");
var clause = {};
var addClause = function(typeName, type){
	clause[typeName] = function(compare){
		h.extend(this, compare);
	};
	clause[typeName].type = type;
};
addClause("Sort","sort");
addClause("Where","where");
addClause("Paginate","paginate");

module.exports = clause;