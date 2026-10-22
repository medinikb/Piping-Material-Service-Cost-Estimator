// Owner-approved price bases, not engineering material substitutions.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map();
const control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=s=>vm.runInContext(s,c);
for(const f of ['special-component-pricing.js','app.js'])run(fs.readFileSync(path.join(root,f),'utf8').split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));
c.materials=JSON.parse(fs.readFileSync(path.join(root,'astm_piping_material_specification_webapp.json')));
run("rawMaterialPriceLibrary=prices.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';elements.spec.value='A106 Gr.B';");
const price=(materialText,extra={})=>{c.input={group:'Pipe Group',item:'PIPE SEAMLESS',standardName:'Pipe',sizeText:'6 IN',thicknessText:'SCH 40',thicknessIsSchedule:true,quantityText:'10',uomText:'M',materialText,...extra};return run('buildComponentCostEstimate(input)');};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const plain=price('A106 Gr.B');assert.equal(plain.rawSteel,56.5);
for(const material of ['IS-1239','IS-1239\u00a0','IS-1239&#xA0;','IS 1239 BLACK','IS-3589 GR.330','IS 3589 GR 330']){
 const p=price(material);assert.equal(p.unitCostAllowed,true,p.note);assert.equal(p.rawSteel,plain.rawSteel);near(p.medianUnitRate,plain.medianUnitRate);
 c.material=material;assert.equal(run('classifyMaterialSpec(material).category'),'Carbon Steel');
}
assert.equal(price('IS-3589 GR.999').unitCostAllowed,false);
assert.equal(price('IS-12390').unitCostAllowed,false);
const lined=price('A106 GR.B+ (RUB LIN)');assert.equal(lined.unitCostAllowed,true,lined.note);assert.equal(lined.rawSteel,56.5);assert.equal(lined.factor,2.3);assert.equal(lined.p90Factor,3.8);assert.match(lined.note,/rubber-lined|rubber.lining/i);
run("elements.coating.value='Yes'");const coated=price('A106 Gr.B');near(lined.medianUnitRate,coated.medianUnitRate);near(lined.p90UnitRate,coated.p90UnitRate);run("elements.coating.value='No'");
const override=price('A106 GR.B+ (RUB LIN)',{rawOverrideText:'100',factorOverrideText:'2'});assert.equal(override.rawSteel,100);assert.equal(override.factor,2);near(override.p90Factor,2*3.8/2.3);
const manual=run("buildEstimate({year:2026,size:6,thickness:7.11,length:10,spec:'A106 GR.B+ (RUB LIN)',coating:'No'})");assert.equal(manual.coating,'Yes');assert.equal(manual.factors.median,2.3);assert.equal(manual.spec,'A106 GR.B+ (RUB LIN)');assert.match(manual.factorBasis,/lining quotation/);
for(const material of ['API 5L GR.B + (RUB LIN)','A106 GR.B + HDPE','A106 GR.B + (RUB LIN) + JACKET','ASTM A105 (RUB LINED)'])assert.equal(price(material).unitCostAllowed,false,material);
const fixture={Item:'PIPE SEAMLESS',Size:'6 IN',Thk:'SCH 40',Material:'A106 GR.B+ (RUB LIN)',Qty:10,UOM:'M'};c.row=fixture;
const bom=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'mapping test','test')");assert.equal(bom.componentCost.factor,2.3);assert.equal(bom.material,fixture.Material);
c.linedRow=bom;
let fittingRow;
for(const item of ['Elbow 45 deg.','Elbow 90 deg.']){
 const base={group:'Fitting Group',item,standardName:item,sizeText:'2 IN',thicknessText:'S40',thicknessIsSchedule:true,uomText:'Nos',quantityText:item.includes('45')?'4':'20'};
 const plainFitting=price('ASTM A234 GR.WPB',base);
 for(const material of ['ASTM A 234 GR.WPB (RUB)','A234 WPB (RUB LIN)','ASTM A234 GR.WPB (RUBBER LINED)']){
  const fitted=price(material,base);assert.equal(fitted.unitCostAllowed,true,fitted.note);assert.equal(fitted.rawSteel,56.5);
  near(fitted.medianUnitRate,plainFitting.medianUnitRate*2.3/1.8);near(fitted.p90UnitRate,plainFitting.p90UnitRate*3.8/2.7);
  near(fitted.factor,plainFitting.factor*2.3/1.8);assert.match(fitted.rawMaterialBasis,/uplift applied once/);
  run("elements.coating.value='Yes'");const yes=price(material,base);near(yes.medianUnitRate,fitted.medianUnitRate);near(yes.p90UnitRate,fitted.p90UnitRate);run("elements.coating.value='No'");
 }
 const custom=price('ASTM A 234 GR.WPB (RUB)',{...base,rawOverrideText:'100',factorOverrideText:'3'});assert.equal(custom.factor,3);assert.equal(custom.rawSteel,100);
 const expected=plainFitting.medianUnitRate/56.5*100/plainFitting.factor*3;near(custom.medianUnitRate,expected);
 c.row={Item:item,Size:'2 IN',Thk:'S40',Material:'ASTM A 234 GR.WPB (RUB)',Qty:base.quantityText,UOM:'Nos'};
 fittingRow=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'fitting mapping test','test')");assert.equal(fittingRow.componentCost.unitCostAllowed,true,fittingRow.componentCost.note);assert.equal(fittingRow.material,c.row.Material);
}
c.fittingRow=fittingRow;
c.flangeModel=JSON.parse(fs.readFileSync(path.join(root,'flange-weight-3-input-model-v2.json')));run("flangeWeightModel=flangeModel;flangeWeightModelStatus='loaded';");
let flangeRow;
for(const item of ['Blind Flange','Weld Neck Flange','Slip On Flange']){
 const base={group:'Flange Group',item,standardName:item,sizeText:'2 IN',thicknessText:'150#',thicknessIsSchedule:false,quantityText:'1',uomText:'Nos'};
 const unlined=price('ASTM A105',base);assert.equal(unlined.unitCostAllowed,true,unlined.note);
 for(const material of ['ASTM A 105 (RUB LINED)','A105 (RUB)','A105 (RUB LIN)','ASTM A105 (RUBBER LINED)']){
  const cost=price(material,base);assert.equal(cost.unitCostAllowed,true,cost.note);assert.equal(cost.rawSteel,56.5);
  assert.equal(cost.flangeWeightKg,unlined.flangeWeightKg);near(cost.medianUnitRate,unlined.medianUnitRate*2.3/1.8);near(cost.p90UnitRate,unlined.p90UnitRate*3.8/2.7);
  assert.match(cost.note,/uplift applied once/);run("elements.coating.value='Yes'");const yes=price(material,base);near(yes.medianUnitRate,cost.medianUnitRate);near(yes.p90UnitRate,cost.p90UnitRate);run("elements.coating.value='No'");
 }
 const custom=price('ASTM A105 (RUB LINED)',{...base,rawOverrideText:'100',factorOverrideText:'3'});assert.equal(custom.rawSteel,100);assert.equal(custom.factor,3);near(custom.medianUnitRate,unlined.medianUnitRate/56.5*100/unlined.factor*3);
 c.row={Item:item,Size:'2 IN',Thk:'150#',Material:'ASTM A 105 (RUB LINED)',Qty:1,UOM:'Nos'};
 flangeRow=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'flange mapping test','test')");assert.equal(flangeRow.componentCost.unitCostAllowed,true,flangeRow.componentCost.note);assert.equal(flangeRow.material,c.row.Material);
}
c.flangeRow=flangeRow;
for(const material of ['A105 (RUB LINED) + HDPE','A105 (RUB LINED) + JACKET','A105N (RUB LINED)','A105XXX (RUB LINED)'])assert.equal(price(material,{group:'Flange Group',item:'Blind Flange',standardName:'Blind Flange',thicknessText:'150#'}).unitCostAllowed,false,material);
assert.equal(price('A105 (RUB LINED)',{group:'Flange Group',item:'Blind Flange',standardName:'Blind Flange',sourceVerificationStatus:'needs_review'}).unitCostAllowed,false);
for(const material of ['A234 WPB (RUB) + HDPE','A234 WPB (RUB) + JACKET','A234 WP11 (RUB)','A234 WPBXXX (RUB)'])assert.equal(price(material,{group:'Fitting Group',item:'Elbow 90 deg.',standardName:'Elbow 90 deg.'}).unitCostAllowed,false,material);
async function main(){if(process.argv.includes('--excel')){
 const r=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(r.ok);run(await r.text());
 const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Pipe Group',[linedRow]).sheet,'Pipe Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Pipe Group'];})()");
 assert.equal(sheet.F6.v,56.5);assert.equal(sheet.J6.v,2.3);assert.match(JSON.stringify(sheet),/rubber-lined|rubber.lining/i);
 const fittingSheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Fitting Group',[fittingRow]).sheet,'Fitting Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Fitting Group'];})()");
 assert.equal(fittingSheet.F6.v,56.5);near(fittingSheet.J6.v,fittingRow.componentCost.factor);assert.match(JSON.stringify(fittingSheet),/coating.*uplift|rubber-lined/i);assert.ok(fittingSheet.K6.f);
 const flangeSheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Flange Group',[flangeRow]).sheet,'Flange Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Flange Group'];})()");
 assert.equal(flangeSheet.F6.v,56.5);near(flangeSheet.J6.v,flangeRow.componentCost.factor);assert.match(JSON.stringify(flangeSheet),/uplift applied once/);assert.ok(flangeSheet.K6.f);
}console.log('CS pipe mappings, coated allowance, overrides, BOM and requested Excel checks passed.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
