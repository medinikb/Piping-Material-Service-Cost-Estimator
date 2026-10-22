// Read-only regression checks for material identity and the resulting budget rate.
// Run from the project folder: node tests/material-matching.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const element = { value: "", dataset: {}, querySelectorAll: () => [] };
const context = vm.createContext({
  console, window: {},
  document: { querySelector: () => element, querySelectorAll: () => [] },
});
// Load the real calculation functions without starting browser event handlers.
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
assert.ok(source.includes("\npopulateSizeOptions();"));
vm.runInContext(fs.readFileSync(path.join(root, "special-component-pricing.js"), "utf8"), context);
vm.runInContext(source.split("\npopulateSizeOptions();")[0], context);
context.materialData = JSON.parse(fs.readFileSync(path.join(root, "astm_piping_material_specification_webapp.json")));
context.priceData = JSON.parse(fs.readFileSync(path.join(root, "raw_material_price_library.json")));
const run = (code) => vm.runInContext(code, context);
// Minimal worksheet storage adapter: the production sheet builder supplies
// all values, status text and formulas. No Excel file is written by this test.
const address = ({r, c}) => {
  let column = "";
  for (let n = c + 1; n > 0; n = Math.floor((n - 1) / 26)) column = String.fromCharCode(65 + (n - 1) % 26) + column;
  return `${column}${r + 1}`;
};
context.XLSX = {utils: {
  encode_cell: address,
  encode_range: ({s, e}) => `${address(s)}:${address(e)}`,
  aoa_to_sheet: (rows) => {
    const sheet = {};
    rows.forEach((row, r) => row.forEach((v, c) => { sheet[address({r, c})] = {v}; }));
    return sheet;
  },
}};
run(`elements.year = {value: "2026"}; elements.rawOverride = {value: "56.5"};
  elements.factorOverride = {value: ""}; elements.coating = {value: "No"};
  elements.spec = {value: "A106 Gr.B"};`);
