// Read-only loader + real renderer regression. No browser settings/files changed.
// Run: node tests/bolting-offline-loading.cjs [--excel]
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const root = path.resolve(__dirname, "..");
const master = JSON.parse(fs.readFileSync(path.join(root,"raw_material_price_library.json")));
const snapshotSource = fs.readFileSync(path.join(root,"bolting-stock-prices.bundle.js"),"utf8");
const controls = new Map();
const control = id => {
  if(!controls.has(id))controls.set(id,{value:"",dataset:{},textContent:"",hidden:false,
    classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[]});
  return controls.get(id);
};
let fetchBehavior, lastFetch;
const context = vm.createContext({console,ArrayBuffer,Uint8Array,window:{},
  document:{querySelector:control,querySelectorAll:()=>[]},
  fetch: async (url,options)=>{lastFetch={url,options};return fetchBehavior(url,options);}});
const run = source => vm.runInContext(source,context);
run(snapshotSource);
run(fs.readFileSync(path.join(root,"special-component-pricing.js"),"utf8"));
run(fs.readFileSync(path.join(root,"app.js"),"utf8").split("\npopulateSizeOptions();")[0]);
context.materials=JSON.parse(fs.readFileSync(path.join(root,"astm_piping_material_specification_webapp.json")));
run(`materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
  elements.year.value='2026';elements.factorOverride.value='';elements.coating.value='No';
  elements.componentGroup.value='Bolt Group';elements.componentType.value='Stud with Nuts';
  elements.componentSize.value='M24 x 145';elements.componentMaterial.value='ASTM A193 B7 / ASTM A194 2H';
  elements.componentRawOverride.value='';elements.componentQuantity.value='1';elements.componentUom.value='SET';
  elements.componentRatingField.hidden=true;
  refreshRawMaterialLibrarySelection=()=>{};refreshLineItemYearPrices=()=>{};
  renderBomGroupReview=()=>{};calculate=()=>{};`);
