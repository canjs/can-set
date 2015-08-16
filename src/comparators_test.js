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
	
	res = set.difference({ start: 0, end: 49 }, { start: 50, end: 101 }, comparator);
	deepEqual(res, { start: 0, end: 49 }, "side by side");
	
	res = set.difference({ start: 0, end: 49 }, { start: 0, end: 20 }, comparator);
	deepEqual(res, { start: 21, end: 49 }, "side by side");
	
	
	res = set.difference({ start: 0, end: 49 }, { start: 20, end: 49 }, comparator);
	deepEqual(res, { start: 0, end: 19 }, "side by side");
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

test('boolean set.intersection', function(){
	var comparator = comparators.boolean('completed');
	var res = set.intersection({foo: "bar"} , { completed: true }, comparator);
	equal(res, false, "intersection is false (#4)");
});


test('enum set.intersection', function(){
	var comparator = comparators.enum('type',['new','prep','deliver','delivered']);
	
	var res = set.intersection({} , { type: 'new' }, comparator);
	deepEqual(res, {type: 'new' }, "all");
	
	res = set.intersection({} , { type: ['new','prep'] }, comparator);
	deepEqual(res, {type: ['new','prep'] }, "all v array intersection");
	
	res = set.intersection({type: ['prep'] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, {type: 'prep' }, "items v items intersection");
	
	res = set.intersection({type: [] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, {type: ['new','prep'] }, "empty v array intersection");
	
	res = set.intersection({ type: 'new' },{}, comparator);
	deepEqual(res, {type: 'new' }, "single v all");
});

test('enum set.difference', function(){
	var comparator = comparators.enum('type',['new','prep','deliver','delivered']);
	
	var res = set.difference({} , { type: 'new' }, comparator);
	deepEqual(res, {type: ['prep','deliver','delivered'] }, "all");
	
	res = set.difference({} , { type: ['new','prep'] }, comparator);
	deepEqual(res, {type: ['deliver','delivered'] }, "intersection");
	
	res = set.difference({type: ['prep'] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, false, "intersection");
	
	res = set.difference({type: [] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, {type: ['deliver','delivered'] }, "intersection");
	
	res = set.difference({ type: 'new' },{}, comparator);
	deepEqual(res, false, "all");
});

test('enum set.union', function(){
	var comparator = comparators.enum('type',['new','prep','deliver','delivered']);
	
	var res = set.union({} , { type: 'new' }, comparator);
	deepEqual(res, {}, "all");
	
	res = set.union({} , { type: ['new','prep'] }, comparator);
	deepEqual(res, {}, "intersection");
	
	res = set.union({type: ['prep'] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, { type: ['prep','new'] }, "intersection");
	
	res = set.union({type: [] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, { }, "intersection");
	
	res = set.union({ type: 'new' },{}, comparator);
	deepEqual(res, {}, "all");
	
	res = set.union({type: ['deliver','delivered'] } , { type: ['new','prep'] }, comparator);
	deepEqual(res, {}, "intersection");
});


test('enum set.equal', function(){
	
	var comparator = comparators.enum('type',['new','prep','deliver','delivered']);
	
	var res = set.equal({} , { type: 'new' }, comparator);
	deepEqual(res, false, "all");
	
	res = set.equal({} , { type: ['new','prep','deliver','delivered'] }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.equal({type: ['prep'] } , { type: ['prep'] }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.equal({type: 'prep'} , { type: 'prep' }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.equal({ type: 'new' },{type: 'prep'}, comparator);
	deepEqual(res, false, "all");
	
});

test('enum set.subset', function(){
	
	var comparator = comparators.enum('type',['new','prep','deliver','delivered']);
	
	var res = set.subset({} , { type: 'new' }, comparator);
	deepEqual(res, false, "all");
	
	res = set.subset({ type: 'new' }, {} , comparator);
	deepEqual(res, true, "all");
	
	res = set.subset({} , { type: ['new','prep','deliver','delivered'] }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.subset({type: ['prep'] } , { type: ['prep'] }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.subset({type: 'prep'} , { type: 'prep' }, comparator);
	deepEqual(res, true, "intersection");
	
	res = set.subset({ type: 'new' },{type: 'prep'}, comparator);
	deepEqual(res, false, "all");
	
	res = set.subset({type: 'prep'} , { type: ['new','prep','deliver','delivered'] }, comparator);
	deepEqual(res, true, "intersection");
});


