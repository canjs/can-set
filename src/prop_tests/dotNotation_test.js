var QUnit = require("steal-qunit");

var set = require('../set-core'),
  props = require("../props");

QUnit.module("can-set props.boolean");

/*
 * For the dotNotation prop, we define sets like so:
 *
 * For a property 'n.p', with value 'IL'
 * x ∈ X | x.n.p = 'IL'
 *
 */
test('dotNotation set membership', function() {
  /*
   * For a property 'n.p', with value 'IL'
   * x ∈ X | x.n.p == 'IL'
   */
  var prop = props.dotNotation('n.p'),
      alg = new set.Algebra(prop),
      res = alg.has({'n.p': 'IL'}, {n:{p:'IL'}});
  ok(res, "object with nested property is member of set using dotNotation");

  /*
   * For a property 'n.p', with value 'IL'
   * x ∉ X | x.n.p != 'IL'
   */
  res = alg.has({'n.p': 'IL'}, {n:{p:'MI'}});
  ok(res === false, "object with nested property not a member of set using dotNotation");
});