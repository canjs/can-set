require("steal-qunit");

var set = require('./set-core');

test('set.difference({ function })', function() {
	var res = set.difference({ colors: ['red'] }, { colors: ['blue'] }, {
		colors: function() {
			return {
				// can’t always be privided … but COULD if we were gods
				diff: ['blue' ],
				intersection: ['red']
			};
		}
	});

	deepEqual(res, { colors: [ 'blue' ] });
});

test('set.difference(set.boolean)', function() {
	var comparator = set.boolean('completed');
	var res = set.difference({} , { completed: true }, comparator);
	deepEqual(res, { completed: false });

	res = set.difference({}, { completed: false }, comparator);
	deepEqual(res, { completed: true });

	res = set.difference({ completed: true }, { completed: true });
	equal(res, null);

	res = set.difference({ completed: true }, {});
	equal(res, null);

	res = set.difference({ completed: true }, { foo: 'bar' });
	equal(res, undefined);
});

test('set.difference(set.property)', function() {
	var comparator = set.property('name');
	var res = set.difference({ name: 'david' }, { name: 'David' }, comparator);
	equal(res, null);

	res = set.difference({ name: 'david' }, {}, comparator);
	equal(res, null);

	res = set.difference({ name: 'david' }, { foo: 'bar' }, comparator);
	equal(res, undefined);
});

test('set.difference(set.range)', function() {
	var comparator = set.range('start', 'end');
	var res = set.difference({ start: 0, end: 99 }, { start: 50, end: 101 }, comparator);

	deepEqual(res, { start: 100, end: 101 });

	res = set.difference({}, { start: 0, end: 10 }, comparator);
	deepEqual(res, null);
});
