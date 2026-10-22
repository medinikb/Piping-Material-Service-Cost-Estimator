// No source/workbook writes. Run: node tests/bolting-weight-pricing.cjs [--excel]
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const controls = new Map();
const control = id => {
  if (!controls.has(id)) controls.set(id, { value:"",dataset:{},querySelectorAll:()=>[],classList:{add(){},toggle(){}} });
  return controls.get(id);
};
const context = vm.createContext({console, ArrayBuffer, Uint8Array, document:{querySelector:control,querySelectorAll:()=>[]},window:{}});
const run = code => vm.runInContext(code,context);
run(fs.readFileSync(path.join(root,"special-component-pricing.js"),"utf8"));
run(fs.readFileSync(path.join(root,"app.js"),"utf8").split("\npopulateSizeOptions();")[0]);
context.prices = JSON.parse(fs.readFileSync(path.join(root,"raw_material_price_library.json")));
context.materials = JSON.parse(fs.readFileSync(path.join(root,"astm_piping_material_specification_webapp.json")));
run(`rawMaterialPriceLibrary=prices.raw_material_price_library;
  materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
  elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='99';`);
let checks = 0;
function check(label, fn) { try {fn();checks++;} catch(error) {error.message=label+": "+error.message;throw error;} }
const near = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
const defaults = {group:"Bolt Group",item:"Stud with Nuts",standardName:"Stud with Nuts",sizeText:"M20 x 110",
  materialText:"A193 B7 / A194 2H",quantityText:"10",uomText:"SET",rawOverrideText:"90",factorOverrideText:""};
