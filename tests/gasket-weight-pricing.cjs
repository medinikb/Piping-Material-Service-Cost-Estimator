// All masses/rates below are TEST assumptions, not approved project defaults.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../gasket-weight-pricing.js');
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=label+': '+e.message;throw e;}}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const base={type:'SHEET_RING',material:'SS304',quantity:'2',uom:'NOS',primaryRate:210,geometry:{mode:'MASS',primaryWeightKg:0.1,yieldPercent:80,factor:3,basis:'TEST ONLY'}};
const calc=(changes={},g={})=>engine.calculate({...base,...changes,geometry:{...base.geometry,...g}});
check('independent unit, mass, yield, factor and totals',()=>{const p=calc();near(p.rawCostPerUnit,26.25);near(p.medianUnitRate,78.75);near(p.medianTotal,157.5);near(p.p90Total,236.25);});
for(const type of Object.keys(engine.types))check('explicit family '+type,()=>assert.equal(engine.identifyType(type),type));
check('sheet dimensions metric conversion',()=>{const p=calc({}, {mode:'DIMENSIONS',odMm:200,idMm:100,thicknessMm:3,densityKgM3:1800});near(p.massPerUnitKg,Math.PI/4*(200**2-100**2)*3*1800*1e-9);});
check('full face deducts holes',()=>{const p=calc({type:'FULL_FACE'},{mode:'DIMENSIONS',odMm:200,idMm:100,thicknessMm:3,densityKgM3:1800,holeCount:4,holeDiameterMm:10});near(p.massPerUnitKg,Math.PI/4*(200**2-100**2-4*10**2)*3*1800*1e-9);});
for(const[key,value]of[['yieldPercent',''],['yieldPercent',0],['yieldPercent',101],['factor',''],['factor',0],['factor',-1],['factor',Infinity],['basis',''],['p90Ratio',0.9],['primaryWeightKg',false],['primaryWeightKg',NaN]])check('invalid '+key+' '+value,()=>assert.equal(calc({}, {[key]:value}).unitCostAllowed,false));
for(const[key,value]of[['odMm',100],['densityKgM3',''],['thicknessMm',-1],['holeCount',1.5],['holeDiameterMm',99]])check('invalid dimensions '+key,()=>assert.equal(calc({}, {mode:'DIMENSIONS',odMm:200,idMm:100,thicknessMm:3,densityKgM3:1800,holeCount:4,holeDiameterMm:10,[key]:value}).unitCostAllowed,false));
for(const type of ['RTJ','SPIRAL_WOUND','MEASURED'])check('no flat washer for '+type,()=>assert.equal(calc({type},{mode:'DIMENSIONS'}).unitCostAllowed,false));
for(const uom of ['SET','KG','LOT'])check('no ambiguous quantity '+uom,()=>assert.equal(calc({uom}).unitCostAllowed,false));
for(const quantity of ['2.5','0','-1','abc'])check('whole piece totals '+quantity,()=>{const p=calc({quantity});assert.equal(p.unitCostAllowed,true);assert.equal(p.totalCostAllowed,false);});
check('overflow is rejected',()=>assert.equal(calc({primaryRate:1e308},{primaryWeightKg:1e308}).unitCostAllowed,false));
const spiral={mode:'MASS',primaryWeightKg:0.1,fillerWeightKg:0.02,rings:'BOTH',innerWeightKg:0.03,innerRate:100,outerWeightKg:0.05,outerRate:100,yieldPercent:80,factor:3,basis:'TEST ONLY'};
check('spiral independent constituent equation',()=>{const p=engine.calculate({...base,type:'SPIRAL_WOUND',primaryRate:370,fillerRate:350,geometry:spiral});near(p.medianUnitRate,(37+7+3+5)/0.8*3);near(p.massPerUnitKg,0.2);near(p.rawSteel,260);});
for(const key of ['fillerWeightKg','innerWeightKg','innerRate','outerWeightKg','rings'])check('missing spiral '+key,()=>assert.equal(engine.calculate({...base,type:'SPIRAL_WOUND',fillerRate:350,geometry:{...spiral,[key]:''}}).unitCostAllowed,false));
check('BOM excluded stale constituents rejected',()=>assert.equal(engine.calculate({...base,type:'SPIRAL_WOUND',fillerRate:350,geometry:{...spiral,rings:'NONE'}}).unitCostAllowed,false));
const controls=new Map();function control(id){if(!controls.has(id))controls.set(id,{value:'',dataset:{},classList:{add(){},toggle(){}},querySelectorAll:()=>[],textContent:'',innerHTML:''});return controls.get(id);}
const context=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=code=>vm.runInContext(code,context);
for(const file of ['bolting-stock-prices.bundle.js','special-component-pricing.js','gasket-weight-pricing.js','gasket-class-catalog.bundle.js'])run(read(file));
run(read('app.js').split('\npopulateSizeOptions();')[0]);
context.data=JSON.parse(read('raw_material_price_library.json'));context.materials=JSON.parse(read('astm_piping_material_specification_webapp.json'));
run("rawMaterialPriceLibrary=data.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='999';");
const price=changes=>{context.input={group:'Gasket Group',item:'Gasket',standardName:'Gasket',sizeText:'4 IN',thicknessText:'150#',materialText:'SS304',quantityText:'2',uomText:'NOS',rawOverrideText:'210',rawOverrideSource:'bomOverride',gasketGeometry:{...base.geometry,type:'SHEET_RING'},...changes};return run('buildComponentCostEstimate(input)');};
check('app explicit prices match pure model',()=>near(price().medianTotal,157.5));
check('page pipe factor is never borrowed',()=>assert.equal(price().factor,3));
check('manual factor label is not BOM override',()=>assert.equal(price({rawOverrideSource:'manualOverride'}).manualFactorOverrideApplied,true));
for(const text of ['0.25 IN','1/4 IN','.25 IN'])check('class nominal size independent of pipe OD lookup '+text,()=>{context.sizeText=text;near(run('parseGasketNominalSize(sizeText)'),0.25);});
check('no geometry/factor cannot enable old generic gasket pricing',()=>assert.equal(price({gasketGeometry:{}}).unitCostAllowed,false));
check('reference acceptance required',()=>assert.equal(price({rawOverrideText:''}).unitCostAllowed,false));
check('explicit acceptance enables budget reference',()=>{const p=price({rawOverrideText:'',gasketGeometry:{...base.geometry,type:'SHEET_RING',acceptReferences:'Yes'}});near(p.medianUnitRate,78.75);assert.equal(p.rawRateProvisional,true);});
check('primary override does not override filler/rings',()=>{const p=price({materialText:'SS316L SPR WND + GRAPHITE',rawOverrideText:'370',gasketGeometry:{...spiral,type:'SPIRAL_WOUND',fillerRate:350}});near(p.medianUnitRate,195);near(p.rawSteel,260);});
check('RTJ never automatically uses saved SS strip rate',()=>assert.equal(price({rawOverrideText:'',gasketGeometry:{...base.geometry,type:'RTJ',acceptReferences:'Yes'}}).unitCostAllowed,false));
check('CAF needs actual primary rate',()=>assert.equal(price({rawOverrideText:'',materialText:'IS2712 CAF',gasketGeometry:{...base.geometry,type:'SHEET_RING'}}).unitCostAllowed,false));
check('source review is not bypassed',()=>{const p=price({sourceVerificationStatus:'needs_review'});assert.equal(p.sourceReviewRequired,true);assert.equal(p.unitCostAllowed,false);});
const catalog=context.PIPING_GASKET_CLASS_CATALOG;
check('all 67 classes and 80 gasket rows preserved',()=>{assert.equal(catalog.classes.length,67);assert.equal(catalog.rows.length,80);});
for(const row of catalog.rows){
  check('class boundaries '+row.pipeClass+' '+row.lowSize,()=>{
    const result=engine.resolveClass(catalog,row.pipeClass,row.lowSize,row.material);
    if(row.verificationStatus==='needs_review')assert.equal(result.sourceReviewRequired,true);else assert.ok(result.row||result.error.includes('unique'));
  });
  check('complete test-only weight build for '+row.pipeClass+' '+row.lowSize,()=>{
    const type=engine.identifyType(row.type,row.material);
    const geometry=type==='SPIRAL_WOUND'?{...spiral,type,fillerRate:350}:{...base.geometry,type};
    const p=price({pipeClass:row.pipeClass,sizeText:row.lowSize+' IN',materialText:row.material,rawOverrideText:'100',gasketGeometry:geometry});
    if(row.verificationStatus==='needs_review')assert.equal(p.sourceReviewRequired,true);
    else assert.equal(p.unitCostAllowed,true,p.note);
  });
}
check('F15M is not populated from another class',()=>assert.ok(engine.resolveClass(catalog,'F15M',4,'SS304').error));
check('A4F source review protected',()=>{const row=catalog.rows.find(r=>r.pipeClass==='A4F');assert.equal(engine.resolveClass(catalog,'A4F',row.lowSize,row.material).sourceReviewRequired,true);});
check('exact class material not substituted',()=>{const row=catalog.rows.find(r=>r.pipeClass==='A1A');assert.ok(engine.resolveClass(catalog,row.pipeClass,row.lowSize,'UNKNOWN').error);});
const row={Item:'Gasket',Size:'4 IN',Rating:'150#',Material:'SS304',Quantity:2,UOM:'NOS','Raw Steel Rs/kg Override':210,'Estimate Factor Override':3};
for(const[k,v]of Object.entries({...base.geometry,type:'SHEET_RING'}))if(engine.fields[k])row[engine.fields[k]]=v;
context.row=row;
check('BOM exact optional columns and repricing retained',()=>{
  run("var gasket=buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Quantity',uom:'UOM',rawOverride:'Raw Steel Rs/kg Override',factorOverride:'Estimate Factor Override'},'TEST','test');bomGroupItems.push(gasket);");
  near(run('gasket.componentCost.medianTotal'),157.5);near(run('repriceBomComponentCost(gasket).medianTotal'),157.5);
  assert.equal(run('gasket.gasketGeometry.primaryWeightKg'),'0.1');
});
check('full report audit preserves equation and basis',()=>{assert.match(run('buildComponentRateAuditHtml([gasket])'),/yield 80%/);assert.match(run('buildBomCostReportHtml()'),/78.75/);});
async function main(){
  if(process.argv.includes('--excel')){
    const res=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');if(!res.ok)throw Error('XLSX HTTP '+res.status);run(await res.text());
    check('Excel serialization preserves cost, factor, original weights and yield',()=>{
      const s=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',[gasket]).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()");
      near(s.F6.v,210);near(s.I6.v,26.25);near(s.J6.v,3);near(s.K6.v,78.75);near(s.M6.v,157.5);near(s.N6.v,236.25);near(s.S6.v,0.1);near(s.T6.v,80);near(s.V6.v,0.1);near(s.W6.v,210);
      assert.match(s.K6.f,/J6>0/);assert.match(s.M6.f,/MOD\(G6,1\)=0/);assert.match(s.N6.f,/L6>=1/);assert.match(s.P6.v,/TEST ONLY/);assert.match(s.B11.v,/REPLACES/);
    });
    context.csv=read('Gasket Weight BOM Example.csv');
    check('downloadable CSV example columns align for all three constructions',()=>{
      const rows=run("XLSX.utils.sheet_to_json(XLSX.read(csv,{type:'string'}).Sheets.Sheet1,{defval:''})");
      context.csvHeaders=Object.keys(rows[0]);assert.equal(run('findBomColumn(csvHeaders,bomColumnAliases.thickness)'),'SCH/THK/Rating');
      for(const row of rows){
        assert.equal(row['Gasket Yield %'],80);assert.equal(row['Gasket P90 Ratio'],1.5);assert.match(row['Gasket Calculation Basis'],/DEMONSTRATION/);
        const geometry=Object.fromEntries(Object.entries(engine.fields).map(([key,label])=>[key,row[label]??'']));
        const p=price({materialText:row.Material,rawOverrideText:String(row['Raw Steel Rs/kg Override']),factorOverrideText:String(row['Estimate Factor Override']),gasketGeometry:geometry});
        assert.equal(p.unitCostAllowed,true,p.note);
      }
    });
  }
  console.log(checks+' gasket weight model checks passed. Test assumptions only; no project geometry/rates invented.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
