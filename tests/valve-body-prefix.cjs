// Parsing-only fix: decorated valve descriptions must equal bare-body pricing.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map(),control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array}),run=s=>vm.runInContext(s,c);
for(const f of ['special-component-pricing.js','app.js'])run(fs.readFileSync(path.join(root,f),'utf8').split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));c.materials=JSON.parse(fs.readFileSync(path.join(root,'astm_piping_material_specification_webapp.json')));
run("rawMaterialPriceLibrary=prices.raw_material_price_library;materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';elements.spec.value='A106 Gr.B';");
const price=input=>{c.input=input;return run('buildComponentCostEstimate(input)');};
const same=(a,b)=>{for(const key of ['rawSteel','factor','medianUnitRate','p90UnitRate','medianTotal','p90Total','pressureMultiplier','size'])assert.equal(a[key],b[key],key);};
let checks=0;const exampleRows=[];
for(const item of ['GATE VALVE','GLOBE VALVE'])for(const sizeText of ['1.1/2"','3/4"','1/2"'])for(const suffix of ['HF','13CR']){
 const base={group:'Valves Group',item,standardName:item,sizeText,thicknessText:'800#',quantityText:2,uomText:'NOS'};
 const plain=price({...base,materialText:'A105'}),decorated=price({...base,materialText:'BB, OS& Y, A105/ '+suffix});
 assert.equal(decorated.unitCostAllowed,true,decorated.note);same(decorated,plain);assert.equal(decorated.pressureClass,'800');
 c.material='BB, OS& Y, A105/ '+suffix;assert.equal(run('classifyMaterialSpec(material).category'),'Carbon Steel');checks++;
 c.row={Item:item,Size:sizeText,Thk:'800#',Material:c.material,Qty:2,UOM:'NOS'};
 const bom=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'body-prefix test','test')");same(bom.componentCost,plain);assert.equal(bom.material,c.material);c.imported=bom;same(run('repriceBomComponentCost(imported)'),plain);exampleRows.push(bom);
}
assert.equal(run("getPressureMultiplier('800','Valves Group')"),1); // Existing fallback, deliberately unchanged.
for(const materialText of ['BB, OS&Y, A999/13CR','UNKNOWN, A105/HF','BB, OS&Y, A105/RUB LIN'])assert.equal(price({group:'Valves Group',item:'GATE VALVE',sizeText:'1 IN',thicknessText:'800#',materialText,quantityText:2,uomText:'NOS'}).unitCostAllowed,false);
async function main(){
 if(process.argv.includes('--excel')||process.argv.includes('--folder')){
  const r=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(r.ok);run(await r.text());
 }
 if(process.argv.includes('--folder')){
  let count=0;const folder=path.join(root,'Testing_CS pipe predictor');
  for(const file of fs.readdirSync(folder).filter(f=>/\.xlsx$/i.test(f))){
   c.bytes=new Uint8Array(fs.readFileSync(path.join(folder,file)));run("var book=XLSX.read(bytes,{type:'array',raw:true})");
   const rows=run('worksheetToBomRows(book.Sheets[book.SheetNames[0]])');if(!rows.length)continue;c.headers=Object.keys(rows[0]);c.cols=run("Object.fromEntries(Object.entries(bomColumnAliases).map(([k,a])=>[k,findBomColumn(headers,a)]))");
   for(const row of rows){c.row=row;if(!/^\s*BB\s*,\s*OS\s*&\s*Y\s*,/i.test(String(row[c.cols.spec]||'')))continue;
    const item=run("buildBomGroupItem(row,cols,'actual valve upload','test')");if(item.group!=='Valves Group')continue;
    assert.equal(item.componentCost.unitCostAllowed,true,file+': '+item.componentCost.note);c.body=run('getPrimaryMaterialText(row[cols.spec])');
    const plain=price({group:item.group,item:item.item,standardName:item.standardName,sizeText:item.size,thicknessText:item.thickness,materialText:c.body,quantityText:item.quantity,uomText:item.uom});same(item.componentCost,plain);count++;
   }
  }assert.ok(count>0);console.log('Actual construction-prefix valve rows priced: '+count);
 }
 if(process.argv.includes('--excel')){
  c.examples=exampleRows;const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Valves Group',examples).sheet,'Valves Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Valves Group'];})()");
  for(let i=0;i<exampleRows.length;i++){assert.equal(sheet['F'+(i+6)].v,exampleRows[i].componentCost.rawSteel);assert.ok(sheet['K'+(i+6)].f);}assert.match(JSON.stringify(sheet),/BB, OS& Y, A105/);
 }console.log(checks+' decorated valve combinations match bare-A105 calculation exactly.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