const price = changes => { context.input={...defaults,...changes};return run("buildComponentCostEstimate(input)"); };
const set=price({});
check("existing geometry retained independently",()=>{
  near(set.studMassKg,0.22901491068661448);near(set.oneNutMassKg,0.11360235298080315);
  near(set.setMassKg,0.45621961664822075);near(set.rawCostPerUnit,41.059765498339864);
  near(set.medianUnitRate,102.64941374584966);near(set.medianTotal,1026.4941374584967);
  near(set.p90UnitRate,set.medianUnitRate*1.5);
  assert.equal(set.factor,2.5);assert.equal(set.factorProvisional,true);assert.equal(set.factorSource,"Default 2.50");
});
const stud=price({item:"Stud",standardName:"Stud",materialText:"A193 B7",uomText:"NOS"});
const nut=price({item:"Nut",standardName:"Nut",materialText:"A194 2H",sizeText:"M20",uomText:"EA"});
check("separate pieces reconcile to set",()=>{
  near(stud.medianUnitRate+2*nut.medianUnitRate,set.medianUnitRate);
  assert.equal(stud.totalNutMassKg,0);assert.equal(nut.studMassKg,0);
  assert.equal(stud.numberOfNuts,0);assert.equal(nut.numberOfNuts,1);
});
check("explicit counts affect weight, never quantity twice",()=>{
  const three=price({item:"Stud with 3 Nuts"});near(three.setMassKg,stud.studMassKg+3*nut.oneNutMassKg);
  const one=price({item:"Stud with Nut"});assert.equal(one.numberOfNuts,1);
  const manual=price({boltGeometry:{numberOfNuts:"4"}});assert.equal(manual.numberOfNuts,4);
  assert.equal(price({item:"Stud with 3 Nuts",boltGeometry:{numberOfNuts:"2"}}).unitCostAllowed,false);
});
check("factor override replaces default factor once",()=>{
  const override=price({factorOverrideText:"3",rawOverrideSource:"manualOverride"});
  near(override.medianUnitRate,set.rawCostPerUnit*3);assert.equal(override.studCommercialFactor,3);
  assert.equal(override.manualFactorOverrideApplied,true);assert.equal(override.factorProvisional,false);
  assert.match(override.note,/factor 3.00 \(User override\)/);
});
check("raw override scales both price and audit",()=>{
  const override=price({rawOverrideText:"180"});near(override.medianUnitRate,set.medianUnitRate*2);
  assert.equal(override.rawSteel,180);assert.equal(override.rawRateSource,"BOM override");
});
for (const [field,values] of [["rawOverrideText",["0","-1","NaN","Infinity","abc90"]],["factorOverrideText",["0","-1","NaN","Infinity","abc3"]]]) {
  for(const value of values) check(field+" rejects "+value,()=>assert.equal(price({[field]:value}).unitCostAllowed,false));
}
for(const quantityText of ["","0","-1","1.5","NaN","abc2"]) check("invalid quantity "+quantityText,()=>{
  const cost=price({quantityText});assert.equal(cost.unitCostAllowed,true);assert.equal(cost.totalCostAllowed,false);assert.ok(Number.isNaN(cost.medianTotal));
});
for(const changes of [
  {uomText:"kg"},{uomText:"LOT"},{sizeText:"4 IN"},{sizeText:'3/4" x 110'},
  {item:"Machine Bolt",standardName:"Bolt"},{item:"Hex Nut",standardName:"Nut",sizeText:"M20",uomText:"NOS"},{item:"Stud with Nuts and Washers"},{item:"Stud with 0 Nuts"},
  {item:"Stud with 1.5 Nuts"},
  {materialText:"A307 Gr.B"},{materialText:"A193 B7 / A194 2H GALV."},
  {sourceVerificationStatus:"needs_review",factorOverrideText:"3"},
  {boltGeometry:{pitchMm:"0"}},{boltGeometry:{numberOfNuts:"1.5"}},
  {boltGeometry:{nutAcrossFlatsMm:"19"}},{sizeText:"M60 x 200"},
]) check("unsupported / incomplete "+JSON.stringify(changes),()=>assert.equal(price(changes).unitCostAllowed,false));
check("confirmed nonlookup dimensions supported, no nearest substitution",()=>{
  const cost=price({sizeText:"M61 x 200",boltGeometry:{pitchMm:"5.5",nutAcrossFlatsMm:"95",nutThicknessMm:"61"}});
  assert.equal(cost.unitCostAllowed,true);assert.equal(cost.studDiameterMm,61);assert.match(cost.note,/user-confirmed geometry/);
  assert.ok(price({item:"Stud",materialText:"A193 B7",sizeText:"M6 x 30",uomText:"NOS"}).medianUnitRate>0);
});
check("pipe controls cannot change bolt pricing",()=>{
  run("elements.coating.value='Yes';elements.factorOverride.value='999';");
  near(price({}).medianUnitRate,set.medianUnitRate);run("elements.coating.value='No';");
});
check("manual repricing retains factor, raw, count and dimensions",()=>{
  context.record={...defaults,group:"Bolt Group",item:"Stud with Nuts",standardName:"Stud with Nuts",size:"M61 x 200",thickness:"-",
    material:defaults.materialText,quantity:"2",uom:"SET",sourceKey:"manual-component",rawSteelOverride:"120",estimateFactorOverride:"3.2",
    boltGeometry:{numberOfNuts:"3",pitchMm:"5.5",nutAcrossFlatsMm:"95",nutThicknessMm:"61"}};
  const cost=run("repriceBomComponentCost(record)");assert.equal(cost.unitCostAllowed,true);
  assert.equal(cost.numberOfNuts,3);assert.equal(cost.factor,3.2);assert.equal(cost.rawSteel,120);assert.equal(cost.studDiameterMm,61);
});
check("BOM adapter and rate-source report carry audit",()=>{
  context.row={Item:"Stud with 3 Nuts",Size:"M20 x 110",Material:defaults.materialText,Qty:"10",UOM:"SET",Raw:"90",Factor:"3"};
  run("var boltItem=buildBomGroupItem(row,{item:'Item',size:'Size',spec:'Material',length:'Qty',uom:'UOM',rawOverride:'Raw',factorOverride:'Factor'},'Test BOM','test');");
  assert.equal(run("boltItem.componentCost.numberOfNuts"),3);assert.equal(run("boltItem.componentCost.factor"),3);
  const audit=run("buildComponentRateAuditHtml([boltItem])");assert.match(audit,/1 fully threaded stud \+ 3 heavy-hex nut/);assert.match(audit,/Estimated weight/);assert.match(audit,/BOM override/);
});
async function excel() {
  const response=await fetch("https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js");
  if(!response.ok)throw Error("Excel dependency HTTP "+response.status);run(await response.text());
  context.setCost=set;context.studCost=stud;context.nutCost=nut;
  run(`var boltRows=[setCost,studCost,nutCost].map((cost,index)=>({group:'Bolt Group',item:['Stud with Nuts','Stud','Nut'][index],size:index===2?'M20':'M20 x 110',quantity:'10',uom:index===0?'SET':'NOS',material:index===2?'A194 2H':'A193 B7 / A194 2H',componentCost:cost})).concat([boltItem]);
    var builtBolts=buildEditableComponentSheet('Bolt Group',boltRows);`);
  check("Excel has live raw/factor drivers and component weights",()=>{
    const sheet=run("builtBolts.sheet");assert.equal(sheet.Q5.v,"Included Pieces / Unit");
    near(sheet.R6.v,set.studMassKg);near(sheet.S6.v,set.oneNutMassKg);assert.equal(sheet.T6.v,2);
    near(sheet.V6.v,set.setMassKg);assert.equal(sheet.I6.f,"V6*F6");assert.match(sheet.K6.f,/I6\*J6/);
    assert.match(sheet.Y6.v,/Default/);assert.equal(sheet.F6.v,90);assert.equal(sheet.J6.v,2.5);
    assert.equal(sheet.R8.v,0);assert.equal(sheet.T7.v,0);assert.equal(sheet.V8.v,nut.setMassKg);
    assert.match(sheet.Y6.f,/Excel override/);assert.match(sheet.M6.f,/MOD/);
  });
  check("Excel serialization preserves numeric audits, formulas and sources",()=>{
    run(`var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,builtBolts.sheet,'Bolting');
      var reopened=XLSX.read(XLSX.write(wb,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets.Bolting;`);
    const sheet=run("reopened");near(sheet.K6.v,set.medianUnitRate);assert.equal(sheet.I6.f,"V6*F6");
    assert.equal(sheet.R6.t,"n");assert.equal(sheet.Y6.v,set.factorSource);
    assert.equal(sheet.J9.v,3);assert.equal(sheet.T9.v,3);assert.equal(sheet.Y9.v,"BOM override");
    near(sheet.K9.v,run("boltItem.componentCost.rawCostPerUnit")*3);
    assert.equal(sheet.Q8.v,"1 heavy-hex nut; no stud");assert.match(sheet["!ref"],/AG/);
  });
}
(async()=>{if(process.argv.includes("--excel"))await excel();console.log(`${checks} bolting weight/pricing checks passed.`);})().catch(error=>{console.error(error);process.exitCode=1;});
