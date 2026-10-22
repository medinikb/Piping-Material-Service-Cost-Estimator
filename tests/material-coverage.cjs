const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const element = {value: "", dataset: {}, querySelectorAll: () => []};
const context = vm.createContext({console, window: {}, document: {querySelector: () => element, querySelectorAll: () => []}});
vm.runInContext(fs.readFileSync(path.join(root, "app.js"), "utf8").split("\npopulateSizeOptions();")[0], context);
context.materialData = JSON.parse(fs.readFileSync(path.join(root, "astm_piping_material_specification_webapp.json")));
context.priceData = JSON.parse(fs.readFileSync(path.join(root, "raw_material_price_library.json")));
const run = (source) => vm.runInContext(source, context);
run('elements.year = {value: "2026"}; rawMaterialPriceLibrary = priceData.raw_material_price_library; materialSpecificationRows = prepareMaterialSpecificationRows(materialData.material_specification_rows);');
const records = fs.readdirSync(path.join(root, "Old NRL PMS", "data")).filter(name => name.endsWith(".json")).flatMap(name => {
  const data = JSON.parse(fs.readFileSync(path.join(root, "Old NRL PMS", "data", name)));
  return data.items.map(item => ({...item, pipeClass: data.pipeClass}));
});
const unique = [...new Set(records.map(item => item.material))];
function mapping(material) {
  context.material = material;
  return run('getRawMaterialPriceMapping(material, "2026")');
}
const mapped = new Set(unique.filter(material => mapping(material)));
console.log(JSON.stringify({classes: new Set(records.map(item => item.pipeClass)).size, rows: records.length,
  uniqueMaterials: unique.length, mappedMaterials: mapped.size, unmappedMaterials: unique.length - mapped.size,
  mappedRows: records.filter(item => mapped.has(item.material)).length,
  byGroup: [...new Set(records.map(item => item.group))].map(group => {
    const rows = records.filter(item => item.group === group);
    return {group, rows: rows.length, mapped: rows.filter(item => mapped.has(item.material)).length};
  }), unmapped: unique.filter(material => !mapped.has(material))}, null, 2));
if (process.argv.includes("--audit")) process.exit(0);

let checks = 0;
for (const mode of ["loaded", "backup"]) {
  run(mode === "loaded"
    ? "materialSpecificationRows = prepareMaterialSpecificationRows(materialData.material_specification_rows); rawMaterialPriceLibrary = priceData.raw_material_price_library;"
    : "materialSpecificationRows = prepareMaterialSpecificationRows(builtInMaterialSpecificationRows); rawMaterialPriceLibrary = builtInRawMaterialPriceLibrary;");
  for (const [material, expected] of [
    ["ASTM A216 WCB", "A106 Gr.B"],
    ["BODY A216 GR.WCB, 13%CR.T", "A106 Gr.B"],
    ["A217GRC5;13% CR+STEL", "A335 Gr.P5"],
    ["A217GRWC6, TR SS347", "A335 Gr.P11"],
    ["A351 GR.CF8M, SS316L TRIM", "A312 TP316"],
    ["A351 GR.CF3M, 316L TRIM", "A312 TP316L"],
    ["A351 GR.CF8C, TR SS347", "A312 TP347"],
    ["A351CN7M BODY & TRIM", "B729"],
    ["ASTM A672 GR.C70 CL12", "A671/A672"],
    ["ASTM A 672 GRB60 CL32", "A671/A672"],
    ["ASTM A358 TP316L CL1", "A312 TP316L"],
    ["A358 GR321 CL.1(SHTP)", "A312 TP321"],
    ["IS-1239 BLACK", "A106 Gr.B"],
    ["IS-3589 GR.330", "A106 Gr.B"],
    ["ASTM A691 GR.5CR CL42", "A335 Gr.P5"],
    ["ASTM A 691GR1.25CRCL42", "A335 Gr.P11"],
    ["5 CR A 691 CL42", "A335 Gr.P5"],
    ["ASTM A515 GR.60", "A671/A672"],
    ["ASTM A285 GR.C", "A671/A672"],
  ]) {
    const result = mapping(material);
    assert.ok(result, `${mode}: ${material}`);
    assert.equal(result.equivalentPipeSpec, expected, `${mode}: ${material}`);
    assert.match(result.note, /budget|commercial/i);
    assert.ok(result.recommended > 0);
    checks++;
  }
  for (const material of ["190", "000", "163", "160", "ASTM A 152 GR.F11", "A315GRCF8, TRIMSS304", "A182 GR.F999", "A672 GR.C999", "A351 GR.CF8XXX", "A217 GR.C50", "A860 WPHY", "ASTM D3035 GR.PE3406 CLC", "ASTM A515 GR.60/HDPE", "ASTM A105 (RUB LINED)"]) {
    assert.equal(mapping(material), null, `${mode}: needs a confirmed quotation: ${material}`);
    checks++;
  }
  for (const material of ["ASTM A216 WCB", "ASTM A672 GR.C70 CL12", "IS-1239 BLACK", "IS-3589 GR.330"]) {
    context.material = material;
    assert.equal(run("classifyMaterialSpec(material).category"), "Carbon Steel", `${mode}: ${material}`);
    checks++;
  }
}
console.log(`${checks} material coverage checks passed in loaded and backup modes.`);
