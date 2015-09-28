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
	equal(res, false);
	
	res = set.difference({ completed: true }, { sort: "foo"}, comparator);
	equal(res, false);

	res = set.difference({ completed: true }, { foo: 'bar', sort: "foo" }, comparator);
	equal(res, false);
		
});
