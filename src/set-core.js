
function makeComparator(fn) {
	return function() {
		var result = {};
		for(var i = 0; i < arguments.length; i++) {
			result[arguments[i]] = fn;
		}
		return result;
	};
}

module.exports = {
	boolean: makeComparator(function(propA, propB) {
		if(propA === undefined) {
			return {
				diff: !propB,
				union: undefined,
				intersection: propB,
				adjacent: true
			};
		}
	}),

	property: makeComparator(function(propA, propB) {
		if(propA) {
			return { union: propA };
		}

		if(propB) {
			return { union: propB, diff: null };
		}
	}),

	range: makeComparator(function(propA, propB) {

	}),

	difference: function(a, b, config) {
		var result = {};
		var compared;

		for(var key in config) {
			if(config.hasOwnProperty(key)) {
				compared = config[key](a[key], b[key], a, b);
				if(compared && typeof compared.diff !== 'undefined') {
					result[key] = compared.diff;
				}
			}
		}

		return result;
	}
};
