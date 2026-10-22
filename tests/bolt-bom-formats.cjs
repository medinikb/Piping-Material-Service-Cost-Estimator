const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map();
const control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=s=>vm.runInContext(s,c),read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of ['special-component-pricing.js','app.js'])run(read(f).split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(read('raw_material_price_library.json'));c.materials=JSON.parse(read('astm_piping_material_specification_webapp.json'));
run("rawMaterialPriceLibrary=prices.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';");
const rows=[];
for(const [material,size,thickness,stud,nut]of [
 ['A193 GR.B7/A194 GRE. 2H','M16 X 100','150#',90,70],
 ['Bolt A 193 Gr B7, Nut A194 Gr 2H','M12 X 65','-',90,70],
 ['A193 GR. B7 / A194 GR. 2H',',M16 X 85L','-',90,70],
 ['A193 GR. B7 / A194 GR. 2H','2 IN','M16 X 85L',90,70],
 ['Bolt A 193 Gr B7M, Nut A194 Gr 2HM','M12X65','-',90,70],
 ['A193 GR.B16/A194 GR.4','M16x75','-',80,65],
 ['A193 GR.B7 / A194 GR.2H','M 14 X 70L','150#',90,70],
 ['BOLT:A307 GR B,NUT:A307 GR.B','M16x90','-',65,65],
 ['A307 GR.B / A307 GR.B','M14 X 65L','-',65,65],
 ['A307GR.B / A307GR.B','M16 X 90L','150#',65,65],
 ['A 320GR.L7 / A 194GR.4','M 14 X 70L','-',90,65]
]){
 c.row={Item:'STUD AND NUTS',Size:size,Rating:thickness,Material:material,Qty:32,UOM:'Nos'};
 const row=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Rating',spec:'Material',length:'Qty',uom:'UOM'},'Bolt format test','test')"),p=row.componentCost;
 assert.equal(p.unitCostAllowed,true,p.note);assert.equal(p.studRawSteel,stud);assert.equal(p.nutRawSteel,nut);assert.equal(p.factor,2.5);assert.equal(p.numberOfNuts,2);
 assert.ok(Math.abs(p.medianUnitRate-(p.studMassKg*stud+p.totalNutMassKg*nut)*2.5)<1e-8);
 assert.equal(row.material,material);assert.equal(row.size,size);assert.ok(p.medianTotal>0);assert.equal(p.medianTotal,p.medianUnitRate*32);if(size==='2 IN')assert.match(p.note,/read from Rating/);
 rows.push(row);
}
for(const material of ['A193 B70 / A194 2H','A193 B7 / A194 2HM','A193 B7M / A194 2H','A193 B7X / A194 2H','A320 L7M / A194 4','A320 L7X / A194 4','A307 B / A307 A','A307 B / A194 2H']){
 c.material=material;const p=run("buildComponentCostEstimate({group:'Bolt Group',item:'Stud with Nuts',sizeText:'M16 X 85L',materialText:material,quantityText:'1',uomText:'NOS'})");assert.equal(p.unitCostAllowed,false,material);
}
c.rows=rows;
for(const material of ['A307 B / A307 B','A320 L7 / A194 4']){
 c.material=material;
 const p=run("buildComponentCostEstimate({group:'Bolt Group',item:'STUD & NUT',sizeText:'M14 X 65L',materialText:material,quantityText:'32',uomText:'NOS',rawOverrideText:'100',factorOverrideText:'3'})");
 assert.equal(p.numberOfNuts,1);assert.equal(p.factor,3);assert.equal(p.studRawSteel,100);assert.equal(p.nutRawSteel,100);assert.ok(Math.abs(p.medianUnitRate-p.massPerUnitKg*100*3)<1e-8);
 const blocked=run("buildComponentCostEstimate({group:'Bolt Group',item:'STUD & NUT',sizeText:'M14 X 65L',materialText:material,quantityText:'32',uomText:'NOS',sourceVerificationStatus:'needs_review',rawOverrideText:'100',factorOverrideText:'3'})");assert.equal(blocked.sourceReviewRequired,true);assert.equal(blocked.unitCostAllowed,false);
}
async function main(){if(process.argv.includes('--excel')){const r=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(r.ok);run(await r.text());const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Bolt Group',rows).sheet,'Bolt Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Bolt Group'];})()");for(let i=0;i<rows.length;i++){assert.equal(sheet['J'+(i+6)].v,2.5);assert.ok(sheet['K'+(i+6)].f);assert.ok(sheet['M'+(i+6)].v>0);}assert.match(JSON.stringify(sheet),/Rating\/Thk/);}
console.log('Screenshot bolt formats, separate rates, no grade substitution, BOM and requested Excel checks passed.');}
main().catch(e=>{console.error(e);process.exitCode=1;});
