// Read-only app regression: node tests/gasket-raw-references.cjs [--excel]
// A known raw reference is visible without inventing a finished gasket price.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const controls=new Map();
function control(id){if(!controls.has(id))controls.set(id,{value:'',hidden:false,dataset:{},textContent:'',innerHTML:'',classList:{add(){},toggle(){}},querySelectorAll:()=>[]});return controls.get(id);}
const context=vm.createContext({console,window:{},ArrayBuffer,Uint8Array,document:{querySelector:control,querySelectorAll:()=>[]}});
const run=code=>vm.runInContext(code,context);
run(read('bolting-stock-prices.bundle.js'));run(read('special-component-pricing.js'));run(read('app.js').split('\npopulateSizeOptions();')[0]);
context.data=JSON.parse(read('raw_material_price_library.json'));context.materials=JSON.parse(read('astm_piping_material_specification_webapp.json'));
run(`rawMaterialPriceLibrary=data.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
  elements.year.value='2026';elements.factorOverride.value='999';elements.coating.value='No';elements.projectDescription.value='Gasket raw audit test';elements.projectNumber.value='TEST';`);
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=label+': '+e.message;throw e;}}
const price=changes=>{context.input={group:'Gasket Group',item:'Gasket',standardName:'Gasket',sizeText:'4 IN',thicknessText:'150#',materialText:'SS304',quantityText:'1',uomText:'NOS',...changes};return run('buildComponentCostEstimate(input)');};
for(const[materialText,expected]of[['SS304',210],['SS 304',210],['AISI 304L',210],['SS316',320],['SS316L',370],['GRAPHITE',350],['PTFE',1250]]){
  check('saved constituent reference '+materialText,()=>{
    const p=price({materialText});assert.equal(p.rawSteel,expected);assert.equal(p.gasketRawReferenceOnly,true);assert.ok(p.rawPriceSourceUrls.startsWith('https://'));
    assert.equal(p.unitCostAllowed,false);assert.equal(p.totalCostAllowed,false);assert.ok(!Number.isFinite(p.medianUnitRate));assert.ok(!Number.isFinite(p.factor));
    assert.match(p.note,/not a finished gasket price/);assert.match(p.note,/not.*selected-year/);assert.equal(p.rawRateProvisional,undefined);
  });
}
check('screenshot override 66 is visible and correctly labelled',()=>{
  const p=price({rawOverrideText:'66',rawOverrideSource:'manualOverride'});assert.equal(p.rawSteel,66);assert.equal(p.manualRawSteelOverrideApplied,true);assert.equal(p.rawSteelOverrideApplied,false);
  assert.match(p.note,/User override: Rs 66.00\/kg/);assert.match(p.note,/SS304: Rs 210.00\/kg/);assert.equal(p.unitCostAllowed,false);
});
check('BOM raw override retains priority, not the page pipe override',()=>{
  run("elements.rawOverride.value='999'");const p=price({rawOverrideText:'100'});assert.equal(p.rawSteel,100);assert.equal(p.rawSteelOverrideApplied,true);assert.match(p.note,/BOM override/);
});
for(const rawOverrideText of ['0','-1','Infinity','NaN','abc66'])check('invalid override '+rawOverrideText,()=>{
  const p=price({rawOverrideText});assert.equal(p.rawSteel,210);assert.equal(p.invalidGasketRawOverride,true);assert.match(p.note,/Invalid raw override/);
});
check('composite constituents never become one averaged or summed raw rate',()=>{
  const p=price({materialText:'SS316L SPR WND + GRAPHITE'});assert.equal(p.rawSteel,undefined);
  assert.equal(p.gasketConstituentRates.length,2);context.cost=p;assert.equal(run('formatComponentRawRate(cost)'),'SS316L Rs 370.00 / GRAPHITE Rs 350.00');
  assert.equal(p.unitCostAllowed,false);assert.match(p.note,/Do not add or average/);
});
check('known metal and unknown CAF filler stay separate',()=>{
  const p=price({materialText:'SS304 SPR WND + CAF'});assert.equal(p.rawSteel,undefined);assert.equal(p.gasketConstituentRates.length,1);assert.equal(p.gasketConstituentRates[0].key,'SS304');assert.match(p.note,/Excludes filler/);
});
for(const materialText of ['SS304H','SS316Ti','SS321','A105','IS 2712 CAF','EXPANDED PTFE','FILLED PTFE'])check('no nearest grade/form substitution '+materialText,()=>{
  const p=price({materialText});assert.equal(p.gasketConstituentRates.length,0);assert.equal(p.rawSteel,undefined);assert.equal(p.unitCostAllowed,false);
});
check('unknown material override is an input, not proof of material or construction',()=>{
  const p=price({materialText:'UNVERIFIED',rawOverrideText:'66'});assert.equal(p.rawSteel,66);assert.equal(p.gasketMaterialCategory,'Unclassified');assert.equal(p.unitCostAllowed,false);
});
check('source review cannot be bypassed by raw or factor overrides',()=>{
  const p=price({sourceVerificationStatus:'needs_review',rawOverrideText:'66',factorOverrideText:'3'});assert.equal(p.sourceReviewRequired,true);assert.equal(p.rawSteel,undefined);assert.equal(p.unitCostAllowed,false);
});
check('source duplicate is not silently selected',()=>{
  const copy=JSON.parse(JSON.stringify(context.data.raw_material_price_library));const group=copy.find(g=>g.basic_mat_of_const==='Austenitic Stainless Steel');
  const ref=group.children.flatMap(c=>c.component_stock_price_references||[]).find(r=>r.reference_material_keys?.includes('SS316'));
  group.component_stock_price_references=[{...ref,id:'conflicting-ss316',observed_rate_inr_per_kg:999}];context.copy=copy;run('rawMaterialPriceLibrary=copy');
  try{assert.equal(price({materialText:'SS316'}).rawSteel,undefined);}finally{run('rawMaterialPriceLibrary=data.raw_material_price_library');}
});
check('offline file opening has exact gasket reference parity',()=>{
  const before=['SS304','SS316','SS316L','PTFE','GRAPHITE'].map(materialText=>price({materialText}).rawSteel);
  run('rawMaterialPriceLibrary=buildFallbackRawMaterialPriceLibrary()');
  try{assert.deepEqual(['SS304','SS316','SS316L','PTFE','GRAPHITE'].map(materialText=>price({materialText}).rawSteel),before);}finally{run('rawMaterialPriceLibrary=data.raw_material_price_library');}
});
check('reference-only prices are not presented as historical-year defaults',()=>{
  run("elements.year.value='2025'");try{const p=price({});assert.match(p.note,/not.*selected-year/);assert.equal(p.unitCostAllowed,false);}finally{run("elements.year.value='2026'");}
});
check('quick estimate displays category, raw reference and manual override',()=>{
  run(`elements.componentGroup.value='Gasket Group';elements.componentType.value='Gasket';elements.componentSize.value='4 IN';elements.componentRating.value='150#';elements.componentMaterial.value='SS304';elements.componentQuantity.value='1';elements.componentUom.value='NOS';elements.componentRawOverride.value='';renderComponentQuickEstimate();`);
  assert.equal(run('elements.componentRawRate.textContent'),'Rs 210.00');assert.equal(run('elements.componentRawRateLabel.textContent'),'Raw Rs/kg (reference)');assert.equal(run('elements.componentMaterialCategory.textContent'),'Austenitic Stainless Steel');
  run("elements.componentRawOverride.value='66';renderComponentQuickEstimate()");assert.equal(run('elements.componentRawRate.textContent'),'Rs 66.00');assert.equal(run('elements.componentRawRateLabel.textContent'),'Raw Rs/kg (user input)');
  assert.equal(run('elements.componentUnitRate.textContent'),'Review');assert.equal(run('elements.componentFactor.textContent'),'Review');
});
check('BOM import/reprice/report preserve references and excluded totals',()=>{
  context.row={Item:'Gasket',Size:'4 IN',Rating:'150#',Material:'SS304',Quantity:'2',UOM:'NOS',Raw:'66'};
  run("var gasket=buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Quantity',uom:'UOM',rawOverride:'Raw'},'Gasket test','test');bomGroupItems.push(gasket);");
  assert.equal(run('gasket.materialCategory'),'Austenitic Stainless Steel');assert.equal(run('repriceBomComponentCost(gasket).rawSteel'),66);
  assert.equal(run('getComponentCostSummary(bomGroupItems).normal'),0);assert.equal(run('getComponentCostSummary(bomGroupItems).review'),1);
  assert.match(run('buildBomCostReportHtml()'),/66.00/);assert.match(run('buildComponentRateAuditHtml([gasket])'),/not a finished gasket price/);
});
async function main(){
  if(process.argv.includes('--excel')){
    const res=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');if(!res.ok)throw Error('Excel library HTTP '+res.status);run(await res.text());
    check('download sheet audit survives Excel serialization with no finished formulas enabled',()=>{
      context.composite=price({materialText:'SS316L + GRAPHITE'});
      const s=run(`(()=>{const w=XLSX.utils.book_new();const items=[gasket,{group:'Gasket Group',item:'Spiral Wound Gasket',size:'4 IN',material:'SS316L + GRAPHITE',quantity:'1',uom:'NOS',componentCost:composite}];XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',items).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()`);
      assert.equal(s.F6.v,66);assert.match(s.F7.v,/SS316L Rs 370.00.*GRAPHITE Rs 350.00/);assert.equal(s.K6.v,'Review');assert.equal(s.M6.v,'Review');assert.equal(s.N7.v,'Review');assert.match(s.P6.v,/BOM override/);assert.match(s.P7.v,/Do not add or average/);
      assert.equal(s.I6?.v,undefined);assert.equal(s.J6?.v,undefined);
    });
  }
  console.log(checks+' gasket raw-reference checks passed; no unsupported finished gasket totals enabled.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
