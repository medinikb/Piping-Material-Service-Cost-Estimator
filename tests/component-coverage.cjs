// Component recognition checks; run with: node tests/component-coverage.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const element = {value: "", dataset: {}, querySelectorAll: () => []};
const context = vm.createContext({console, window: {}, document: {
  querySelector: () => element, querySelectorAll: () => [],
}});
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
assert.ok(source.includes("\npopulateSizeOptions();"));
vm.runInContext(source.split("\npopulateSizeOptions();")[0], context);
const run = (code) => vm.runInContext(code, context);
const fixtures = [
  ["Mitre", "Fitting Group", "Mitre", true],
  ["Mitered Bend", "Fitting Group", "Mitre", true],
  ["Mitre Elbow", "Fitting Group", "Mitre", true],
  ["Cross", "Fitting Group", "Cross", true],
  ["Reducing Cross", "Fitting Group", "Cross", true],
  ["Stub End", "Fitting Group", "Stub End", true],
  ["Lap Joint Stub End", "Fitting Group", "Stub End", true],
  ["Nut", "Bolt Group", "Nut", true],
  ["Heavy Hex Nut M30", "Bolt Group", "Nut", true],
  ["SPCR & BLN", "Flange Group", "Spacer and Blind Set", true],
  ["Spacer and Blind Set", "Flange Group", "Spacer and Blind Set", true],
  ["Needle Valve", "Valves Group", "Needle Valve", true],
  ["Angle Valve", "Valves Group", "Angle Valve", true],
  ["Angle Globe Valve", "Valves Group", "Angle Valve", true],
  ["Diaphragm Valve", "Valves Group", "Diaphragm Valve", true],
  ["Three Way Valve", "Valves Group", "Three Way Valve", true],
  ["3-Way Valve", "Valves Group", "Three Way Valve", true],
  ["Fitting", "Fitting Group", "Unspecified Fitting", true],
  ["CPLNG.LH", "Fitting Group", "Left Hand Coupling", true],
  ["S.W. Flange", "Flange Group", "Socket Weld Flange", false],
  ["S.O. Flange", "Flange Group", "Slip-On Flange", false],
  ["W.N. Flange", "Flange Group", "Weld Neck Flange", false],
  ["FLNG.FIG.8", "Flange Group", "Figure 8 Flange", false],
  ["Stud with Nuts", "Bolt Group", "Stud with Nuts", false],
  ["Stud with Nuts (Auto from Flange)", "Bolt Group", "Stud with Nuts", false],
  ["Stud + Nuts", "Bolt Group", "Stud with Nuts", false],
  ["Machine Bolt with Nut", "Bolt Group", "Bolt", false],
  ["Machine Bolt", "Bolt Group", "Bolt", false],
  ["Elbow 45 deg.", "Fitting Group", "45 Degree Elbow", false],
  ["Elbow 90 deg.", "Fitting Group", "90 Degree Elbow", false],
  ["Red. Tee", "Fitting Group", "Reducing Tee", false],
  ["Equal Tee", "Fitting Group", "Equal Tee", false],
  ["SWAGE.CONC", "Fitting Group", "Concentric Swage", false],
  ["SWAGE.ECC", "Fitting Group", "Eccentric Swage", false],
  ["CPLNG.FULL", "Fitting Group", "Full Coupling", false],
  ["CPLNG.HALF", "Fitting Group", "Half Coupling", false],
  ["CPLNG.RED", "Fitting Group", "Reducing Coupling", false],
  ["Ecc. Reducer", "Fitting Group", "Eccentric Reducer", false],
  ["Gate Valve", "Valves Group", "Gate Valve", false],
];
for (const [name, group, component, quotation] of fixtures) {
  context.name = name;
  const classified = run("classifyBomGroup(name)");
  assert.equal(classified.group, group, name);
  context.group = group;
  context.standardName = classified.standardName;
  const result = run("getComponentFactorMatch(group, name, standardName)");
  assert.equal(result.component, component, name);
  assert.equal(Boolean(result.requiresReview), quotation, name);
  if (quotation) {
    assert.equal(result.autoCostAllowed, false, name);
    assert.equal(result.factor, 0, name);
    assert.ok(result.reviewReason.length > 0, name);
  } else {
    assert.equal(result.autoCostAllowed, true, name);
    assert.ok(result.factor > 0, name);
  }
}
for (const name of ["Unknown Vendor Assembly", "Experimental Valve", "Prototype Flange", "Nutmeg Assembly"]) {
  context.name = name;
  const result = run("(() => {const x = classifyBomGroup(name); return getComponentFactorMatch(x.group, name, x.standardName);})()");
  assert.equal(result.autoCostAllowed, false, name);
  assert.equal(result.factor, 0, name);
}
console.log(`${fixtures.length + 4} component recognition and review-route cases passed.`);