let checks = 0;
for (const mode of ["loaded", "backup"]) {
  run(mode === "loaded"
    ? "materialSpecificationRows = prepareMaterialSpecificationRows(materialData.material_specification_rows); rawMaterialPriceLibrary = priceData.raw_material_price_library;"
    : "materialSpecificationRows = prepareMaterialSpecificationRows(builtInMaterialSpecificationRows); rawMaterialPriceLibrary = builtInRawMaterialPriceLibrary;");
  {
    const original='BODY-ASTM A 217 GR. WC 6 (NORM. & TEMP.) TRIM - STELLITED, STEM-13% CR STEEL';
    context.valveRow={Item:'Gate Valve (IBR)',Size:'2 IN',Rating:'600#',Material:original,Qty:2,UOM:'Nos'};
    const row=run("buildBomGroupItem(valveRow,{item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Qty',uom:'UOM'},'WC6 regression','test')");
    const cost=row.componentCost;
    assert.equal(cost.unitCostAllowed,true,cost.note);assert.ok(cost.medianUnitRate>0);assert.equal(row.material,original);
    assert.match(row.materialCategory,/Alloy Steel/);assert.equal(cost.quantity,2);
    context.canonical=original.replace('WC 6','WC6');
    const canonical=run("buildComponentCostEstimate({group:'Valves Group',item:'Gate Valve (IBR)',standardName:'Gate Valve',sizeText:'2 IN',thicknessText:'600#',materialText:canonical,quantityText:'2',uomText:'Nos'})");
    assert.equal(cost.medianUnitRate,canonical.medianUnitRate);assert.equal(cost.p90UnitRate,canonical.p90UnitRate);
    context.wc6Row=row;
    const sheet=run("buildEditableComponentSheet('Valves Group',[wc6Row]).sheet");
    assert.ok(sheet.F6.v>0);assert.ok(sheet.K6.f);assert.ok(JSON.stringify(sheet).includes(original));
    checks++;
  }
  for (const [material, expected] of [
    ["ASTM A182 GR.F1", "A335 Gr.P1"],
    ["ASTM A182 GR.F11", "A335 Gr.P11"],
    ["ASTM A182 GR.F12", "A335 Gr.P12"],
    ["ASTM A182 GR.F22", "A335 Gr.P22"],
    ["ASTM A182 GR.F91", "A335 Gr.P91"],
    ["ASTM A234 GR.WP11WCL1", "A335 Gr.P11"],
    ["ASTM A234 GR.WP22CL1", "A335 Gr.P22"],
    ["B: A182GRF5;INT:SS304", "A335 Gr.P5"],
    ["A182 GR.F11, TR SS347", "A335 Gr.P11"],
    ["B: A234WP11INT:SS304", "A335 Gr.P11"],
    ["ASTM A182 GR.F316L", "A312 TP316L"],
    ["BODY-ASTM A 217 GR. WC 6 (NORM. & TEMP.) TRIM - STELLITED, STEM-13% CR STEEL", "A335 Gr.P11"],
    ["ASTM A217 GR. WC\u00a06", "A335 Gr.P11"],
    ["ASTM A217 GR. WC\n6", "A335 Gr.P11"],
  ]) {
    context.material = material;
    assert.equal(run("getRawMaterialPriceMapping(material, '2026')?.equivalentPipeSpec"), expected, `${mode}: ${material}`);
    checks++;
  }
  for (const [material, expected] of [
    ["ASTM A106 GR.B", "Carbon Steel"],
    ["API 5L GR.B", "Carbon Steel"],
    ["ASTM A234 GR.WPBW", "Carbon Steel"],
    ["ASTM A234 GR.WPCW", "Carbon Steel"],
    ["B: A234WP5W; INT :SS304", "Low & Int. Alloy Steel for High temp Service"],
    ["A217 GR.C5; 13%CR+STEL", "Low & Int. Alloy Steel for High temp Service"],
    ["ASTM A182 GR.F316L", "Austenitic Stainless Steel"],
    ["ASTM A312 TP316L", "Austenitic Stainless Steel"],
    ["ASTM A182 GR.F999", "Unclassified"],
  ]) {
    context.material = material;
    assert.equal(run("classifyMaterialSpec(material).category"), expected, `${mode}: ${material}`);
    checks++;
  }
  for (const material of ["A335 Gr.P999", "A182 Gr.F999", "A312 TP316X", "A217 GR. WC 60", "A217 GR. WC 6X", "A217 GR. WC 600", "", "190"]) {
    context.material = material;
    assert.equal(run("getRawMaterialPriceMapping(material, '2026')"), null, `${mode}: must not invent a grade match: ${material}`);
    checks++;
  }
  for (const material of ["ASTM A182 GR.F11", "B: A182GRF5;INT:SS304"]) {
    context.material = material;
    const result = run(`buildComponentCostEstimate({group: "Valves Group", item: "Gate Valve", standardName: "Gate Valve",
      sizeText: "6", thicknessText: "150 #", materialText: material, quantityText: "1", uomText: "Nos"})`);
    const raw = run("getRawMaterialPriceMapping(material, '2026').recommended");
    assert.equal(result.rawSteel, raw);
    assert.ok(Number.isFinite(result.medianUnitRate) && result.medianUnitRate > 0);
    checks++;
  }
  const override = run(`buildComponentCostEstimate({group: "Valves Group", item: "Gate Valve", standardName: "Gate Valve",
    sizeText: "6", thicknessText: "150 #", materialText: "ASTM A182 GR.F11", quantityText: "1", uomText: "Nos",
    rawOverrideText: "500", factorOverrideText: "3"})`);
  assert.equal(override.rawSteel, 500);
  assert.equal(override.factor, 3);
  assert.equal(override.rawSteelOverrideApplied, true);
  assert.equal(override.factorOverrideApplied, true);
  checks++;

  // An unrelated page raw price must never fill an unknown item's missing rate.
  run('elements.rawOverride.value = "999";');
  for (const material of ["ASTM A182 GR.F999", "ASTM A358 TP999 CL1", "Unknown material", ""]) {
    context.material = material;
    for (const raw of ["", "0", "-1", "NaN", "Infinity"]) {
      context.rawOverrideText = raw;
      const cost = run(`buildComponentCostEstimate({group: "Valves Group", item: "Gate Valve", standardName: "Gate Valve",
        sizeText: "6", thicknessText: "150 #", materialText: material, quantityText: "2", uomText: "Nos",
        rawOverrideText, factorOverrideText: "3"})`);
      assert.equal(cost.missingMaterialPrice, true);
      assert.equal(cost.unitCostAllowed, false);
      assert.equal(cost.totalCostAllowed, false);
      assert.equal(cost.medianUnitRate, undefined);
      assert.match(cost.note, /Review required: no approved raw-material price mapping/);
      checks++;
    }
  }
  for (const overrideSource of ["bomOverride", "manualOverride"]) {
    context.overrideSource = overrideSource;
    const cost = run(`buildComponentCostEstimate({group: "Valves Group", item: "Gate Valve", standardName: "Gate Valve",
      sizeText: "6", thicknessText: "150 #", materialText: "Unknown material", quantityText: "2", uomText: "Nos",
      rawOverrideText: "250", rawOverrideSource: overrideSource})`);
    assert.equal(cost.rawSteel, 250);
    assert.ok(cost.medianUnitRate > 0);
    assert.equal(cost.rawSteelOverrideApplied, overrideSource === "bomOverride");
    assert.equal(cost.manualRawSteelOverrideApplied, overrideSource === "manualOverride");
    checks++;
  }
  for (const sourceType of ["materialLibrary", "defaultYear"]) {
    context.sourceType = sourceType;
    const pipe = run(`buildEstimate({year: 2026, size: 6, thickness: 7.11, length: 10,
      spec: "Unknown material", rawOverride: "999", rawSteelSource: sourceType})`);
    assert.equal(pipe.missingMaterialPrice, true);
    checks++;
  }
  const manualPipe = run(`buildEstimate({year: 2026, size: 6, thickness: 7.11, length: 10,
    spec: "Unknown material", rawOverride: "250", rawSteelSource: "manualOverride"})`);
  assert.equal(manualPipe.rawSteel, 250);
  assert.ok(manualPipe.medianTotal > 0);
  const automaticPipe = run(`buildEstimate({year: 2026, size: 6, thickness: 7.11, length: 10, spec: "A106 Gr.B"})`);
  assert.equal(automaticPipe.rawSteel, run('getRawMaterialPriceMapping("A106 Gr.B", 2026).recommended'));
  const noPricePipe = run(`buildEstimate({year: 2026, size: 6, thickness: 7.11, length: 10, spec: "Unknown material"})`);
  assert.equal(noPricePipe.missingMaterialPrice, true);
  checks += 3;
  // Run the actual BOM-row adapter and summary, including an unpriced pipe.
  context.rows = [
    {Item: "PIPE SEAMLESS", Size: "6 IN", Thickness: "SCH 40", Material: "Unknown material", Qty: "10", UOM: "M", Raw: ""},
    {Item: "Gate Valve", Size: "6 IN", Thickness: "150 #", Material: "Unknown material", Qty: "2", UOM: "Nos", Raw: "250"},
  ];
  const groupItems = run(`rows.map(row => buildBomGroupItem(row,
    {item: "Item", size: "Size", thickness: "Thickness", spec: "Material", length: "Qty", uom: "UOM", rawOverride: "Raw"},
    "Regression BOM", "regression"))`);
  assert.equal(groupItems[0].componentCost.missingMaterialPrice, true);
  assert.equal(groupItems[1].componentCost.rawSteel, 250);
  context.groupItems = groupItems;
  const summary = run("getComponentCostSummary(groupItems)");
  assert.equal(summary.review, 1);
  assert.equal(summary.priced, 1);
  assert.equal(summary.normal, groupItems[1].componentCost.medianTotal);
  assert.equal(summary.p90, groupItems[1].componentCost.p90Total);
  checks++;
  const {sheet, totalRow} = run('buildEditableComponentSheet("Regression", groupItems)');
  assert.equal(sheet.F6.v, "Review required");
  assert.equal(sheet.I6.v, "");
  assert.equal(sheet.J6.v, "");
  assert.equal(sheet.K6.v, "Review");
  assert.equal(sheet.M6.v, "Review");
  assert.equal(sheet.N6.v, "Review");
  assert.equal(sheet.O6.v, "Review required");
  assert.match(sheet.P6.v, /no approved raw-material price mapping/);
  assert.equal(sheet.F7.v, 250);
  assert.equal(sheet.O7.v, "Priced");
  assert.equal(sheet[`M${totalRow}`].v, groupItems[1].componentCost.medianTotal);
  checks++;
}
console.log(`${checks} material matching and unit-rate checks passed (loaded and backup libraries).`);
// Exercise every PMS description to catch parsing failures, without treating
// a generic/default price as evidence of approved material coverage.
const dataFolder = path.join(root, "Old NRL PMS", "data");
let rows = 0;
const classes = fs.readdirSync(dataFolder).filter((name) => name.endsWith(".json"));
for (const name of classes) {
  const data = JSON.parse(fs.readFileSync(path.join(dataFolder, name)));
  for (const item of data.items) {
    context.material = item.material;
    const classification = run("classifyMaterialSpec(material)");
    const mapping = run("getRawMaterialPriceMapping(material, '2026')");
    assert.ok(classification.category);
    if (mapping) assert.ok(Number.isFinite(mapping.recommended) && mapping.recommended > 0);
    rows++;
  }
}
console.log(`All ${rows} PMS rows across ${classes.length} classes processed without a matching error.`);
