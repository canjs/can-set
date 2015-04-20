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
	},
	// loops through all unique props in a and then in b
	eachInUnique: function(a, acb, b, bcb, defaultReturn){
		var bCopy = helpers.extend({}, b);
		for (var prop in a) {
			var res = acb(a[prop], b[prop], a, b, prop );
			if(res !== undefined) {
				return res;
			}
			delete bCopy[prop];
		}
		for (prop in bCopy) {
			var res = bcb(undefined, b[prop], a, b, prop );
			if(res !== undefined) {
				return res;
			}
		}
		return defaultReturn;
	},
	makeArray: function(arr){
		var array = [];
		each(arr, function(item){
			array.push(item);
		});
		return array;
	},
	doubleLoop: function(arr, callbacks){
		if(typeof callbacks === "function") {
			callbacks = {iterate: callbacks};
		}
		var i = 0;
		while(i < arr.length) {
			callbacks.start(arr[i]);
			var j = i+1;
			while( j < arr.length ) {
				if(callbacks.iterate(arr[j], j, arr[i], i) === false) {
					arr.splice(j, 1);
				} else {
					j++;
				}
			}
			if(callbacks.end) {
				callbacks.end(arr[i]);
			}
			i++;
		}
	}
};