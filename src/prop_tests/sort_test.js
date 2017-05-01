var QUnit = require("steal-qunit");

var set = require('../set-core'),
	props = require("../props");

var each = require("can-util/js/each/each");

QUnit.module("can-set props.sort");

test('set.difference', function(){
	var prop = props.sort('sort');

	var res = set.difference({sort: "foo"}, { completed: true }, prop);
	ok(res === true, "diff should be true");

	res = set.difference({ completed: true }, { completed: true, sort: "foo" }, prop);
	equal(res, false, "the same except for sort");

	res = set.difference({ completed: true }, { sort: "foo"}, prop);
	equal(res, false);

	res = set.difference({ completed: true }, { foo: 'bar', sort: "foo" }, prop);
	equal(res, false);
});

test('set.difference - nested object syntax', function(){
	var prop = props.sort('sort');

	var res = set.difference({sort: {foo: 1}}, { completed: true }, prop);
	ok(res === true, "diff should be true - mongodb sort syntax");

	res = set.difference({ completed: true }, { completed: true, sort: {foo: 1}}, prop);
	equal(res, false, "the same except for sort");

	res = set.difference({ completed: true }, { sort: {foo:1}}, prop);
	equal(res, false);

	res = set.difference({ completed: true }, { foo: 'bar', sort: {foo:1} }, prop);
	equal(res, false);
});

test('set.difference({ function })', function() {
	var algebra = new set.Algebra(
		props.sort('sort'),
		{
			colors: function() {
				return {
					difference: ['red' ],
					intersection: ['blue']
				};
			}
		});

	var res = algebra.difference({ colors: ['red','blue'], sort: 'colors' },
		{ colors: ['blue'] });

	deepEqual(res, { colors: [ 'red' ] });
});

test('set.difference({ function }) - nested object syntax', function() {
	var algebra = new set.Algebra(
		props.sort('sort'),
		{
			colors: function() {
				return {
					difference: ['red' ],
					intersection: ['blue']
				};
			}
		});

	var res = algebra.difference({ colors: ['red','blue'], sort: {colors: 1} },
		{ colors: ['blue'] });

	deepEqual(res, { colors: [ 'red' ] });
});

test('set.union', function(){
	var prop = props.sort('sort');
	// set / subset
	var res = set.union({sort: "name"}, { completed: true }, prop);
	deepEqual(res , {}, "set / subset sort left");

	res = set.union({}, { completed: true, sort: "name" }, prop);
	deepEqual(res , {}, "set / subset sort right");

	res = set.union({ sort: "name" }, { completed: true, sort: "namer" }, prop);
	deepEqual(res , {}, "set / subset both sorts");

	res = set.union({ completed: true }, {sort: "foo"}, prop);
	deepEqual(res , {}, "subset / set");

	res = set.union({foo: "bar", sort: "foo"},{foo: "bar"}, prop);
	deepEqual(res, {foo: "bar"}, "equal");

	res = set.union({foo: "bar"},{foo: "zed", sort: "foo"}, prop);
	ok(!res, "values not equal");

	res = set.union({foo: "bar", sort: "foo"},{name: "A"}, prop);
	ok(!res, "values not equal");
});

test('set.union - nested object syntax', function(){
	var prop = props.sort('sort');
	// set / subset
	var res = set.union({sort: {name: 1}}, { completed: true }, prop);
	deepEqual(res , {}, "set / subset sort left");

	res = set.union({}, { completed: true, sort: {name: 1}}, prop);
	deepEqual(res , {}, "set / subset sort right");

	res = set.union({ sort: "name" }, { completed: true, sort: {namer: 1}}, prop);
	deepEqual(res , {}, "set / subset both sorts");

	res = set.union({ completed: true }, {sort: {foo: 1}}, prop);
	deepEqual(res , {}, "subset / set");

	res = set.union({foo: "bar", sort: {foo: 1}},{foo: "bar"}, prop);
	deepEqual(res, {foo: "bar"}, "equal");

	res = set.union({foo: "bar"},{foo: "zed", sort: {foo: 1}}, prop);
	ok(!res, "values not equal");

	res = set.union({foo: "bar", sort: {foo: 1}},{name: "A"}, prop);
	ok(!res, "values not equal");
});

test('set.union Array', function(){
	var prop = props.sort('sort');
	var res = set.union({foo: ["a","b"], sort: "foo"}, { foo: ["a","c"] },
		prop);

	deepEqual(res , {foo: ["a","b","c"]}, "set / subset");
});

