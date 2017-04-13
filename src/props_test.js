var QUnit = require("steal-qunit");

QUnit.module("can-set props");

require('./prop_tests/sort_test');
require('./prop_tests/rangeInclusive_test');
require('./prop_tests/offsetLimit_test');
require('./prop_tests/boolean_test');
require('./prop_tests/enum_test');
require('./prop_tests/dotNotation_test');
