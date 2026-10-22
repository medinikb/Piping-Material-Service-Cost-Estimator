const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map(),control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array}),run=s=>vm.runInContext(s,c);
for(const f of ['special-component-pricing.js','app.js'])run(fs.readFileSync(path.join(root,f),'utf8').split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));c.materials=JSON.parse(fs.readFileSync(path.join(root,'astm_piping_material_specification_webapp.json')));
run("rawMaterialPriceLibrary=prices.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';elements.spec.value='A106 Gr.B';");
const price=(materialText,extra={})=>{c.input={group:'Fitting Group',item:'HALF COUPLING',standardName:'Half Coupling',sizeText:'0.5"',thicknessText:'3000#',quantityText:8,uomText:'NOS',materialText,...extra};return run('buildComponentCostEstimate(input)');};
const equalCosts=(a,b)=>{for(const key of ['rawSteel','factor','pressureMultiplier','medianUnitRate','p90UnitRate','medianTotal','p90Total'])assert.equal(a[key],b[key],key);};
let checks=0;const exported=[];
for(const mode of ['loaded','backup']){
 if(mode==='backup')run('materialSpecificationRows=prepareMaterialSpecificationRows(builtInMaterialSpecificationRows);rawMaterialPriceLibrary=builtInRawMaterialPriceLibrary;');
 for(const [item,sizeText,quantityText]of [['HALF COUPLING','0.5"',8],['FULL COUPLING','3/4"',20],['HALF COUPLING','3/4"',4],['HALF COUPLING','1.5"',4]]){
  const extra={item,standardName:item,sizeText,quantityText},expected=price('ASTM A105',extra);
  for(const alias of ['ASTM 105','astm 105','ASTM\u00a0105']){const actual=price(alias,extra);assert.equal(actual.unitCostAllowed,true,actual.note);equalCosts(actual,expected);c.alias=alias;assert.equal(run('classifyMaterialSpec(alias).category'),'Carbon Steel');checks++;}
  c.row={Item:item,Size:sizeText,Thk:'3000#',Material:'ASTM 105',Qty:quantityText,UOM:'NOS'};
  const imported=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'ASTM105 alias test','test')");assert.equal(imported.material,'ASTM 105');equalCosts(imported.componentCost,expected);c.imported=imported;equalCosts(run('repriceBomComponentCost(imported)'),expected);exported.push(imported);
 }
 for(const text of ['ASTM 1050','ASTM 105N','ASTM 106','105']){c.alias=text;assert.equal(run('getRawMaterialPriceMapping(alias)'),null,text);}
 const overridden=price('ASTM 105',{rawOverrideText:'100',factorOverrideText:'0.5'});equalCosts(overridden,price('ASTM A105',{rawOverrideText:'100',factorOverrideText:'0.5'}));
 assert.equal(price('ASTM 105',{sourceVerificationStatus:'needs_review'}).sourceReviewRequired,true);
}
async function main(){if(process.argv.includes('--excel')){
 const r=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(r.ok);run(await r.text());c.exported=exported;
 const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Fitting Group',exported).sheet,'Fitting Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Fitting Group'];})()");
 assert.match(JSON.stringify(sheet),/ASTM 105/);for(let i=0;i<exported.length;i++){assert.equal(sheet['F'+(i+6)].v,exported[i].componentCost.rawSteel);assert.ok(sheet['K'+(i+6)].f);}
}console.log(checks+' ASTM105 alias pricing combinations passed; formulas/factors unchanged, original BOM text retained.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