test('set.union Array - nested object syntax', function(){
	var prop = props.sort('sort');
	var res = set.union({foo: ["a","b"], sort: {foo: 1}}, { foo: ["a","c"] },
		prop);

	deepEqual(res , {foo: ["a","b","c"]}, "set / subset");
});

test('set.count', function(){
	ok( set.count({ sort: 'name' }) === Infinity, "defaults to infinity");
	ok( set.count({foo: "bar", sort: "foo"},{}) === Infinity, "defaults to infinity");

	equal( set.count({foo: "bar", sort: "foo"}, {
		foo: function(){
			return {
				count: 100
			};
		}
	}), 100, "works with a single value");
});

test('set.count - nested object syntax', function(){
	ok( set.count({ sort: {name: 1} }) === Infinity, "defaults to infinity");
	ok( set.count({foo: "bar", sort: "foo"},{}) === Infinity, "defaults to infinity");

	equal( set.count({foo: "bar", sort: {foo: 1}}, {
		foo: function(){
			return {
				count: 100
			};
		}
	}), 100, "works with a single value");
});

test('set.intersection', function(){
	var prop = props.sort('sort');

	var res = set.intersection({} , { sort: 'name' }, prop);
	deepEqual(res, {}, "no sort if only one is sorted");

	res = set.intersection({ sort: 'name' } , { sort: 'name' }, prop);
	deepEqual(res, {sort: 'name'}, "");

	res = set.intersection({type: 'new'} , { sort: 'name', userId: 5 }, prop);
	deepEqual(res, {type: 'new', userId: 5 }, "");

	res = set.intersection({type: 'new', sort: "age"} , { sort: 'name', userId: 5 }, prop);
	deepEqual(res, {type: 'new', userId: 5 }, "");
});

test('set.intersection - nested object syntax', function(){
	var prop = props.sort('sort');
	// var prop = 'sort';

	var res = set.intersection({} , { sort: {name: 1}}, prop);
	deepEqual(res, {}, "no sort if only one is sorted");

	// res = set.intersection({ sort: {name: 1}} , { sort: {name: 1}}, prop);
	// deepEqual(res, {sort: {name: 1}}, "");

	// res = set.intersection({type: 'new'} , { sort: {name: 1}, userId: 5 }, prop);
	// deepEqual(res, {type: 'new', userId: 5 }, "");

	// res = set.intersection({type: 'new', sort: "age"} , { sort: {name: 1}, userId: 5 }, prop);
	// deepEqual(res, {type: 'new', userId: 5 }, "");
});

test('set.intersection Array', function(){
	var prop = props.sort('sort');
	var res = set.intersection({foo: ["a","b"], sort: 'foo'},
		{ foo: ["a","c"] }, prop);

	deepEqual(res , {foo: ["a"]}, "intersection");
});

test('set.intersection Array - nested object syntax', function(){
	var prop = props.sort('sort');
	var res = set.intersection({foo: ["a","b"], sort: {foo: 1}},
		{ foo: ["a","c"] }, prop);

	deepEqual(res , {foo: ["a"]}, "intersection");
});

test('set.subset', function(){
	var ignoreProp = function(){ return true; };

	var algebra = new set.Algebra(props.sort('sort'),{
		foo: ignoreProp,
		bar: ignoreProp,
		kind: ignoreProp,
		count: ignoreProp
	});

	ok( algebra.subset(
		{ type : 'FOLDER', sort: "thing" },
		{ type : 'FOLDER' } ), 'equal sets with sort on the left');

	ok( algebra.subset(
		{ type : 'FOLDER' },
		{ type : 'FOLDER', sort: "thing" } ), 'equal sets with sort on the right');

	ok( algebra.subset(
		{ type : 'FOLDER', parentId : 5, sort: 'thing' },
		{ type : 'FOLDER'} ), 'sub set with sort on the left');

	ok( algebra.subset(
		{ type : 'FOLDER', parentId : 5 },
		{ type : 'FOLDER', sort: 'thing'} ), 'sub set with sort on the right');

	ok(!algebra.subset(
		{ type: 'FOLDER', sort: 'thing' },
		{ type: 'FOLDER', parentId: 5 }), 'wrong way with sort on the left');

	ok(!algebra.subset(
		{ type: 'FOLDER' },
		{ type: 'FOLDER', parentId: 5, sort: 'thing' }), 'wrong way with sort on the right');

	ok(!algebra.subset(
		{ type: 'FOLDER', parentId: 7, sort: 'thing' },
		{ type: 'FOLDER', parentId: 5 }), 'different values with sort on the left');

	ok(!algebra.subset(
		{ type: 'FOLDER', parentId: 7 },
		{ type: 'FOLDER', parentId: 5, sort: 'thing' }), 'different values with sort on the right');
});

