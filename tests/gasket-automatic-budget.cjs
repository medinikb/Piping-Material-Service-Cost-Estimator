// Automation coverage is measured on a declared scenario set, NOT price accuracy.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const controls=new Map();function control(id){if(!controls.has(id))controls.set(id,{value:'',dataset:{},textContent:'',innerHTML:'',classList:{add(){},toggle(){}},querySelectorAll:()=>[]});return controls.get(id);}
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=code=>vm.runInContext(code,c);
for(const file of ['bolting-stock-prices.bundle.js','special-component-pricing.js','gasket-weight-pricing.js','gasket-class-catalog.bundle.js','gasket-budget-library.bundle.js','gasket-budget-pricing.js'])run(read(file));
run(read('app.js').split('\npopulateSizeOptions();')[0]);
c.data=JSON.parse(read('raw_material_price_library.json'));c.materials=JSON.parse(read('astm_piping_material_specification_webapp.json'));
run("rawMaterialPriceLibrary=data.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='999';");
let checks=0;function check(label,fn){try{fn();checks++;}catch(e){e.message=label+': '+e.message;throw e;}}
const price=changes=>{c.input={group:'Gasket Group',item:'Gasket',standardName:'Gasket',sizeText:'4 IN',thicknessText:'150#',materialText:'SS304',quantityText:'2',uomText:'NOS',...changes};return run('buildComponentCostEstimate(input)');};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
check('gasket starting material is SS316L with factor 1.8',()=>{assert.equal(run("manualComponentDefaults['Gasket Group'].material"),'SS316L');const p=price({materialText:'SS316L'});assert.equal(p.factor,1.8);assert.equal(p.gasketParts[0].rate,370);assert.equal(p.gasketParts[2].rate,370);assert.equal(p.unitCostAllowed,true);});
check('estimate wording is concise without extra scope labels',()=>{const p=price();const audit=[p.note,p.factorSource,p.rawRateSource,...p.gasketParts.map(part=>part.source)].join(' ');assert.doesNotMatch(audit,/\bprovisional\b|\bClass 3\b/i);assert.doesNotMatch(read('index.html'),/\bprovisional\b/i);});
check('basic inputs alone produce labelled automatic budget',()=>{const p=price();assert.equal(p.gasketAutomated,true,p.note);assert.ok(p.medianUnitRate>0);assert.equal(p.factor,1.8);assert.equal(p.factorOverrideApplied,false);assert.equal(p.factorProvisional,true);assert.match(p.note,/AUTOMATIC/);assert.match(p.note,/30%|0.3/);assert.match(p.note,/not manufacturer prices|not a supplier|not.*supplier/);});
check('independent winding envelope, metal/filler/ring build',()=>{const p=price();const v=Math.PI/4*(149.2**2-127**2)*4.5*1e-9;const inner=Math.PI/4*(127**2-106.4**2)*3*8000*1e-9;const outer=Math.PI/4*(174.6**2-149.2**2)*3*7850*1e-9;near(p.medianUnitRate,(v*.3*8000*210+v*.5*1400*350+inner*210+outer*90)/.85*1.8);});
check('unspecified stainless construction assumption is explicit',()=>assert.match(price().note,/Construction=SPIRAL_WOUND assumed/));
check('default factor is never described as user-entered',()=>{const p=price();assert.match(p.note,/default factor 1\.8/);assert.doesNotMatch(p.note,/x entered factor/);});
for(const materialText of ['SS304','SS316','SS316L','SS321','SS304H'])check('routine stainless '+materialText,()=>assert.equal(price({materialText}).gasketAutomated,true));
for(const materialText of ['SS304Ti','SS316Ti','SS347','UNKNOWN','EPDM'])check('no silent unknown grade substitution '+materialText,()=>assert.equal(price({materialText}).unitCostAllowed,false));
for(const materialText of ['IS-2712 GR.W/3','BUTYL RUBBER','PTFE','GRAPHITE'])check('routine sheet '+materialText,()=>{const p=price({materialText});assert.equal(p.gasketAutomated,true,p.note);assert.equal(p.gasketType,'SHEET_RING');});
for(const materialText of ['SOFT IRON (90 BHN MAX)','5% CR-0.5MO (120BHN)','SS316L (130BHN MAX.)','SS321 (120BHN MAX.)'])check('RTJ '+materialText,()=>{const p=price({materialText,thicknessText:'1500#'});assert.equal(p.gasketType,'RTJ');assert.equal(p.gasketAutomated,true,p.note);assert.match(p.note,/R-39/);});
check('RTJ actual octagon is not flat washer',()=>{const p=price({materialText:'SOFT IRON (90BHN MAX)',thicknessText:'1500#'});const area=11.13*16-(11.13-7.75)**2/(2*Math.tan(23*Math.PI/180));near(p.massPerUnitKg,Math.PI*161.93*area*7850*1e-9);});
check('primary raw override does not leak into filler/rings',()=>{const p=price({rawOverrideText:'999',factorOverrideText:'2'});assert.equal(p.gasketParts[0].rate,999);assert.equal(p.gasketParts[1].rate,350);assert.equal(p.gasketParts[2].rate,210);assert.equal(p.gasketParts[3].rate,90);assert.equal(p.factor,2);assert.equal(p.factorOverrideApplied,true);});
check('gasket-specific factor-only override retains automation',()=>{const p=price({gasketGeometry:{factor:2}});assert.equal(p.gasketAutomated,true,p.note);assert.equal(p.factor,2);});
check('RTJ never attributes its raw allowance to thin-strip source',()=>{const p=price({materialText:'SS316L (130BHN MAX)',thicknessText:'1500#'});assert.match(p.gasketParts[0].source,/Default raw allowance/);assert.doesNotMatch(p.gasketParts[0].source,/neviosteelage/);});
for(const rawOverrideText of ['0','-1','bad','Infinity'])check('invalid override not replaced by default '+rawOverrideText,()=>assert.equal(price({rawOverrideText}).unitCostAllowed,false));
check('Advanced auto overrides win',()=>{const p=price({gasketGeometry:{pricingMode:'AUTO',type:'SHEET_RING',primaryWeightKg:0.1,yieldPercent:80,factor:3,basis:'TEST ONLY'},rawOverrideText:'210'});near(p.medianUnitRate,78.75);assert.equal(p.factorProvisional,false);});
check('complete manual route unchanged',()=>{const p=price({gasketGeometry:{pricingMode:'MANUAL',type:'SHEET_RING',mode:'MASS',primaryWeightKg:0.1,yieldPercent:80,factor:3,basis:'TEST ONLY'},rawOverrideText:'210'});assert.equal(p.gasketAutomated,undefined);near(p.medianUnitRate,78.75);});
check('incomplete manual never receives automatic defaults',()=>assert.equal(price({gasketGeometry:{pricingMode:'MANUAL'}}).unitCostAllowed,false));
check('invalid mode rejected',()=>assert.equal(price({gasketGeometry:{pricingMode:'MAGIC'}}).unitCostAllowed,false));
check('excluded automatic ring inputs rejected',()=>assert.equal(price({gasketGeometry:{pricingMode:'AUTO',rings:'NONE',innerWeightKg:1}}).unitCostAllowed,false));
check('none means no ring weights/costs',()=>assert.equal(price({gasketGeometry:{pricingMode:'AUTO',rings:'NONE'}}).gasketParts.length,2));
check('whole pieces required for totals',()=>{const p=price({quantityText:'2.5'});assert.equal(p.unitCostAllowed,true);assert.equal(p.totalCostAllowed,false);});
check('non-table size is a labelled geometry allowance',()=>{const p=price({sizeText:'4.25 IN'});assert.equal(p.unitCostAllowed,true,p.note);assert.equal(p.gasketGeometryEstimated,true);assert.match(p.note,/Estimated dimensions/);});
for(const size of [26,28,30,36,48,60,72,120])for(const type of ['SPIRAL_WOUND','SHEET_RING','FULL_FACE','RTJ'])check('extended size '+size+' '+type,()=>{
  const p=price({sizeText:size+' IN',thicknessText:'150#',materialText:type==='SPIRAL_WOUND'?'SS304':type==='RTJ'?'SOFT IRON':'PTFE',gasketGeometry:{pricingMode:'AUTO',type}});
  assert.equal(p.unitCostAllowed,true,p.note);assert.ok(Number.isFinite(p.medianUnitRate)&&p.medianUnitRate>0);assert.equal(p.gasketGeometryEstimated,true);assert.match(p.gasketGeometrySource,/Estimated dimensions/);
});
check('exact geometry still has priority',()=>assert.equal(price().gasketGeometryEstimated,false));
for(const sizeText of ['Infinity IN','0 IN','-26 IN','junk'])check('invalid size '+sizeText,()=>assert.equal(price({sizeText}).unitCostAllowed,false));
check('26 inch winding circumference preserves radial section',()=>{const a=price({sizeText:'24 IN',gasketGeometry:{pricingMode:'AUTO',rings:'NONE'}});const b=price({sizeText:'26 IN',gasketGeometry:{pricingMode:'AUTO',rings:'NONE'}});assert.ok(b.medianUnitRate>a.medianUnitRate);assert.ok(b.medianUnitRate<a.medianUnitRate*(26/24)**2);});
check('unsupported full face class remains review',()=>assert.equal(price({thicknessText:'2500#',materialText:'BUTYL RUBBER',gasketGeometry:{pricingMode:'AUTO',type:'FULL_FACE'}}).unitCostAllowed,false));
check('no composite lost by choosing single-material type',()=>assert.equal(price({materialText:'SS304 + GRAPHITE',gasketGeometry:{pricingMode:'AUTO',type:'SHEET_RING'}}).unitCostAllowed,false));
check('RTJ ignores no entered washer dimensions',()=>assert.equal(price({materialText:'SOFT IRON (90BHN MAX)',gasketGeometry:{pricingMode:'AUTO',type:'RTJ',odMm:200,idMm:100}}).unitCostAllowed,false));
check('full face uses bolt-hole deductions',()=>{const p=price({materialText:'BUTYL RUBBER',gasketGeometry:{pricingMode:'AUTO',type:'FULL_FACE'}});assert.equal(p.gasketAutomated,true);assert.equal(p.gasketDimensions.holeCount,8);});
check('source review survives overrides/defaults',()=>assert.equal(price({sourceVerificationStatus:'needs_review',rawOverrideText:'999'}).sourceReviewRequired,true));
const catalog=c.PIPING_GASKET_CLASS_CATALOG;
const classInput=(name,size)=>{const r=catalog.rows.find(r=>r.pipeClass===name&&size>=r.lowSize&&size<=r.highSize);return {pipeClass:name,sizeText:size+' IN',materialText:r?.material||'SS304',thicknessText:r?.schThkRating||''};};
check('class determines pressure rating when gasket row contains thickness only',()=>{const p=price(classInput('A1A',4));assert.equal(p.gasketAutomated,true,p.note);});
check('wrong explicit pressure class is not accepted as class fit',()=>assert.equal(price({...classInput('A1A',4),thicknessText:'2500#'}).unitCostAllowed,false));
check('F15M absent source not filled from another class',()=>assert.equal(price(classInput('F15M',4)).unitCostAllowed,false));
check('A4F unresolved source still blocked',()=>{const row=catalog.rows.find(r=>r.pipeClass==='A4F');assert.equal(price(classInput('A4F',Math.max(row.lowSize,4))).sourceReviewRequired,true);});
check('G5M job-specific large ring is not auto invented',()=>assert.equal(price(classInput('G5M',16)).unitCostAllowed,false));
check('repricing preserves AUTO, overrides and defaults',()=>{const p=price();c.p=p;run("var gasket={group:'Gasket Group',item:'Gasket',size:'4 IN',thickness:'150#',material:'SS304',quantity:'2',uom:'NOS',gasketGeometry:{},componentCost:p};bomGroupItems.push(gasket)");near(run('repriceBomComponentCost(gasket).medianTotal'),p.medianTotal);});
check('report retains automatic classification, sources, and input calculation',()=>{const text=run('buildBomCostReportHtml()');assert.match(text,/AUTOMATIC/);assert.match(text,/Lamons/);assert.match(text,/yield/);assert.match(text,/Automatic budget coverage/);});
check('BOM with only routine fields uses AUTO',()=>{c.row={Item:'Gasket',Size:'4 IN',Thk:'150#',Material:'SS304',Qty:2,UOM:'NOS'};const item=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'AUTO BOM','test')");assert.equal(item.componentCost.gasketAutomated,true,item.componentCost.note);});
check('fallback/offline candidate rate parity',()=>{const a=price().medianUnitRate;run('rawMaterialPriceLibrary=buildFallbackRawMaterialPriceLibrary()');try{near(price().medianUnitRate,a);}finally{run('rawMaterialPriceLibrary=data.raw_material_price_library');}});
// Defined routine-size grid across every available class row. Unsupported/source-
// flagged scenarios remain in the denominator. This is NOT actual-project coverage.
const coverage={scenario:'All 67 PMS classes at NPS 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24 where a gasket source row exists; pressure class inferred from its flange rows',total:0,automatic:0,review:0,reviewClasses:{}};
for(const name of catalog.classes)for(const size of [.5,.75,1,1.5,2,3,4,6,8,10,12,14,16,18,20,24]){
  if(!catalog.rows.some(r=>r.pipeClass===name&&size>=r.lowSize&&size<=r.highSize))continue;
  coverage.total++;const p=price(classInput(name,size));
  if(p.gasketAutomated&&p.totalCostAllowed)coverage.automatic++;else{coverage.review++;coverage.reviewClasses[name]=(coverage.reviewClasses[name]||0)+1;}
  check('scenario coherent '+name+'/'+size,()=>assert.ok(p.gasketAutomated&&Number.isFinite(p.medianTotal)||p.unitCostAllowed===false,p.note));
}
coverage.percent=Number((100*coverage.automatic/coverage.total).toFixed(1));
console.log(JSON.stringify(coverage,null,2));
async function main(){if(process.argv.includes('--excel')){
  const response=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');if(!response.ok)throw Error('Excel library fetch failed');run(await response.text());
  check('26 inch Excel preserves estimated dimensions and formula',()=>{
    c.largeGasketCost=price({sizeText:'26 IN'});
    const sheet=run("(()=>{const row={...gasket,size:'26 IN',componentCost:largeGasketCost};const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',[row]).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()");
    assert.match(sheet.AJ6.v,/Estimated dimensions/);assert.match(sheet.P6.v,/26 IN/);assert.ok(sheet.K6.f);assert.ok(c.largeGasketCost.medianUnitRate>0);
  });
  check('Excel retains budget status, defaults, factor, weights and geometry',()=>{const s=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',[gasket]).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()");assert.equal(s.J6.v,1.8);assert.equal(s.O6.v,'Budget estimate');assert.match(s.O6.f,/Budget estimate/);assert.equal(s.AG6.v,'AUTO - default budget');assert.match(s.AH6.v,/budget-v9/);assert.match(s.AI6.v,/yieldPercent=85/);assert.match(s.AJ6.v,/Lamons/);assert.match(s.P6.v,/not manufacturer prices|not.*supplier/);});
}console.log(checks+' automatic gasket budget checks passed. Coverage is software scenario coverage, not engineering or price accuracy.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
