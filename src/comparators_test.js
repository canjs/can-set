var QUnit = require("steal-qunit");

var set = require('./set-core'),
	comparators = require("./comparators");
	
QUnit.module("comparators");

test('rangeInclusive set.equal', function(){
	
	ok( 
		set.equal( 
			{start: 0, end: 100},
			{start: 0, end: 100},
			comparators.rangeInclusive("start", "end")),
		"they are equal" );
		
	ok( 
		!set.equal( 
			{start: 0, end: 100},
			{start: 0, end: 101},
			comparators.rangeInclusive("start", "end")),
		"they are not equal" );	
	
	ok( 
		!set.equal( 
			{start: 0, end: 100},
			{start: 1, end: 100},
			comparators.rangeInclusive("start", "end")),
		"they are not equal" );	
});

test('rangeInclusive set.subset', function(){
	
	ok( 
		set.subset( 
			{start: 0, end: 100},
			{start: 0, end: 100},
			comparators.rangeInclusive("start", "end")),
		"self is a subset" );

	ok( 
		set.subset( 
			{start: 0, end: 100},
			{start: 0, end: 101},
			comparators.rangeInclusive("start", "end")),
		"end extends past subset" );	

	ok( 
		set.subset( 
			{start: 1, end: 100},
			{start: 0, end: 100},
			comparators.rangeInclusive("start", "end")),
		"start extends before subset" );	
});


test('rangeInclusive set.difference', function() {
	var comparator = comparators.rangeInclusive('start', 'end');
	var res = set.difference({ start: 0, end: 99 }, { start: 50, end: 101 }, comparator);
	deepEqual(res, { start: 0, end: 49 }, "got a diff");
	
	res = set.difference({}, { start: 0, end: 10 }, comparator);
	equal(res, true);
	
	// difference side by side
	
	comparator = comparators.rangeInclusive('start', 'end');
	res = set.difference({ start: 0, end: 49 }, { start: 50, end: 101 }, comparator);
	deepEqual(res, { start: 0, end: 49 }, "side by side");
});

test('rangeInclusive set.union', function() {
	var comparator = comparators.rangeInclusive('start', 'end');
	var res = set.union({ start: 0, end: 99 }, { start: 50, end: 101 }, comparator);
	deepEqual(res, { start: 0, end: 101 }, "got a union");
	
	res = set.union({}, { start: 0, end: 10 }, comparator);
	deepEqual(res, {}, "union has everything");
	
	res = set.union({start: 100, end: 199}, {start: 200, end: 299}, comparator);
	deepEqual(res, {start:100, end:299}, "default compare works");
	
	res = set.union({start: 200, end: 299}, {start: 100, end: 199}, comparator);
	deepEqual(res, {start:100, end:299}, "default compare works");
	
	res = set.union({start: 200, end: 299}, {start: 100, end: 209}, comparator);
	deepEqual(res, {start:100, end:299}, "default compare works");
	
	res = set.union({start: 100, end: 299}, {start: 103, end: 209}, comparator);
	deepEqual(res, {start:100, end:299}, "default compare works");
	
	res = set.union({start: 100, end: 299}, {start: 100, end: 299}, comparator);
	deepEqual(res, {start:100, end:299}, "default compare works");
});



test('rangeInclusive set.count', function(){
	var comparator = comparators.rangeInclusive('start', 'end');
	var res = set.count({ start: 0, end: 99 }, comparator);
	equal(res, 100, "count is right");
});

test('rangeInclusive set.intersection', function(){
	var comparator = comparators.rangeInclusive('start', 'end');
	var res = set.intersection({ start: 0, end: 99 }, { start: 50, end: 101 }, comparator);
	deepEqual(res, { start: 50, end: 99 }, "got a intersection");
});



test('boolean set.difference', function() {
	var comparator = comparators.boolean('completed');
	
	var res = set.difference({} , { completed: true }, comparator);
	deepEqual(res, { completed: false }, "inverse to false");

	res = set.difference({}, { completed: false }, comparator);
	deepEqual(res, { completed: true }, "inverse to true");
});


test('boolean set.union', function(){
	var comparator = comparators.boolean('completed');
	var res = set.union({completed: false} , { completed: true }, comparator);
	deepEqual(res, { }, "union has everything");
});