let checks=0;
const check=(label,fn)=>{try{fn();checks++;}catch(error){error.message=label+": "+error.message;throw error;}};
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
const cost=()=>run("getCurrentComponentQuickEstimate().cost");
const load=()=>run("loadRawMaterialPriceLibrary()");
function expectedM24(studRate=90,nutRate=70){
  const effective=24-0.649519*3;
  const stud=Math.PI/4*effective**2*145*7850*1e-9;
  const oneNut=(Math.sqrt(3)/2*41**2-Math.PI/4*effective**2)*24.2*0.95*7850*1e-9;
  return (stud*studRate+2*oneNut*nutRate)*2.5;
}
async function main(){
  check("generated offline data is exactly synchronized to master JSON",()=>{
    childProcess.execFileSync(process.execPath,["scripts/build-bolting-stock-bundle.cjs","--check"],{cwd:root});
    const expected=master.raw_material_price_library.flatMap(group=>(group.component_stock_price_references||[])
      .filter(reference=>reference.reference_role==="candidate_bolt_stock_basis"&&reference.budget_pricing_enabled));
    const actual=run("PIPING_BOLTING_STOCK_SNAPSHOT.groups.flatMap(group=>group.component_stock_price_references).filter(reference=>reference.reference_role==='candidate_bolt_stock_basis'&&reference.budget_pricing_enabled)");
    assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected);assert.equal(actual.length,5);
  });
  check("classic offline script is loaded before the app",()=>{
    const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
    const bundle=html.indexOf('src="bolting-stock-prices.bundle.js?');const app=html.indexOf('src="app.js?');
    assert.ok(bundle>0&&app>bundle);assert.doesNotMatch(snapshotSource,/\bfetch\s*\(|\bimport\s*\(/);
  });
  fetchBehavior=()=>{throw new TypeError("Failed to fetch");};
  await load();
  check("unavailable JSON request reproduces screenshot inputs but now prices correctly",()=>{
    const priced=cost();assert.equal(priced.unitCostAllowed,true);assert.equal(priced.rawRateProvisional,true);
    assert.equal(priced.studRawSteel,90);assert.equal(priced.nutRawSteel,70);near(priced.medianUnitRate,expectedM24());
    assert.equal(run("rawMaterialPriceLibraryStatus"),"failed");assert.match(priced.rawRateSource,/bundled offline copy/);
    assert.match(priced.note,/Bundled offline snapshot/);
  });
  check("real Quick Estimate renderer shows raw prices, factor and unit rate",()=>{
    assert.match(control("#component-raw-rate").textContent,/Stud Rs 90\.00 \/ Nut Rs 70\.00/);
    assert.equal(control("#component-factor").textContent,"2.50 (default)");
    assert.equal(control("#component-unit-rate").textContent,run("formatCurrency(getCurrentComponentQuickEstimate().cost.medianUnitRate,2)"));
    assert.notEqual(control("#component-output-status").textContent,"Review required");
    assert.match(control("#component-basis").textContent,/Bundled offline snapshot/);
  });
  check("cache bypass is requested for the canonical JSON",()=>{
    const summary=control("#component-price-summary").textContent;
    assert.match(summary,/Derived unit price: Rs 165\.64\/set \(default\)/);
    assert.match(summary,/1 fully threaded stud \+ 2 heavy-hex nut\(s\)/);
    assert.match(summary,/Estimated weight: stud 0\.4347 kg; one nut 0\.1938 kg; included nuts 0\.3876 kg; unit 0\.8223 kg/);
    assert.match(summary,/Unit Rs = \[stud 0\.434712 kg x Rs 90\.00\/kg \+ included nuts 0\.387608 kg x Rs 70\.00\/kg\] x factor 2\.50 \(Default 2\.50\)/);
    assert.doesNotMatch(summary,/not NRL calibrated/);
    assert.doesNotMatch(summary,/https?:|density|Effective weight-weighted/);
    assert.equal(control("#component-calculation-details").hidden,false);
    assert.equal(lastFetch.url,"raw_material_price_library.json");assert.equal(lastFetch.options.cache,"no-store");
  });
  check("remaining audit details are collapsed while the full saved note stays intact",()=>{
    const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
    assert.match(html,/<details[^>]*id="component-calculation-details"[^>]*hidden>\s*<summary>Calculation details &amp; sources<\/summary>\s*<p[^>]*id="component-basis"/);
    assert.doesNotMatch(html,/<details[^>]*id="component-calculation-details"[^>]*\bopen\b/);
    assert.match(control("#component-basis").textContent,/Effective weight-weighted raw rate.*https:\/\//);
    assert.doesNotMatch(control("#component-basis").textContent,/Estimated weight:|Unit Rs =/);
    assert.equal(cost().note,cost().boltingCalculationSummary+cost().boltingCalculationDetails);
  });
  check("details stay open during recalculation when the user has expanded them",()=>{
    control("#component-calculation-details").open=true;
    run("renderComponentQuickEstimate();");
    assert.equal(control("#component-calculation-details").open,true);
  });
  check("legacy pipe fallback grade values are unchanged",()=>{
    const strip=node=>Array.isArray(node)?node.map(strip):node&&typeof node==="object"?Object.fromEntries(Object.entries(node).filter(([key])=>key!=="component_stock_price_references").map(([key,value])=>[key,strip(value)])):node;
    const fallback=run("buildFallbackRawMaterialPriceLibrary()");const legacy=run("builtInRawMaterialPriceLibrary");
    const legacyCategories=new Set(legacy.map(group=>group.basic_mat_of_const));
    assert.equal(JSON.stringify(strip(fallback.filter(group=>legacyCategories.has(group.basic_mat_of_const)))),JSON.stringify(strip(legacy)));
    assert.ok(fallback.filter(group=>!legacyCategories.has(group.basic_mat_of_const)).every(group=>group.children.length===0));
  });
  for(const [label,behavior] of [
    ["HTTP 404",()=>({ok:false,status:404})],
    ["malformed JSON shape",()=>({ok:true,json:async()=>({raw_material_price_library:{length:10}})})],
    ["JSON parse failure",()=>({ok:true,json:async()=>{throw new SyntaxError("Invalid JSON");}})],
  ]){
    fetchBehavior=behavior;await load();check(label+" retains sourced offline prices",()=>near(cost().medianUnitRate,expectedM24()));
  }
  context.jsonPrices=JSON.parse(JSON.stringify(master));
  context.jsonPrices.raw_material_price_library.find(group=>group.component_stock_price_references?.some(record=>record.id==="aisi4140-black-round-bar-bhagwati"))
    .component_stock_price_references.find(record=>record.id==="aisi4140-black-round-bar-bhagwati").observed_rate_inr_per_kg=100;
  fetchBehavior=()=>({ok:true,json:async()=>context.jsonPrices});await load();
  check("successfully loaded JSON takes priority over the generated snapshot",()=>{
    assert.equal(cost().studRawSteel,100);near(cost().medianUnitRate,expectedM24(100));
    assert.equal(run("rawMaterialPriceLibrarySourceLabel"),"JSON price library");
    assert.doesNotMatch(cost().rawRateSource,/bundled/);
  });
  context.jsonPrices.raw_material_price_library.forEach(group=>(group.component_stock_price_references||[]).forEach(record=>{record.budget_pricing_enabled=false;}));
  await load();check("valid JSON disabling defaults cannot be bypassed by offline rates",()=>assert.equal(cost().unitCostAllowed,false));
  fetchBehavior=()=>{throw Error("Unavailable");};await load();
  run("elements.componentRawOverride.value='100';elements.componentBoltFactor.value='3';renderComponentQuickEstimate();");
  check("offline raw/factor overrides still take priority exactly once",()=>{
    const result=cost();near(result.medianUnitRate,result.massPerUnitKg*100*3);
    assert.equal(result.rawSteel,100);assert.equal(result.factor,3);assert.equal(result.rawRateProvisional,false);
    assert.match(control("#component-price-summary").textContent,new RegExp(run("formatCurrency(getCurrentComponentQuickEstimate().cost.medianUnitRate,2)").replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    assert.doesNotMatch(control("#component-price-summary").textContent,/default/);
    assert.match(control("#component-price-summary").textContent,/Unit Rs = .*raw Rs 100\.00\/kg.*factor 3\.00 \(User override\)/);
  });
  run("elements.componentRawOverride.value='';elements.componentBoltFactor.value='';elements.year.value='2025';renderComponentQuickEstimate();");
  check("historical year is not invented and actual selected year is explained",()=>{
    assert.equal(cost().unitCostAllowed,false);assert.match(cost().note,/cover 2026; selected year is 2025/);
    assert.match(control("#component-price-summary").textContent,/selected year is 2025/);
    assert.equal(control("#component-calculation-details").hidden,true);
    assert.equal(control("#component-calculation-details").open,false);
  });
  run("elements.year.value='2026';elements.componentSize.value='M24';renderComponentQuickEstimate();");
  check("offline data never enables missing stud length",()=>assert.equal(cost().unitCostAllowed,false));
  run("elements.componentSize.value='M24 x 145';elements.componentMaterial.value='A193 B16 / A194 4';renderComponentQuickEstimate();");
  check("B16 budget uses separate exact stock references offline",()=>{
    assert.equal(cost().unitCostAllowed,true);assert.equal(cost().studRawSteel,80);assert.equal(cost().nutRawSteel,65);assert.match(cost().note,/budget assumptions/);
  });
  run("elements.componentMaterial.value='ASTM A193 B7 / ASTM A194 2H';");
  for(const [material,stud,nut]of [['A307 B / A307 B',65,65],['A320 L7 / A194 4',90,65]]){
    control('#component-material').value=material;
    run('renderComponentQuickEstimate();');
    check('new budget pair available offline '+material,()=>{assert.equal(cost().unitCostAllowed,true,cost().note);assert.equal(cost().studRawSteel,stud);assert.equal(cost().nutRawSteel,nut);});
  }
  run("elements.componentMaterial.value='ASTM A193 B7 / ASTM A194 2H';");
  check("source-review flags still block offline prices",()=>{
    const result=run("buildComponentCostEstimate({group:'Bolt Group',item:'Stud with Nuts',sizeText:'M24 x 145',materialText:'A193 B7 / A194 2H',quantityText:'1',uomText:'SET',sourceVerificationStatus:'needs_review'})");
    assert.equal(result.unitCostAllowed,false);assert.equal(result.sourceReviewRequired,true);
  });
  run("delete globalThis.PIPING_BOLTING_STOCK_SNAPSHOT;");await load();
  check("missing bundle and JSON fail clearly, never fabricate a rate",()=>{
    assert.equal(cost().unitCostAllowed,false);assert.match(cost().note,/bolting-stock-prices\.bundle\.js/);
  });
  run(snapshotSource);await load();run("renderComponentQuickEstimate();");
  if(process.argv.includes("--excel")){
    const response=await fetch("https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js");
    if(!response.ok)throw Error("Excel dependency HTTP "+response.status);run(await response.text());
    check("Excel serialization keeps offline source, weights, rates and correct totals",()=>{
      run(`var outputCost=getCurrentComponentQuickEstimate().cost;
        var built=buildEditableComponentSheet('Bolt Group',[{group:'Bolt Group',item:'Stud with Nuts',size:'M24 x 145',material:'A193 B7 / A194 2H',quantity:'1',uom:'SET',componentCost:outputCost}]);
        var book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,built.sheet,'Bolt Group');
        var saved=XLSX.read(XLSX.write(book,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Bolt Group'];`);
      const saved=run("saved");near(saved.K6.v,expectedM24());near(saved.M6.v,expectedM24());
      assert.equal(saved.AD6.v,90);assert.equal(saved.AE6.v,70);assert.equal(saved.AG6.v,"2026-10-21");
      assert.match(saved.Z6.v,/bundled offline copy/);assert.match(saved.P6.v,/Bundled offline snapshot/);
      assert.equal(saved.I6.f,"V6*F6");
    });
  }
  console.log(`${checks} offline bolt-price loading checks passed. M24 x 145 default unit Rs ${cost().medianUnitRate.toFixed(2)}.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
