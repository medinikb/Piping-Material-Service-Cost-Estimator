// Read-only regression: node tests/bolting-stock-defaults.cjs [--excel]
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const prices = JSON.parse(fs.readFileSync(path.join(root,"raw_material_price_library.json")));
const controls = new Map();
const control = id => {
  if(!controls.has(id))controls.set(id,{value:"",dataset:{},classList:{toggle(){},add(){}},querySelectorAll:()=>[]});
  return controls.get(id);
};
const context = vm.createContext({console,ArrayBuffer,Uint8Array,window:{},document:{querySelector:control,querySelectorAll:()=>[]}});
const run = source => vm.runInContext(source,context);
run(fs.readFileSync(path.join(root,"special-component-pricing.js"),"utf8"));
run(fs.readFileSync(path.join(root,"app.js"),"utf8").split("\npopulateSizeOptions();")[0]);
context.prices=prices;
context.materials=JSON.parse(fs.readFileSync(path.join(root,"astm_piping_material_specification_webapp.json")));
run(`rawMaterialPriceLibrary=prices.raw_material_price_library;
  materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
  elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='99';`);
let checks=0;
const check=(label,fn)=>{try{fn();checks++;}catch(error){error.message=label+": "+error.message;throw error;}};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const price=changes=>{
  context.input={group:"Bolt Group",item:"Stud with Nuts",standardName:"Stud with Nuts",sizeText:"M20 x 110",materialText:"A193 B7 / A194 2H",quantityText:"10",uomText:"SET",...changes};
  return run("buildComponentCostEstimate(input)");
};
const references=[];
const collect=node=>{references.push(...(node.component_stock_price_references||[]));(node.children||[]).forEach(collect);};
prices.raw_material_price_library.forEach(collect);
check("observations are unique and conform to declared property/required contract",()=>{
  assert.equal(references.length,10);assert.equal(new Set(references.map(r=>r.id)).size,10);
  const schema=prices.component_price_reference_policy.entry_schema;
  for(const ref of references){
    for(const key of schema.required)assert.ok(Object.hasOwn(ref,key),`${ref.id} missing ${key}`);
    for(const key of Object.keys(ref))assert.ok(Object.hasOwn(schema.properties,key),`undeclared ${key}`);
    assert.ok(Number.isFinite(ref.observed_rate_inr_per_kg)&&ref.observed_rate_inr_per_kg>0);
    assert.match(ref.source_url,/^https:\/\//);
    if(ref.budget_pricing_enabled){assert.equal(ref.budget_year,2026);assert.equal(ref.source_checked_on,"2026-10-21");assert.ok(ref.budget_grade_mappings.length);assert.ok(ref.technical_source_urls.length);}
  }
});
check("existing pipe prices and metadata are byte-order-equivalent as data",()=>{
  const strip=node=>Array.isArray(node)?node.map(strip):node&&typeof node==="object"?Object.fromEntries(Object.entries(node).filter(([key])=>key!=="component_stock_price_references").map(([key,value])=>[key,strip(value)])):node;
  const hash=value=>crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  assert.equal(hash(prices.metadata),"34060bd0a57391b83467674377cf3c282b825a7f7dfa6c97c165fc3787488e6a");
  assert.equal(hash(strip(prices.raw_material_price_library.filter(group=>group.children.length))),"489f7d6dcf79b158f7001b616391220fbe8dea036deef63d08f41d62825d3a33");
});
for(const [materialText,construction,key,expected] of [
  ["ASTM A193 B7","stud","studRawSteel",90], ["A193 GR.B7M","stud","studRawSteel",90],
  ["A193 B16","stud","studRawSteel",80], ["A194 GR.2H","nut","nutRawSteel",70],
  ["A194 GR.2HM","nut","nutRawSteel",70], ["ASTM A194 GR.4","nut","nutRawSteel",65],
  ["ASTM A307 GR.A","stud","studRawSteel",65], ["ASTM A307 GR.B","stud","studRawSteel",65],
])check("exact raw-stock mapping "+materialText,()=>{
  context.materialText=materialText;context.construction=construction;
  const mapped=run("getBoltingRawStockPrices(materialText,construction)");assert.equal(mapped[key],expected);
  assert.equal(mapped.rawRateProvisional,true);assert.match(mapped.rawPriceSourceUrls,/https:/);assert.equal(mapped.rawPriceCheckedOn,"2026-10-21");
});
const automatic=price({});
check("blank override automatically calculates with separate stud/nut prices",()=>{
  assert.equal(automatic.unitCostAllowed,true);assert.equal(automatic.studRawSteel,90);assert.equal(automatic.nutRawSteel,70);
  near(automatic.rawCostPerUnit,36.515671379107744);near(automatic.medianUnitRate,91.28917844776936);
  near(automatic.rawSteel,80.03967836232707);near(automatic.rawSteel*automatic.massPerUnitKg,automatic.rawCostPerUnit);
  near(automatic.medianTotal,automatic.medianUnitRate*10);near(automatic.p90UnitRate,automatic.medianUnitRate*1.5);
  assert.equal(automatic.rawRateProvisional,true);assert.equal(automatic.factorProvisional,true);
  assert.equal(automatic.rawSteelOverrideApplied,false);assert.match(automatic.note,/weight-weighted/);
});
check("single stud plus two separately priced nuts reconcile to default set",()=>{
  const stud=price({item:"Stud",materialText:"A193 B7",uomText:"NOS"});
  const nut=price({item:"Nut",materialText:"A194 2H",sizeText:"M20",uomText:"NOS"});
  assert.equal(stud.rawSteel,90);assert.equal(nut.rawSteel,70);
  near(stud.medianUnitRate+2*nut.medianUnitRate,automatic.medianUnitRate);
  context.cost=nut;assert.equal(run("formatComponentRawRate(cost)"),"Rs 70.00");
});
check("row overrides still take priority over internet defaults exactly once",()=>{
  const manual=price({rawOverrideText:"100",factorOverrideText:"3",rawOverrideSource:"manualOverride"});
  assert.equal(manual.studRawSteel,100);assert.equal(manual.nutRawSteel,100);assert.equal(manual.rawSteel,100);
  near(manual.medianUnitRate,automatic.massPerUnitKg*100*3);assert.equal(manual.rawRateProvisional,false);
  assert.equal(manual.rawRateSource,"User override");assert.equal(manual.rawPriceSourceUrls,"");
  const factorOnly=price({factorOverrideText:"3"});near(factorOnly.medianUnitRate,automatic.rawCostPerUnit*3);
});
check("three-nut default set uses three nut costs, not a simple price average",()=>{
  const three=price({item:"Stud with 3 Nuts"});near(three.rawCostPerUnit,three.studMassKg*90+3*three.oneNutMassKg*70);
  assert.notEqual(three.rawSteel,80);assert.match(three.note,/nut/);
});
for(const materialText of ["A307 GR.B"]){
  check("raw reference visible without enabling unsupported finished model: "+materialText,()=>{
    const cost=price({materialText});assert.equal(cost.unitCostAllowed,false);assert.equal(cost.rawRateProvisional,true);
    assert.ok(Number.isFinite(cost.studRawSteel));assert.match(cost.note,/not a finished rate/);
    assert.ok(cost.rawPriceSourceUrls);assert.ok(!Number.isFinite(cost.medianTotal));
  });
}
for(const [materialText,stud,nut]of [["A193 B7M / A194 2HM",90,70],["A193 B16 / A194 4",80,65]])check('distinct grade pair budget '+materialText,()=>{const p=price({materialText});assert.equal(p.unitCostAllowed,true,p.note);assert.equal(p.studRawSteel,stud);assert.equal(p.nutRawSteel,nut);assert.match(p.note,/budget assumptions/);});
check("missing stud length shows available stock rates but never finished price",()=>{
  const cost=price({sizeText:"M24"});assert.equal(cost.unitCostAllowed,false);
  assert.equal(cost.studRawSteel,90);assert.equal(cost.nutRawSteel,70);
});
check("no fabricated past-year or unloaded-library rate",()=>{
  run("elements.year.value='2025'");assert.equal(price({}).unitCostAllowed,false);
  assert.equal(price({rawOverrideText:"90"}).unitCostAllowed,true);run("elements.year.value='2026'");
  run("rawMaterialPriceLibrary=builtInRawMaterialPriceLibrary");assert.equal(price({}).unitCostAllowed,false);
  run("rawMaterialPriceLibrary=prices.raw_material_price_library");
});
for(const materialText of ["A193 B70 / A194 2H","A193 B7 / A194 2HMX","A193 B7 / A194 2HM","A193 B7 / A194 2H GALV.","ASTM A105"]){
  check("exact grade / construction guard "+materialText,()=>assert.equal(price({materialText}).unitCostAllowed,false));
}
check("source-review flags still exclude price before raw lookup",()=>{
  const cost=price({sourceVerificationStatus:"needs_review",rawOverrideText:"100",factorOverrideText:"3"});
  assert.equal(cost.unitCostAllowed,false);assert.equal(cost.rawSteel,undefined);assert.equal(cost.studRawSteel,undefined);
});
check("multiple stud grades cannot hide behind a shared 4140 price",()=>{
  assert.equal(price({materialText:"A193 B7 / A193 B7M / A194 2H"}).unitCostAllowed,false);
});
check("duplicate active sources cannot silently choose the first rate",()=>{
  context.duplicateLibrary=JSON.parse(JSON.stringify(prices.raw_material_price_library));
  const group=context.duplicateLibrary.find(group=>group.component_stock_price_references?.some(ref=>ref.id==="aisi4140-black-round-bar-bhagwati"));
  const ref=group.component_stock_price_references.find(ref=>ref.id==="aisi4140-black-round-bar-bhagwati");
  group.component_stock_price_references.push({...ref,id:"duplicate-active-stock",observed_rate_inr_per_kg:95});
  run("rawMaterialPriceLibrary=duplicateLibrary");
  try{assert.equal(price({}).unitCostAllowed,false);}finally{run("rawMaterialPriceLibrary=prices.raw_material_price_library");}
});
check("gasket defaults are not enabled by bolt rate integration",()=>{
  const gasket=price({group:"Gasket Group",item:"Gasket",materialText:"SS316 + CAF",sizeText:"4 IN",uomText:"NOS"});
  assert.equal(gasket.unitCostAllowed,false);assert.equal(gasket.rawRateProvisional,undefined);
  for(const ref of references.filter(r=>r.reference_role==="candidate_gasket_constituent_basis"))assert.notEqual(ref.budget_pricing_enabled,true);
});
check("BOM/reprice/audit preserve automatic source-backed rates",()=>{
  context.row={Item:"Stud with Nuts",Size:"M20 x 110",Material:"A193 B7 / A194 2H",Qty:"10",UOM:"SET",Raw:"",Factor:""};
  run("var defaultBolt=buildBomGroupItem(row,{item:'Item',size:'Size',spec:'Material',length:'Qty',uom:'UOM',rawOverride:'Raw',factorOverride:'Factor'},'Internet default test','test');");
  near(run("repriceBomComponentCost(defaultBolt).medianUnitRate"),automatic.medianUnitRate);
  const audit=run("buildComponentRateAuditHtml([defaultBolt])");assert.match(audit,/bhagwatienterprise/);assert.match(audit,/krsteeludyog/);assert.match(audit,/2026-10-21/);
});
check("all 67 PMS bolting rows have a stud/bolt stock reference; no A307 nut grade invented",()=>{
  let bolts=0,nutMappings=0;
  const folder=path.join(root,"Old NRL PMS/data");
  for(const file of fs.readdirSync(folder).filter(name=>name.endsWith(".json"))){
    const data=JSON.parse(fs.readFileSync(path.join(folder,file)));
    for(const row of data.items.filter(row=>row.group==="Bolting")){
      context.materialText=row.material;
      const stock=run("getBoltingRawStockPrices(materialText,'set')");
      assert.ok(stock.studRawSteel>0,`${data.pipeClass}: ${row.material}`);
      if(Number.isFinite(stock.nutRawSteel))nutMappings++;
      if(/A307/.test(row.material)){
        context.a307Material=row.material;
        const explicitPair=run("SpecialComponentPricing.identifyBoltingMaterial(a307Material)==='A307 B / A307 B'");
        assert.equal(stock.nutRawSteel,explicitPair?65:undefined);
        if(explicitPair)assert.match(stock.rawPriceReferences,/confirm.*nut specification/i);
      }
      bolts++;
    }
  }
  assert.equal(bolts,67);assert.equal(nutMappings,64);
});
async function excel(){
  const response=await fetch("https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js");
  if(!response.ok)throw Error("Excel library HTTP "+response.status);run(await response.text());
  check("Excel and saved XLSX preserve effective and constituent rates with sources",()=>{
    run("var built=buildEditableComponentSheet('Bolt Group',[defaultBolt]);var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,built.sheet,'Bolt Group');var saved=XLSX.read(XLSX.write(wb,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Bolt Group'];");
    const sheet=run("saved");assert.equal(sheet.F5.v,"Effective Raw Steel Rs/kg");
    near(sheet.F6.v,automatic.rawSteel);near(sheet.K6.v,automatic.medianUnitRate);assert.equal(sheet.AD6.v,90);assert.equal(sheet.AE6.v,70);
    assert.match(sheet.AF6.v,/bhagwatienterprise/);assert.match(sheet.AF6.v,/krsteeludyog/);assert.equal(sheet.AG6.v,"2026-10-21");
    assert.match(sheet.Z6.v,/Default internet/);assert.match(sheet.AD6.f,/IF\(F6=/);assert.equal(sheet.I6.f,"V6*F6");
  });
  check("B16 Excel keeps distinct raw references and calculated totals",()=>{
    context.reviewCost=price({materialText:"A193 B16 / A194 4"});
    const sheet=run("buildEditableComponentSheet('Bolt Group',[{group:'Bolt Group',item:'Stud with Nuts',size:'M20 x 110',material:'A193 B16 / A194 4',quantity:'1',uom:'SET',componentCost:reviewCost}]).sheet");
    assert.equal(sheet.AD6.v,80);assert.equal(sheet.AE6.v,65);assert.ok(sheet.K6.v>0);assert.ok(sheet.M6.v>0);assert.ok(sheet.K6.f);
    assert.match(sheet.AF6.v,/cpsteelsuppliers/);assert.ok(sheet.F6.v>65&&sheet.F6.v<80);
  });
}
(async()=>{if(process.argv.includes("--excel"))await excel();console.log(`${checks} bolting internet-stock default checks passed.`);})().catch(error=>{console.error(error);process.exitCode=1;});
