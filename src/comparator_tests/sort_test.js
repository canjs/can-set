var QUnit = require("steal-qunit");

var set = require('src/set-core'),
	comparators = require("src/comparators");

QUnit.module("comparators.sort");	

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


test('set.union', function(){
	var comparator = comparators.sort('sort');
	// set / subset
	var res = set.union({sort: "name"}, { completed: true }, comparator);
	deepEqual(res , {}, "set / subset sort left");
	
	res = set.union({}, { completed: true, sort: "name" }, comparator);
	deepEqual(res , {}, "set / subset sort right");
	
	res = set.union({ sort: "name" }, { completed: true, sort: "namer" }, comparator);
	deepEqual(res , {}, "set / subset both sorts");
	
	res = set.union({ completed: true }, {sort: "foo"});
	deepEqual(res , {}, "subset / set");
	
	res = set.union({foo: "bar", sort: "foo"},{foo: "bar"});
	deepEqual(res, {foo: "bar"}, "equal");
	
	res = set.union({foo: "bar"},{foo: "zed", sort: "foo"});
	ok(!res, "values not equal");
	
	var res = set.union({foo: "bar", sort: "foo"},{name: "A"});
	ok(!res, "values not equal");
});
