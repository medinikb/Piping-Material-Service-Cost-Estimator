// Run: node tests/pricing-integration.cjs [--excel]
// Verifies calculated-only pricing, legacy input migration and real XLSX round-trip.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const element = { value: "", dataset: {}, querySelectorAll: () => [] };
const context = vm.createContext({ console, window: {}, document: { querySelector: () => element, querySelectorAll: () => [] }, ArrayBuffer, Uint8Array });
const run = code => vm.runInContext(code, context);
run(fs.readFileSync(path.join(root, "special-component-pricing.js"), "utf8"));
run(fs.readFileSync(path.join(root, "app.js"), "utf8").split("\npopulateSizeOptions();")[0]);
context.priceData = JSON.parse(fs.readFileSync(path.join(root, "raw_material_price_library.json")));
context.materialData = JSON.parse(fs.readFileSync(path.join(root, "astm_piping_material_specification_webapp.json")));
run(`rawMaterialPriceLibrary = priceData.raw_material_price_library;
  materialSpecificationRows = prepareMaterialSpecificationRows(materialData.material_specification_rows);
  elements.year = {value: '2026'}; elements.rawOverride = {value: '999'};
  elements.factorOverride = {value: ''}; elements.coating = {value: 'No'}; elements.spec = {value: 'A106 Gr.B'};`);
