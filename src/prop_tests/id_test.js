var QUnit = require("steal-qunit");

var set = require("../set-core"),
  props = require("../props");

QUnit.module("can-set props.id");

test("id set.difference", function(){

  var idProps = props.id("color")

  res = set.difference({ color: "red" }, { color: "blue" }, idProps);
  deepEqual(res, false, "id changes always false");

  res = set.difference({ color: "red" }, { }, idProps);
  deepEqual(res, false, "id removal always false");

  res = set.difference({ }, { color: "blue" }, idProps);
  deepEqual(res, true, "id addition always true");

});

test("id set.difference with where", function() {
  var algebra = new set.Algebra(
    props.id("color"),
    props.enum("type", ["light", "dark"])
  );

  res = set.difference({ color: "red", type: ["light", "dark"] }, { color: "blue", type: "light" }, algebra);
  deepEqual(res, false, "id changes always false");

  res = set.difference({ color: "red", type: ["light", "dark"] }, { type: "light" }, algebra);
  deepEqual(res, false, "id removal always false");

  res = set.difference({ type: ["light", "dark"] }, {  type: "light", color: "blue" }, algebra);
  deepEqual(res, true, "id addition always true");

  res = set.difference({ type: ["light", "dark"] }, {  type: "light" }, algebra);
  deepEqual(res, { type: "dark" }, "no id clause, fall back to where");

  res = set.difference({ color: "red", type: ["light", "dark"] }, { color: "red", type: "light" }, algebra);
  deepEqual(res, { color: "red", type: "dark" }, "no id change, fall back to where");

});