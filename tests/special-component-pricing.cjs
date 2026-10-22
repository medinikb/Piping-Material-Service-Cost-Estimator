const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const policy = require("../special-component-pricing.js");
const classify = (changes = {}) => policy.classifySpecialComponentPricing({
  group: "Bolt Group", item: "Stud with Nuts", materialText: "ASTM A193 B7 / ASTM A194 2H", sizeText: "M24 x 145", ...changes,
});
let checks = 0;
for (const materialText of ["ASTM A193 B7 / ASTM A194 2H", "A193 GR.B7 / A194 GR.2H", "A193 GR. B7 / A194 GR. 2H"]) {
  const result = classify({materialText});
  assert.equal(result.route, "metric-stud-set");
  assert.equal(result.calculationAllowed, true);
  assert.equal(result.requiresConfirmedRawRate, false);
  assert.equal(result.requiresAvailableRawRate, true);
  assert.equal(result.geometry.diameterMm, 24);
  checks++;
}
for (const sizeText of ["M24 x 145", "M 24 X 145 mm", "M30 \u00d7 200", "M24x145.5"]) {
  assert.equal(classify({sizeText}).route, "metric-stud-set"); checks++;
}
for (const sizeText of ["", "4 IN", "3/4 x 145 mm", "M24", "M24 x 0", "M0 x 145", "M24 x -1", "M24 x Infinity", "M24 x 145 x 160", "M24 x 145 IN"]) {
  assert.equal(classify({sizeText}).route, "review", sizeText); checks++;
}
for (const materialText of ["A307 GR.B", "A193 B7", "B7 / 2H", "A193 B70 / A194 2H", "A193 B7 / A194 2HM", "A193 B7 / A194 2H GALV.", "ASTM A105", ""]) {
  assert.equal(classify({materialText}).route, "review", materialText); checks++;
}
for (const item of ["Machine Bolt", "Machine Bolt with Nut", "Washer", "Stud with Nuts and Washers", "Lock Nut"]) {
  assert.equal(classify({item}).route, "review", item); checks++;
}
for (const item of ["Stud", "Stud Bolt"]) {
  assert.equal(classify({item, materialText:"A193 B7"}).route, "metric-stud"); checks++;
}
assert.equal(classify({item:"Nut", sizeText:"M24",materialText:"A194 2H"}).route,"metric-nut"); checks++;
for (const [item, count] of [["Stud with Nut",1],["Stud with one Nut Set",1],["Stud with 3 Nuts",3],["Stud with Nuts",2]]) {
  assert.equal(classify({item}).numberOfNuts,count); checks++;
}
for (const materialText of ["SS304 SPR.WND + CA FIL", "IS-2712-GR.W/3", "SOFT IRON (90 BHN MAX)", "SS316L WITH CA FILLER", "BUTYL RUBBER"]) {
  const result = classify({group:"Gasket Group",item:"Gasket",materialText,sizeText:"6 IN"});
  assert.equal(result.route, "review");
  assert.match(result.reason, /supported calculation model/);
  checks++;
}
for (const materialText of ["ASTM D3035 GR.PE3406 CLC", "ASTM D3261 GR.P34 CLC", "ASTM A515 GR.60/HDPE", "A216 WCB RUBBER LINED", "PTFE", "B: A216 GRWCB (RUB.LON"]) {
  assert.equal(classify({group:"Pipe Group",item:"Pipe",materialText,sizeText:"6 IN"}).route, "review"); checks++;
}
assert.equal(classify({group:"Pipe Group",item:"Pipe",materialText:"ASTM A106 Gr.B"}).route, "standard"); checks++;
assert.equal(policy.classifySpecialComponentPricing(null).route, "standard"); checks++;
const browser = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,"../special-component-pricing.js"),"utf8"), browser);
assert.equal(typeof browser.SpecialComponentPricing.classifySpecialComponentPricing, "function"); checks++;
// The policy does not change old source files. Audit that every PMS bolt/gasket
// description gets a defined review route with its original source size ranges.
const folder = path.join(__dirname,"../Old NRL PMS/data");
let audited = 0;
for (const file of fs.readdirSync(folder).filter(name=>name.endsWith(".json"))) {
  const rows = JSON.parse(fs.readFileSync(path.join(folder,file))).items;
  for (const row of rows.filter(row=>/^(Bolting|Gaskets?)$/.test(row.group))) {
    const result = policy.classifySpecialComponentPricing({group:row.group,item:row.item,materialText:row.material,sizeText:String(row.lowSize)});
    assert.equal(result.requiresReview, true);
    audited++;
  }
}
console.log(`${checks} special component policy checks passed; ${audited} PMS bolting/gasket rows marked Review until actual geometry and approved calculation/rate rules are supplied.`);