let checks = 0;
function check(label, fn) { try { fn(); checks++; } catch (e) { e.message = label + ": " + e.message; throw e; } }
const price = options => {
  context.options = {group: "Valves Group", item: "Gate Valve", standardName: "Gate Valve", sizeText: "4 IN", thicknessText: "150#", materialText: "ASTM A216 WCB", quantityText: "2", uomText: "Nos", ...options};
  return run("buildComponentCostEstimate(options)");
};
const wcb = price({});
check("default WCB uses library, not page rate", () => {
  assert.ok(wcb.medianUnitRate > 0); assert.equal(wcb.rawSteel, 56.5); assert.match(wcb.note, /budget|commercial/i);
});
const reviewCases = [
  {group:"Gasket Group",item:"Spiral Wound Gasket",materialText:"SS316L + graphite"},
  {group:"Bolt Group",item:"Stud with Nuts",materialText:"A193 B7 / A194 2H",sizeText:'3/4" x 145 mm'},
  {group:"Bolt Group",item:"Machine Bolt",materialText:"A307 Gr.B",sizeText:"M24 x 145"},
  {group:"Bolt Group",item:"Nut",materialText:"A194 2HM",sizeText:"M24"},
  {group:"Bolt Group",item:"Stud with Nuts and Washers",materialText:"A193 B7 / A194 2H",sizeText:"M24 x 145"},
  ...["Mitre","Cross","Stub End"].map(item=>({group:"Fitting Group",item,materialText:"A234 WPB"})),
  {group:"Flange Group",item:"SPCR & BLN",materialText:"A105"},
  ...["Needle Valve","Diaphragm Valve","Angle Valve","Three Way Valve"].map(item=>({item})),
  {group:"Pipe Group",item:"PIPE SEAMLESS",materialText:"ASTM A515 GR.60/HDPE",uomText:"M"},
  {group:"Pipe Group",item:"PIPE SEAMLESS",materialText:"API 5L GR.B + (RUB LIN)",uomText:"M"},
  {item:"Gate Valve",materialText:"A216WCB, TR F316. JACKET"}
];
for (const fixture of reviewCases) {
  const options = {...fixture, standardName:fixture.item,rawOverrideText:"500",factorOverrideText:"3"};
  check(fixture.item + " stays Review", () => {
    const cost=price(options); assert.equal(cost.requiresReview,true); assert.equal(cost.unitCostAllowed,false);
    assert.match(cost.note,/supported calculation|calculation model|approved rate/i);
    assert.doesNotMatch(cost.note,/enter.*(?:quotation|confirmed unit)/i);
  });
  check(fixture.item + " cannot use retired price inputs", () => {
    const cost=price({...options,unitRateOverrideText:"1250.50",quotationReferenceText:"RETIRED-REF"});
    assert.equal(cost.unitCostAllowed,false); assert.equal(cost.quotedUnitRateApplied,undefined);
    assert.doesNotMatch(cost.note,/RETIRED-REF/);
  });
}
for (const value of ["500","0","-10","NaN","Infinity","Rs abc12","100 per set","1e999"]) {
  check("retired finished price ignored: "+value, () => {
    const result=price({unitRateOverrideText:value,quotationReferenceText:"RETIRED-REF"});
    assert.equal(result.medianUnitRate,wcb.medianUnitRate); assert.equal(result.quotationReference,undefined);
  });
}
check("metric B7/2H calculation retained", () => {
  const bolt=price({group:"Bolt Group",item:"Stud with Nuts",standardName:"Stud with Nuts",materialText:"A193 B7 / A194 2H",sizeText:"M24 x 145",rawOverrideText:"200"});
  assert.ok(bolt.medianUnitRate>0); assert.ok(bolt.setMassKg>0); assert.equal(bolt.rawSteel,200);
});
check("missing quantity cannot create totals", () => {
  const result=price({quantityText:""}); assert.equal(result.unitCostAllowed,true); assert.equal(result.totalCostAllowed,false);
});
check("lined pipe cannot bypass review", () => {
  const cost=run('buildEstimate({year:2026,size:4,thickness:6.02,length:10,spec:"ASTM A515 GR.60/HDPE",rawOverride:500,rawSteelSource:"manualOverride"})');
  assert.match(cost.error,/Review required/); assert.doesNotMatch(cost.error,/Confirmed Unit Rate/);
});
context.rows=[
  {Item:"PIPE SEAMLESS",Size:"6 IN",Rating:"SCH 40",Material:"A106 Gr.B",Qty:"10",UOM:"M",Raw:"100",Factor:"2",Quote:"999999",Reference:"RETIRED-PIPE"},
  {Item:"Gasket",Size:"4 IN",Rating:"150#",Material:"SS304 + CAF",Qty:"3",UOM:"Nos",Raw:"500",Factor:"3",Quote:"750",Reference:"RETIRED-GASKET"},
  {Item:"Gate Valve",Size:"4 IN",Rating:"150#",Material:"A216 WCB",Qty:"2",UOM:"Nos",Raw:"",Factor:"",Quote:"50000",Reference:"RETIRED-VALVE"}
];
run("var columns={item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Qty',uom:'UOM',rawOverride:'Raw',factorOverride:'Factor',retiredPricingColumns:['Quote','Reference']}; var testItems=rows.map(row=>buildBomGroupItem(row,columns,'Integration BOM','integration'));");
check("BOM adapter keeps raw/factor and ignores retired inputs", () => {
  assert.equal(run("testItems[0].componentCost.rawSteel"),100);
  assert.equal(run("testItems[0].componentCost.factor"),2);
  assert.equal(run("testItems[1].componentCost.unitCostAllowed"),false);
  assert.equal(run("testItems[2].componentCost.medianUnitRate"),wcb.medianUnitRate);
  assert.match(run("testItems[1].inputAuditNote"),/ignored/);
  assert.equal(run("getComponentCostSummary(testItems).review"),1);
});
check("audit records ignored inputs without obsolete references", () => {
  const audit=run("buildComponentRateAuditHtml(testItems)");
  assert.match(audit,/Legacy finished-unit pricing inputs were ignored/); assert.doesNotMatch(audit,/RETIRED-/);
  context.unsafeItem={item:"Gasket",size:"4 IN",componentCost:{note:"<script>invalid</script>"}};
  assert.ok(!run("buildComponentRateAuditHtml([unsafeItem])").includes("<script>"));
});
check("manual fields and quotation helpers removed", () => {
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.doesNotMatch(html,/component-unit-rate-override|component-quotation-reference|Quotation Reference|Confirmed Unit Rate/);
  assert.equal(run("typeof buildQuotedComponentCost"),"undefined");
  assert.equal(run("typeof downloadQuotationBomTemplate"),"undefined");
});
async function verifyExcel() {
  const response=await fetch("https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js");
  if(!response.ok)throw Error("Excel dependency HTTP "+response.status);
  run(await response.text());
  check("Excel calculated/review cells and totals round-trip", () => {
    const built=run('buildEditableComponentSheet("Integration",testItems)');
    assert.equal(built.sheet.F6.v,100); assert.equal(built.sheet.J6.v,2); assert.equal(built.sheet.O6.v,"Priced");
    assert.equal(built.sheet.O7.v,"Review required"); assert.equal(built.sheet.K7.v,"Review"); assert.match(built.sheet.P7.v,/ignored/);
    assert.equal(built.sheet.K8.v,wcb.medianUnitRate);
    assert.equal(built.sheet["M"+built.totalRow].v,run("getComponentCostSummary(testItems).normal"));
    context.sheet=built.sheet;
    run(`(() => {const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,sheet,'Integration');
      const back=XLSX.read(XLSX.write(wb,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets.Integration;
      if(back.F6.v!==100||back.J6.v!==2||back.O7.v!=='Review required'||back.O8.v!=='Priced')throw Error('Excel values changed');
      const text=XLSX.utils.sheet_to_csv(back);if(/RETIRED-|Confirmed Unit Rate|Quotation Reference|N.A - quoted/.test(text))throw Error('Removed quotation data leaked');
    })()`);
  });
  check("original download template retains raw/factor without quotation columns", () => {
    context.templateBytes=new Uint8Array(fs.readFileSync(path.join(root,"Piping BOM Example Template.xlsx")));
    const text=run("(() => {const wb=XLSX.read(templateBytes,{type:'array'});return wb.SheetNames.map(n=>XLSX.utils.sheet_to_csv(wb.Sheets[n])).join('\\n');})()");
    assert.match(text,/Raw Steel Rs\/kg Override/); assert.match(text,/Estimate Factor Override/);
    assert.doesNotMatch(text,/Confirmed Unit Rate|Quotation Reference/);
  });
}
(async()=>{if(process.argv.includes("--excel"))await verifyExcel();console.log(checks+" calculated-only pricing integration checks passed.");})().catch(error=>{console.error(error);process.exitCode=1;});
