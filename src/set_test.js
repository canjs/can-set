require("steal-qunit");

var set = require('./set-core');

var ignoreProp = function(){ return true; };

QUnit.module("set core");

test('set.equal', function(){
	
	ok(set.equal({
		type: 'FOLDER'
	}, {
		type: 'FOLDER',
		count: 5
	}, {
		count: ignoreProp
	}), 'count ignored');

	ok(set.equal({
		type: 'folder'
	}, {
		type: 'FOLDER'
	}, {
		type: function (a, b) {
			return ('' + a)
					.toLowerCase() === ('' + b)
					.toLowerCase();
		}
	}), 'folder case ignored');

	// Issue #773
	ok(!set.equal(
		{foo: null},
		{foo: new Date()}
	), 'nulls and Dates are not considered the same. (#773)');

	ok(!set.equal(
		{foo: null},
		{foo: {}}
	), 'nulls and empty objects are not considered the same. (#773)');
	
});


test('set.subset', function(){
	
	ok(set.subset({
		type: 'FOLDER'
	}, {
		type: 'FOLDER'
	}), 'equal sets');
	
	ok(set.subset({
		type: 'FOLDER',
		parentId: 5
	}, {
		type: 'FOLDER'
	}), 'sub set');

	
	ok(!set.subset({
		type: 'FOLDER'
	}, {
		type: 'FOLDER',
		parentId: 5
	}), 'wrong way');
	
	
	ok(!set.subset({
		type: 'FOLDER',
		parentId: 7
	}, {
		type: 'FOLDER',
		parentId: 5
	}), 'different values');
	
	
	ok(set.subset({
		type: 'FOLDER',
		count: 5
	}, {
		type: 'FOLDER'
	}, {
		count: ignoreProp
	}), 'count ignored');
	
	
	ok(set.subset({
		type: 'FOLDER',
		kind: 'tree'
	}, {
		type: 'FOLDER',
		foo: true,
		bar: true
	}, {
		foo: ignoreProp,
		bar: ignoreProp
	}), 'understands a subset');
	
	ok(set.subset({
		type: 'FOLDER',
		foo: true,
		bar: true
	}, {
		type: 'FOLDER',
		kind: 'tree'
	}, {
		foo: ignoreProp,
		bar: ignoreProp,
		kind: ignoreProp
	}), 'ignores nulls');

});


test('set.difference', function(){
	
	var res = set.difference({}, { completed: true });
	ok(res === true, "diff should be true");
	

	res = set.difference({ completed: true }, { completed: true });
	equal(res, false);
	
	res = set.difference({ completed: true }, {});
	equal(res, false);

	res = set.difference({ completed: true }, { foo: 'bar' });
	equal(res, false);
	
	
});

test('set.difference({ function })', function() {
	var res = set.difference({ colors: ['red','blue'] }, { colors: ['blue'] }, {
		colors: function() {
			return {
				// can’t always be privided … but COULD if we were gods
				difference: ['red' ],
				intersection: ['blue']
			};
		}
	});

	deepEqual(res, { colors: [ 'red' ] });
});

test('set.union', function(){
	
	// set / subset
	var res = set.union({}, { completed: true });
	deepEqual(res , {}, "set / subset");
	
	res = set.union({ completed: true }, {});
	deepEqual(res , {}, "subset / set");
	
	res = set.union({foo: "bar"},{foo: "bar"});
	deepEqual(res, {foo: "bar"}, "equal");
	
	res = set.union({foo: "bar"},{foo: "zed"});
	ok(!res, "values not equal");
	
});

/*
test('set.union({ function })', function() {
	var res = set.difference({ colors: ['red','blue'] }, { colors: ['blue'] }, {
		colors: function() {
			return {
				// can’t always be privided … but COULD if we were gods
				difference: ['red' ],
				intersection: ['blue']
			};
		}
	});

	deepEqual(res, { colors: [ 'red' ] });
});*/
