require("steal-qunit");

var set = require('./set');

test('set.difference object', function() {
	set.difference({ name: 'david' }, { name: 'David' }); //-> null
});

test('set.difference enumerations', function() {
	set.subset( {colors: ['blue']}, {} );
	set.difference( { colors: ['red']}, {colors: ['blue','red']} );
	set.difference({ colors: ['red']},  {colors: ['blue','red']} );
});

//set.difference({ colors: ['red'] }, { color: ['green'] }, { colors: [“red”, “green”, “blue”] } ) //-> {colors: [“blue”]}
//
//set.difference( {} , {completed: true}, {...} ) //-> {completed: false}
//set.difference( {completed: true}, {}, {...} )  //-> null
//
//set.difference( {start: 0, end: 99}, {start: 50, end: 99} }, {})
//set.difference( {start: 0, end: 99}, {start: 50, end: 98} }, {})
//
//set.difference( {name: “david”}, {name: “David”}, {...} ) //-> null
//set.difference( {name: “david”}, {}, {...} ) //-> null
//set.difference( {name: “david”}, {foo: “bar”}, {...} ) //-> undefined
//set.subset( {colors: [“blue”]}, {} )
//set.difference( { colors: [“red”]}, {colors: [“blue”,”red”]} )
//set.difference({ colors: [“red”]},  {colors: [“blue”,”red”]} )
//
//set.difference( {name: “david”}, {}, {...} ) //-> undefined
//set.difference( {}, {name: “david”}, {...} ) //-> null
//
//
//{
//	colors: function(aColors, bColors){
//		return {
//			diff: [“blue”], // can’t always be privided … but COULD if we were gods
//		intersection: [“red”],
//	}
//},
//name: function(Aname, Bname){
//	if(Aname) {
//		return {union: Aname}
//	}
//	if(Bname) {
//		return {union: BName, diff: null}
//	}
//}
//// return the difference or undefined if a difference can not be taken, same, or size
//// difference and union
//completed: function(A, B){
//	if(A === undefined) {
//		return {
//			diff: !B,
//			union: B,
//			adjacent: true
//		}
//	}
//	return undefined;
//},
//start: function(Astart = 0, Bstart) {
//	return {
//		diff: 0,
//		union: 50,
//		adjacent: “before”
//}
//},
//end: function(Astart = 0, Bstart) {
//	return {
//		diff: 49,
//		union: 99,
//		adjacent: “before”
//}
//},
//rangedProperties: [“start”,”end”]
//}
