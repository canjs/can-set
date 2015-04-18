var helpers;
module.exports = helpers = {
	extend: function(d, s){
		for(var prop in s) {
			d[prop] = s[prop]
		}
		return d;
	},
	isArrayLike: function(arr){
		return arr && (typeof arr == "object") && (typeof arr.length == "number") && (arr.length >= 0) && (arr.length === 0 || ( (arr.length-1) in arr) );
	},
	each: function(obj, cb){
		if(helpers.isArrayLike(obj)) {
			for(var i = 0 ; i < obj.length; i++) {
				if( cb( obj[i], i ) === false ) {
					break;
				}
			}
		} else {
			for(var prop in obj) {
				if( obj.hasOwnProperty(prop) ) {
					if( cb( obj[prop], prop ) === false ) {
						break;
					}
				}
			}
		}
		return obj;
	}
};