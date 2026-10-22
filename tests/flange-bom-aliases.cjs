// Read-only in-memory BOM/report checks. No source or workbook writes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map();
const element=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:element,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=s=>vm.runInContext(s,c),read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of ['special-component-pricing.js','app.js'])run(read(f).split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(read('raw_material_price_library.json'));c.materials=JSON.parse(read('astm_piping_material_specification_webapp.json'));c.flanges=JSON.parse(read('flange-weight-3-input-model-v2.json'));
run("rawMaterialPriceLibrary=prices.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);flangeWeightModel=flanges;elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';elements.spec.value='A106 Gr.B';");
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const make=(name,size='2 IN',quantity=1)=>{c.row={Item:name,Size:size,Rating:'150#',Material:'ASTM A105',Qty:quantity,UOM:'NOS'};return run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Qty',uom:'UOM'},'Flange alias test','test')");};
const cases=[['FLANGE,SW','Socket Weld Flange','1 IN',24],['FLANGE,SO','Slip-On Flange','2 IN',16],['FLANGE,SO','Slip-On Flange','4 IN',6],['FLANGE,BLIND','Blind Flange','3 IN',1],['FLANGE,WN','Weld Neck Flange','2 IN',1],['FLG SO','Slip-On Flange','2 IN',1],['FLANGE,S.W.','Socket Weld Flange','1 IN',1],['FLANGE,S.O.','Slip-On Flange','2 IN',1],['FLANGE,W.N.','Weld Neck Flange','2 IN',1]];
const exported=[];
for(const [alias,canonical,size,qty]of cases){
 const row=make(alias,size,qty),base=make(canonical,size,qty),a=row.componentCost,b=base.componentCost;
 assert.equal(row.standardName,canonical,alias);assert.equal(row.item,alias);assert.equal(row.material,'ASTM A105');assert.equal(a.unitCostAllowed,true,a.note);assert.ok(a.medianUnitRate>0);assert.equal(a.rawSteel,56.5);
 near(a.medianUnitRate,b.medianUnitRate);near(a.p90UnitRate,b.p90UnitRate);near(a.medianTotal,a.medianUnitRate*qty);assert.equal(a.factor,b.factor);
 c.input={group:'Flange Group',item:alias,sizeText:size,thicknessText:'150#',materialText:'ASTM A105',quantityText:String(qty),uomText:'NOS'};
 near(run('buildComponentCostEstimate(input).medianUnitRate'),b.medianUnitRate);
 if(alias.includes('SW'))assert.match(a.note,/fallback/i); // No new SW weight formula is implied.
 exported.push(row);
}
for(const name of ['SPCR & BLN','Flange Unknown Custom'])assert.equal(make(name).componentCost.unitCostAllowed,false,name);
c.exported=exported;
async function main(){if(process.argv.includes('--excel')){
 const response=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(response.ok);run(await response.text());
 const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Flange Group',exported).sheet,'Flange Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Flange Group'];})()");
 for(let i=0;i<exported.length;i++){const n=i+6;assert.equal(sheet['F'+n].v,56.5);near(sheet['J'+n].v,exported[i].componentCost.factor);assert.ok(sheet['K'+n].f);}
 assert.match(JSON.stringify(sheet),/FLANGE,SO/);assert.match(JSON.stringify(sheet),/FLANGE,BLIND/);
}console.log('Flange alias BOM, direct input, price parity, safeguards and requested Excel checks passed ('+cases.length+' alias scenarios).');}
main().catch(e=>{console.error(e);process.exitCode=1;});
