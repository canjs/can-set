var QUnit = require("steal-qunit");

var set = require('src/set-core'),
	comparators = require("src/comparators");

QUnit.module("comparators.sort");

test('set.difference', function(){
	var comparator = comparators.sort('sort');

	var res = set.difference({sort: "foo"}, { completed: true }, comparator);
	ok(res === true, "diff should be true");

	res = set.difference({ completed: true }, { completed: true, sort: "foo" }, comparator);
	equal(res, false, "the same except for sort");

	res = set.difference({ completed: true }, { sort: "foo"}, comparator);
	equal(res, false);

	res = set.difference({ completed: true }, { foo: 'bar', sort: "foo" }, comparator);
	equal(res, false);
});

test('set.difference({ function })', function() {
	var comparator = comparators.sort('sort');

	comparator.colors = function() {
		return {
			difference: ['red' ],
			intersection: ['blue']
		};
	};

	var res = set.difference({ colors: ['red','blue'], sort: 'colors' },
		{ colors: ['blue'] }, comparator);

	deepEqual(res, { colors: [ 'red' ] });
});

test('set.union', function(){
	var comparator = comparators.sort('sort');
	// set / subset
	var res = set.union({sort: "name"}, { completed: true }, comparator);
	deepEqual(res , {}, "set / subset sort left");

	res = set.union({}, { completed: true, sort: "name" }, comparator);
	deepEqual(res , {}, "set / subset sort right");

	res = set.union({ sort: "name" }, { completed: true, sort: "namer" }, comparator);
	deepEqual(res , {}, "set / subset both sorts");

	res = set.union({ completed: true }, {sort: "foo"}, comparator);
	deepEqual(res , {}, "subset / set");

	res = set.union({foo: "bar", sort: "foo"},{foo: "bar"}, comparator);
	deepEqual(res, {foo: "bar"}, "equal");

	res = set.union({foo: "bar"},{foo: "zed", sort: "foo"}, comparator);
	ok(!res, "values not equal");

	var res = set.union({foo: "bar", sort: "foo"},{name: "A"}, comparator);
	ok(!res, "values not equal");
});

test('set.union Array', function(){
	var comparator = comparators.sort('sort');
	var res = set.union({foo: ["a","b"], sort: "foo"}, { foo: ["a","c"] },
		comparator);

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

test('set.intersection', function(){

	var comparator = comparators.sort('sort');

	var res = set.intersection({} , { sort: 'name' }, comparator);
	deepEqual(res, {}, "");

	var res = set.intersection({ sort: 'name' } , { sort: 'name' }, comparator);
	deepEqual(res, {}, "");

	res = set.intersection({type: 'new'} , { sort: 'name', userId: 5 }, comparator);
	deepEqual(res, {type: 'new', userId: 5 }, "");

	res = set.intersection({type: 'new', sort: "age"} , { sort: 'name', userId: 5 }, comparator);
	deepEqual(res, {type: 'new', userId: 5 }, "");
});

test('set.intersection Array', function(){
	var comparator = comparators.sort('sort');
	var res = set.intersection({foo: ["a","b"], sort: 'foo'},
		{ foo: ["a","c"] }, comparator);

	deepEqual(res , {foo: ["a"]}, "intersection");
});