test('set.subset - nested object syntax', function(){
	var ignoreProp = function(){ return true; };

	var algebra = new set.Algebra(props.sort('sort'),{
		foo: ignoreProp,
		bar: ignoreProp,
		kind: ignoreProp,
		count: ignoreProp
	});

	ok( algebra.subset(
		{ type : 'FOLDER', sort: {thing: 1}},
		{ type : 'FOLDER' } ), 'equal sets with sort on the left');

	ok( algebra.subset(
		{ type : 'FOLDER' },
		{ type : 'FOLDER', sort: {thing: 1}} ), 'equal sets with sort on the right');

	ok( algebra.subset(
		{ type : 'FOLDER', parentId : 5, sort: {thing: 1} },
		{ type : 'FOLDER'} ), 'sub set with sort on the left');

	ok( algebra.subset(
		{ type : 'FOLDER', parentId : 5 },
		{ type : 'FOLDER', sort: {thing: 1}} ), 'sub set with sort on the right');

	ok(!algebra.subset(
		{ type: 'FOLDER', sort: {thing: 1} },
		{ type: 'FOLDER', parentId: 5 }), 'wrong way with sort on the left');

	ok(!algebra.subset(
		{ type: 'FOLDER' },
		{ type: 'FOLDER', parentId: 5, sort: {thing: 1} }), 'wrong way with sort on the right');

	ok(!algebra.subset(
		{ type: 'FOLDER', parentId: 7, sort: {thing: 1} },
		{ type: 'FOLDER', parentId: 5 }), 'different values with sort on the left');

	ok(!algebra.subset(
		{ type: 'FOLDER', parentId: 7 },
		{ type: 'FOLDER', parentId: 5, sort: {thing: 1} }), 'different values with sort on the right');
});

test('set.subset with range', function(){
	var algebra = new set.Algebra(props.sort('sort'),props.rangeInclusive('start','end'));

	// add sort .. same .. different
	// add range .. same ... more ... less
	// same
	// right
	// left
	var addSort = function(set, value){
		set.sort = value;
	};

	var sort = {
		left: function(setA, setB) {
			addSort(setA, "prop");
		},
		right: function(setA, setB) {
			addSort(setB, "prop");
		},
		same: function(setA, setB) {
			addSort(setA, "prop");
			addSort(setB, "prop");
		},
		different: function(setA, setB) {
			addSort(setA, "propA");
			addSort(setB, "propB");
		}
	};
	var addRange = function(set, start, end) {
		set.start = start;
		set.end = end;
	};

	var range = {
		left: function(setA,setB){
			addRange(setA, 0,9);
		},
		right: function(setA,setB){
			addRange(setB, 0,9);
		},
		same: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 0,9);
		},
		superLeft: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 3,7);
		},
		superRight: function(setA,setB){
			addRange(setB, 0,9);
			addRange(setA, 3,7);
		}
	};

	var sets = {
		same: function(setA, setB){ },
		superLeft: function(setA, setB){
			setB.type = "apples";
		},
		superRight: function(setA, setB){
			setA.type = "apples";
		}
	};


	var make = function(){
		var setA = {},
			setB = {};
		each(arguments, function(method){
			method(setA, setB);
		});
		return {left: setA, right: setB};
	};
	var assertSubset = function(methods, result){
		var sets = make.apply(null, methods);
		equal( algebra.subset(sets.left, sets.right), result, JSON.stringify(sets.left)+" ⊂ "+JSON.stringify(sets.right)+" = "+result );
	};

	assertSubset([sets.superRight, range.right, sort.right], false);
	assertSubset([sets.same, range.same, sort.different], false);
	assertSubset([sets.same, range.same, sort.same], true);

	assertSubset([sets.same, range.superRight, sort.left], false);
	assertSubset([sets.same, range.superRight, sort.same], true);
});

