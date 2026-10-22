const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),controls=new Map(),control=id=>{if(!controls.has(id))controls.set(id,{value:'',dataset:{},querySelectorAll:()=>[]});return controls.get(id);};
const c=vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array}),run=s=>vm.runInContext(s,c);
for(const f of ['bolting-stock-prices.bundle.js','special-component-pricing.js','gasket-weight-pricing.js','gasket-class-catalog.bundle.js','gasket-budget-library.bundle.js','gasket-budget-pricing.js','app.js'])run(fs.readFileSync(path.join(root,f),'utf8').split('\npopulateSizeOptions();')[0]);
c.prices=JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));run("rawMaterialPriceLibrary=prices.raw_material_price_library;elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';");
const fixtures=[
 ['GASKET','2"','150#','SP.WND SS316+GRAFIL, THK.2MM'],
 ['Gasket','2"','150#','Nonasbestos BS7531,2MM,RING'],
 ['Gasket (SPIRAL)','3/4"','5MM','SS304 SPR.WND + CA FIL'],
 ['Gasket','.5 "','150#','SP.WND SS316 + GRAFIL'],
 ['Gasket','4"','150#','SS304 SPR.WND + CA FIL'],
 ['Gasket','3/4"','-','SP.WND SS316+GRAFIL'],
 ['GASKET','1"','-','IS-2712-GR.W/3, 2MM THK.'],
 ['GASKET','3/4"','-','IS-2712-GR.W/3, 2MM THK.'],
 ['Gasket','1.1/2"','600#','SPIRAL WOUND (32TB), 4.5 T'],
 ['Gasket','1/2"','600#','SPIRAL WOUND (32TB), 4.5 T'],
 ['GASKET, SPIRAL','1"','05MM','SS304 SP. WND+CA FIL'],
 ['Gasket (Spiral wound)','3/4"','150#','SS316 SPIRAL WND +GRAFIL'],
 ['Gasket (Spiral wound)','1"','5 mm','SS316 SPIRAL WND +GRAFIL'],
 ['GASKET, SPIRAL','1.5"','150#','SP.WND SS316+CAF'],
 ['GASKET','1.1/2"','150#','SP.WND SS316+GRAFIL']
];
const results=[];
// Two apostrophes in Excel look like a double quote in a screenshot.
for(const fixture of [...fixtures])fixtures.push([fixture[0],fixture[1].replace(/"/g,"''"),fixture[2],fixture[3]]);
fixtures.push(['Gasket',"8''",'150#','SS316 SPR.WND + GRAFIL']);
fixtures.push(['Gasket',"6''",'150#','SS316 SPR.WND + GRAFIL']);
for(const [text,expected]of [["1.1/2''",1.5],["3/4''",.75],[".5 ''",.5],["2’′",2],["2′′",2],["2 ' '",2]]){c.text=text;assert.equal(run('parseGasketNominalSize(text)'),expected);}
for(const [text,expected]of [['1.1/2"',1.5],['1 1/2"',1.5],['3/4"',.75],['.5 "',.5]]){c.text=text;assert.equal(run('parseGasketNominalSize(text)'),expected);}
for(const [item,size,thickness,material]of fixtures){
 c.row={Item:item,Size:size,Thk:thickness,Material:material,Qty:4,UOM:'Nos'};
 const result=run("buildBomGroupItem(row,{item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM'},'screenshot regression','test')");
 if(process.argv.includes('--diagnose')){console.log(JSON.stringify({size,material,reason:result?.componentCost?.note}));continue;}
 assert.equal(result.componentCost.unitCostAllowed,true,result.componentCost.note);assert.ok(result.componentCost.medianTotal>0);assert.equal(result.material,material);assert.equal(result.size,size);
 results.push(result);
}
if(!process.argv.includes('--diagnose')){
 assert.match(results[1].componentCost.note,/not asbestos composition/);assert.equal(results[1].componentCost.gasketDimensions.thicknessMm,2);
 assert.match(results[8].componentCost.note,/Unverified 32TB/);assert.equal(results[8].componentCost.factor,1.8);
 assert.equal(results[6].componentCost.gasketDimensions.thicknessMm,2);
 assert.match(results[2].componentCost.note,/winding thickness=5 mm/);
 assert.match(results[2].componentCost.note,/Assumed pressure class 300 using owner rule for 5 mm gasket/);
 assert.match(results[0].componentCost.note,/winding thickness=2 mm/);
 assert.match(results[5].componentCost.note,/Assumed pressure class 150/);
 c.row={Item:'GASKET, SPIRAL',Size:'2"',Thk:'5MM THK',Material:'SS304 SP. WND+CA FIL',Qty:8,UOM:'Nos'};
 c.cols={item:'Item',size:'Size',thickness:'Thk',spec:'Material',length:'Qty',uom:'UOM',defaultPipeClass:'A33A'};
 const advisory=run("buildBomGroupItem(row,cols,'document-class regression','test')");assert.equal(advisory.pipeClassSource,'document');assert.equal(advisory.componentCost.unitCostAllowed,true);assert.match(advisory.componentCost.gasketClassWarning,/A33A.*advisory/);assert.match(advisory.componentCost.note,/Assumed pressure class 300/);
 c.row.Class='A33A';c.cols.pipeClass='Class';const explicitClass=run("buildBomGroupItem(row,cols,'explicit-class regression','test')");assert.equal(explicitClass.pipeClassSource,'row');assert.equal(explicitClass.componentCost.unitCostAllowed,false);
 c.row.Status='needs_review';c.cols.sourceVerificationStatus='Status';assert.equal(run("buildBomGroupItem(row,cols,'source-flag regression','test').componentCost.sourceReviewRequired"),true);
 c.input={group:'Gasket Group',item:'Gasket',materialText:'SS304',sizeText:'2 IN',thicknessText:'150#',quantityText:1,uomText:'Nos',pipeClass:'A4F',pipeClassSource:'document'};assert.equal(run('buildComponentCostEstimate(input).sourceReviewRequired'),true);
 for(const thicknessText of ['5MM','5 MM','05MM','5.0 mm'])for(const sizeText of ['1"','2"','4"']){
  c.input={group:'Gasket Group',item:'GASKET, SPIRAL',sizeText,thicknessText,materialText:'SS304 SP. WND+CA FIL',quantityText:12,uomText:'NOS'};
  const assumed=run('buildComponentCostEstimate(input)');assert.equal(assumed.unitCostAllowed,true,assumed.note);assert.match(assumed.note,/Assumed pressure class 300/);assert.equal(assumed.factor,1.8);assert.match(assumed.note,/winding thickness=5 mm/);
  c.input.thicknessText='300#';c.input.materialText='SS304 SP. WND+CA FIL, THK.5MM';const explicit=run('buildComponentCostEstimate(input)');assert.ok(Math.abs(assumed.medianUnitRate-explicit.medianUnitRate)<1e-8);
  c.input.thicknessText='150#';assert.doesNotMatch(run('buildComponentCostEstimate(input).note'),/Assumed pressure class 300/);
 }
 for(const [material,pressure]of [['SS347','150#'],['SS304','999#'],['SPIRAL WOUND (32TB) SS347','150#']]){
  c.input={group:'Gasket Group',item:'Gasket (SPIRAL)',materialText:material,sizeText:'2 IN',thicknessText:pressure,quantityText:1,uomText:'Nos'};assert.equal(run('buildComponentCostEstimate(input).unitCostAllowed'),false);
 }
}
async function main(){if(process.argv.includes('--excel')){
 const r=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');assert.ok(r.ok);run(await r.text());c.rows=results;
 const sheet=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildEditableComponentSheet('Gasket Group',rows).sheet,'Gasket Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Gasket Group'];})()");
 assert.match(JSON.stringify(sheet),/Nonasbestos/);assert.match(JSON.stringify(sheet),/Assumed pressure class/);
}console.log('Screenshot gasket text cases passed: '+results.length);}
main().catch(e=>{console.error(e);process.exitCode=1;});
