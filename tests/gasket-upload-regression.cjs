// Read-only diagnosis of local BOMs through the real workbook/header importer.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map();
const control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run=s=>vm.runInContext(s,c);
for(const f of ['bolting-stock-prices.bundle.js','special-component-pricing.js','gasket-weight-pricing.js','gasket-class-catalog.bundle.js','gasket-budget-library.bundle.js','gasket-budget-pricing.js','app.js'])run(fs.readFileSync(path.join(root,f),'utf8').split('\npopulateSizeOptions();')[0]);
c.data=JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));run("rawMaterialPriceLibrary=data.raw_material_price_library;elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';");
async function main(){
 const response=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(response.ok);run(await response.text());
 const requested=process.argv.slice(2).filter(s=>!s.startsWith('--'));
 const files=requested.length?requested.flatMap(f=>fs.statSync(f).isDirectory()?fs.readdirSync(f).filter(n=>/\.xlsx$/i.test(n)).map(n=>path.join(f,n)):[f]):fs.readdirSync(root).filter(f=>/\.xlsx$/i.test(f)&&!/cost-estimate|raw_material|service|Factor_Master|Register|Pipe_Data/i.test(f)).map(f=>path.join(root,f));
 let total=0,ready=0;const pricedItems=[];
 for(const file of files){
  c.bytes=new Uint8Array(fs.readFileSync(file));run("var uploadBook=XLSX.read(bytes,{type:'array',raw:true})");const sheets=run('uploadBook.Sheets');
  const defaultPipeClass=run('extractBomPmsClass(uploadBook)');
  for(const [name,sheet]of Object.entries(sheets)){
   c.sheet=sheet;const rows=run('worksheetToBomRows(sheet)');if(!rows.length)continue;c.headers=Object.keys(rows[0]);
   const cols=run("Object.fromEntries(Object.entries(bomColumnAliases).map(([k,a])=>[k,findBomColumn(headers,a)]))");
   cols.defaultPipeClass=defaultPipeClass; c.cols=cols;
   const gasketRows=[];
   for(const row of rows){c.row=row;const group=run('classifyBomGroup(row[cols.item]).group');if(group!=='Gasket Group')continue;
    c.cols={...cols};const item=run("buildBomGroupItem(row,cols,'upload regression','test')");const cost=item.componentCost;total++;if(cost.unitCostAllowed){ready++;pricedItems.push(item);c.importedItem=item;const refreshed=run('repriceBomComponentCost(importedItem)');assert.equal(refreshed.unitCostAllowed,true);assert.ok(Math.abs(refreshed.medianUnitRate-cost.medianUnitRate)<1e-8);assert.equal(refreshed.gasketClassWarning,cost.gasketClassWarning);}
    gasketRows.push({size:item.size,rating:item.thickness,material:item.material,priced:cost.unitCostAllowed,geometry:item.gasketGeometry,reason:cost.reviewMessage||cost.note?.match(/Review required:.*$/)?.[0],pipeClass:item.pipeClass});
   }
   if(gasketRows.length)console.log(JSON.stringify({file:path.basename(file),sheet:name,count:gasketRows.length,ready:gasketRows.filter(r=>r.priced).length,review:gasketRows.filter(r=>!r.priced)}));
  }
 }
 if(requested.some(p=>path.basename(path.resolve(p))==='Testing_CS pipe predictor')){assert.equal(total,60);assert.equal(ready,60);}
 if(process.argv.includes('--excel')){
  c.pricedItems=pricedItems;const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',pricedItems).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()");
  for(let i=0;i<pricedItems.length;i++){const row=i+6;assert.equal(typeof sheet['J'+row].v,'number');assert.ok(sheet['K'+row].f);assert.ok(Number.isFinite(pricedItems[i].componentCost.medianTotal));}
  if(pricedItems.some(i=>i.componentCost.gasketClassWarning))assert.match(JSON.stringify(sheet),/Document PMS.*advisory/);
  console.log('All priced rows retained in Excel with numeric factors, formulas and class-warning audit.');
 }
 console.log(JSON.stringify({total,ready,review:total-ready}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