test('set.subset with range - nested object syntax', function(){
	var algebra = new set.Algebra(props.sort('sort'),props.rangeInclusive('start','end'));

	// add sort .. same .. different
	// add range .. same ... more ... less
	// same
	// right
	// left
	var addSort = function(set, value){
		set.sort = value;
	};

	var sort = {
		left: function(setA, setB) {
			addSort(setA, {prop: 1});
		},
		right: function(setA, setB) {
			addSort(setB, {prop: 1});
		},
		same: function(setA, setB) {
			addSort(setA, {prop: 1});
			addSort(setB, {prop: 1});
		},
		different: function(setA, setB) {
			addSort(setA, {propA: 1});
			addSort(setB, {propB: 1});
		}
	};
	var addRange = function(set, start, end) {
		set.start = start;
		set.end = end;
	};

	var range = {
		left: function(setA,setB){
			addRange(setA, 0,9);
		},
		right: function(setA,setB){
			addRange(setB, 0,9);
		},
		same: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 0,9);
		},
		superLeft: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 3,7);
		},
		superRight: function(setA,setB){
			addRange(setB, 0,9);
			addRange(setA, 3,7);
		}
	};

	var sets = {
		same: function(setA, setB){ },
		superLeft: function(setA, setB){
			setB.type = "apples";
		},
		superRight: function(setA, setB){
			setA.type = "apples";
		}
	};


	var make = function(){
		var setA = {},
			setB = {};
		each(arguments, function(method){
			method(setA, setB);
		});
		return {left: setA, right: setB};
	};
	var assertSubset = function(methods, result){
		var sets = make.apply(null, methods);
		equal( algebra.subset(sets.left, sets.right), result, JSON.stringify(sets.left)+" ⊂ "+JSON.stringify(sets.right)+" = "+result );
	};

	assertSubset([sets.superRight, range.right, sort.right], false);
	assertSubset([sets.same, range.same, sort.different], false);
	assertSubset([sets.same, range.same, sort.same], true);

	assertSubset([sets.same, range.superRight, sort.left], false);
	assertSubset([sets.same, range.superRight, sort.same], true);
});

test("set.index", function(){
	var algebra = new set.Algebra(props.sort('sort'));

	var index = algebra.index(
		{sort: "name"},
		[{id: 1, name:"g"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"s"}],
		{name: "k"});
	equal(index, 2);
});

test("set.index - nested object syntax", function(){
	var algebra = new set.Algebra(props.sort('sort'));

	var index = algebra.index(
		{sort: {name: 1}},
		[{id: 1, name:"g"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"s"}],
		{name: "k"});
	equal(index, 2, 'Support MongoDB sorting syntax.');
});

test("set.getSubset (#14)", function(){
	var algebra = new set.Algebra(props.sort('sort'));
	var subset = algebra.getSubset({sort: "name"},{},[{id: 1, name:"s"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"g"}]);
	deepEqual(subset, [ {id: 4, name:"g"},{id: 2, name:"j"}, {id: 3, name:"m"},{id: 1, name:"s"}]);
});

test("set.getSubset (#14) - nested object syntax", function(){
	var algebra = new set.Algebra(props.sort('sort'));
	var subset = algebra.getSubset({sort: {name: 1}},{},[{id: 1, name:"s"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"g"}]);
	deepEqual(subset, [ {id: 4, name:"g"},{id: 2, name:"j"}, {id: 3, name:"m"},{id: 1, name:"s"}]);
});

test("set.getUnion", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	// a,b,aItems, bItems
	var union = algebra.getUnion(
		{sort: "name", complete: true},
		{sort: "name", complete: false},
		[{id: 4, name:"g", complete: true}, {id: 3, name:"m", complete: true}],
		[{id: 2, name:"j", complete: false},{id: 1, name:"s", complete: false} ]);

	deepEqual(union, [
		{id: 4, name:"g", complete: true},
		{id: 2, name:"j", complete: false},
		{id: 3, name:"m", complete: true},
		{id: 1, name:"s",complete: false}]);
});

test("set.getUnion - nested object syntax", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	// a,b,aItems, bItems
	var union = algebra.getUnion(
		{sort: {name: 1}, complete: true},
		{sort: {name: 1}, complete: false},
		[{id: 4, name:"g", complete: true}, {id: 3, name:"m", complete: true}],
		[{id: 2, name:"j", complete: false},{id: 1, name:"s", complete: false} ]);

	deepEqual(union, [
		{id: 4, name:"g", complete: true},
		{id: 2, name:"j", complete: false},
		{id: 3, name:"m", complete: true},
		{id: 1, name:"s",complete: false}]);
});

