require("steal-qunit");

var set = require('./set');

QUnit.module("can-set");

test('set.Algebra constructors', function(){
	var algebra = new set.Algebra(
		set.props.rangeInclusive("start", "end"),
		set.props.boolean('completed'),
		set.props["enum"]('type',['new','prep','deliver','delivered'])
	);

	var res = algebra.subset({ type: ['new'] },{type: ['new','prep']});
	deepEqual(res, true, "enum");
});

test('set.clause', function(){
	QUnit.ok(set.clause);
});