test("set.union keeps sort", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	var union = algebra.union(
		{sort: "name", complete: true},
		{sort: "name", complete: false});

	deepEqual(union, {sort: "name"});
});

test("set.union keeps sort - nested object syntax", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	var union = algebra.union(
		{sort: {name: 1}, complete: true},
		{sort: {name: 1}, complete: false});

	deepEqual(union, {sort: {name: 1}});
});

test("paginated and sorted is subset (#17)", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.rangeInclusive('start','end')
	);

	var res = algebra.subset({start: 0, end: 100, sort: "name"},{start: 0, end: 100, sort: "name"});
	equal(res, true, "parent:paginate+order child:paginate+order (same set)");

	res = algebra.subset({start: 0, end: 100, sort: "name"},{start: 0, end: 100, sort: "age"});
	equal(res, false, "parent:paginate+order child:paginate+order (different order)");

	// REMOVE FROM THE parent
	// parent:order
	res = algebra.subset({start: 0, end: 100, sort: "name"},{sort: "name"});
	equal(res, true, "parent:order child:paginate+order");

	res = algebra.subset({sort: "name"},{sort: "name"});
	equal(res, true, "parent:order child:order (same)");
	res = algebra.subset({sort: "name"},{sort: "age"});
	equal(res, true, "parent:order child:order (different)");

	res = algebra.subset({start: 0, end: 100},{sort: "name"});
	equal(res, true, "parent:order child:paginate");

	res = algebra.subset({start: 0, end: 100, sort: "age"},{sort: "name"});
	equal(res, true, "parent:order child:paginate+order");

	// parent:paginate
	res = algebra.subset({start: 0, end: 100, sort: "name"},{start: 0, end: 100});
	equal(res, false, "parent:paginate child:paginate+order");

	res = algebra.subset({sort: "name"},{start: 0, end: 100});
	equal(res, false, "parent:paginate child:order (same)");


	res = algebra.subset({start: 0, end: 100, sort: "name"},{});
	equal(res, true, "parent:-- child:paginate+order");



	res = algebra.subset({start: 10, end: 90, sort: "name"},{start: 0, end: 100, sort: "name"});
	equal(res, true, "child in smaller range, same sort");

	res = algebra.subset({start: 10, end: 90, sort: "name"},{start: 0, end: 100, sort: "age"});
	equal(res, false, "child in smaller range, but different sort");
});

test("paginated and sorted is subset (#17) - nested object syntax", function(){
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.rangeInclusive('start','end')
	);

	var res = algebra.subset({start: 0, end: 100, sort: {name: 1}},{start: 0, end: 100, sort: {name: 1}});
	equal(res, true, "parent:paginate+order child:paginate+order (same set)");

	res = algebra.subset({start: 0, end: 100, sort: {name: 1}},{start: 0, end: 100, sort: {age: 1}});
	equal(res, false, "parent:paginate+order child:paginate+order (different order)");

	// REMOVE FROM THE parent
	// parent:order
	res = algebra.subset({start: 0, end: 100, sort: {name: 1}},{sort: {name: 1}});
	equal(res, true, "parent:order child:paginate+order");

	res = algebra.subset({sort: {name: 1}},{sort: {name: 1}});
	equal(res, true, "parent:order child:order (same)");
	res = algebra.subset({sort: {name: 1}},{sort: {age: 1}});
	equal(res, true, "parent:order child:order (different)");

	res = algebra.subset({start: 0, end: 100},{sort: {name: 1}});
	equal(res, true, "parent:order child:paginate");

	res = algebra.subset({start: 0, end: 100, sort: {age: 1}},{sort: {name: 1}});
	equal(res, true, "parent:order child:paginate+order");

	// parent:paginate
	res = algebra.subset({start: 0, end: 100, sort: {name: 1}},{start: 0, end: 100});
	equal(res, false, "parent:paginate child:paginate+order");

	res = algebra.subset({sort: {name: 1}},{start: 0, end: 100});
	equal(res, false, "parent:paginate child:order (same)");


	res = algebra.subset({start: 0, end: 100, sort: {name: 1}},{});
	equal(res, true, "parent:-- child:paginate+order");



	res = algebra.subset({start: 10, end: 90, sort: {name: 1}},{start: 0, end: 100, sort: {name: 1}});
	equal(res, true, "child in smaller range, same sort");

	res = algebra.subset({start: 10, end: 90, sort: {name: 1}},{start: 0, end: 100, sort: {age: 1}});
	equal(res, false, "child in smaller range, but different sort");
});
