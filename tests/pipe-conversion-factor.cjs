// Read-only checks of actual pipe conversion factors and their report/Excel display.
// Run: node tests/pipe-conversion-factor.cjs [--excel]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const controls = new Map();
const control = id => {
  if (!controls.has(id)) controls.set(id, {value:'',dataset:{},innerHTML:'',textContent:'',classList:{toggle(){}},querySelectorAll:()=>[]});
  return controls.get(id);
};
const context = vm.createContext({console,window:{},document:{querySelector:control,querySelectorAll:()=>[]},ArrayBuffer,Uint8Array});
const run = text => vm.runInContext(text,context);
run(fs.readFileSync(path.join(root,'special-component-pricing.js'),'utf8'));
run(fs.readFileSync(path.join(root,'app.js'),'utf8').split('\npopulateSizeOptions();')[0]);
context.prices = JSON.parse(fs.readFileSync(path.join(root,'raw_material_price_library.json')));
context.materials = JSON.parse(fs.readFileSync(path.join(root,'astm_piping_material_specification_webapp.json')));
run(`rawMaterialPriceLibrary=prices.raw_material_price_library;
materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
elements.year.value='2026';elements.factorOverride.value='';elements.coating.value='No';elements.spec.value='A106 Gr.B';
elements.projectDescription.value='Factor regression';elements.projectNumber.value='TEST';elements.designTemperature.value='';`);
let checks=0;
const check=(label,fn)=>{try{fn();checks++;}catch(e){e.message=label+': '+e.message;throw e;}};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const options={group:'Pipe Group',item:'PIPE SEAMLESS',standardName:'Pipe',sizeText:'6 IN',thicknessText:'XXS',materialText:'A 312 TP 321(SHTP)',quantityText:'60',uomText:'M',thicknessIsSchedule:true};
const price=changes=>{context.options={...options,...changes};return run('buildComponentCostEstimate(options)');};
const first=price({});
check('6 IN screenshot rate unchanged, actual factors recorded',()=>{
  assert.equal(first.factor,1.8);assert.equal(first.p90Factor,2.7);assert.equal(first.componentFactor,1);
  close(first.medianUnitRate,40606.74975730149);close(first.medianTotal,2436404.9854380894);
  context.cost=first;assert.equal(run('formatComponentFactor(cost)'),'1.80 / 2.70');
});
const second=price({item:'PIPE E.F.S.W.',sizeText:'8 IN',thicknessText:'S160',materialText:'A 358 GR321 CL.1(SHTP)',quantityText:'24'});
check('8 IN screenshot rate unchanged',()=>{
  assert.equal(second.factor,1.8);assert.equal(second.p90Factor,2.7);
  close(second.medianUnitRate,57035.209740282124);close(second.medianTotal,1368845.033766771);
});
for(const [override,normal,p90] of [['1.3',1.3,1.95],['2',2,3],['',1.8,2.7],['0',1.8,2.7],['-1',1.8,2.7]]){
  const cost=price({factorOverrideText:override,rawOverrideText:'100'});
  check('BOM override '+JSON.stringify(override)+' shown without double application',()=>{
    assert.equal(cost.factor,normal);close(cost.p90Factor,p90);
    close(cost.medianUnitRate,0.0246615*(168.3-21.95)*21.95*100*normal);
    close(cost.p90UnitRate,0.0246615*(168.3-21.95)*21.95*100*p90);
    assert.equal(cost.factorOverrideApplied,Number(override)>0);
  });
}
run("elements.coating.value='Yes'");
const coated=price({});
check('coated-pipe factors preserved, not forced to non-coated defaults',()=>{assert.equal(coated.factor,2.3);assert.equal(coated.p90Factor,3.8);});
run("elements.coating.value='No';elements.factorOverride.value='2'");
const pageOverride=price({});
check('page-level factor override reflected accurately',()=>{assert.equal(pageOverride.factor,2);assert.equal(pageOverride.p90Factor,3);});
run("elements.factorOverride.value=''");
check('manual pipe uses same paired convention',()=>{
  const cost=run("buildManualPipeGroupItem(buildEstimate({year:2026,size:6,thickness:21.95,length:60,spec:'A312 TP321',coating:'No'})).componentCost");
  assert.equal(cost.factor,1.8);assert.equal(cost.p90Factor,2.7);
});
const valve=price({group:'Valves Group',item:'Gate Valve',standardName:'Gate Valve',sizeText:'4 IN',thicknessText:'150#',materialText:'A216 WCB',quantityText:'2'});
context.valve=valve;
check('non-pipe factors retain their single-value convention',()=>{assert.equal(valve.p90Factor,null);assert.equal(run('formatComponentFactor(valve)'),Number(valve.factor).toFixed(2));});
check('unpriced rows cannot display a default pipe factor as calculated',()=>{
  context.cost=price({materialText:'UNMAPPED ALLOY'});assert.equal(run('formatComponentFactor(cost)'),'-');
});
context.pipeItems=[first,second].map((componentCost,i)=>({group:'Pipe Group',item:i?'PIPE E.F.S.W.':'PIPE SEAMLESS',size:i?'8 IN':'6 IN',thickness:i?'S160':'XXS',material:i?'A 358 GR321 CL.1(SHTP)':'A 312 TP 321(SHTP)',quantity:i?'24':'60',uom:'M',componentCost}));
check('live component table and full report show matching paired values',()=>{
  run('bomGroupItems.push(...pipeItems);renderBomGroupReview()');
  const screen=run('elements.bomGroupTables.innerHTML');assert.equal((screen.match(/>1\.80 \/ 2\.70<\/span>/g)||[]).length,2);
  const html=run('buildBomCostReportHtml()');assert.equal((html.match(/>1\.80 \/ 2\.70<\/span>/g)||[]).length,2);
  assert.match(html,/Normal \/ P90/);assert.match(html,/40,606\.75/);assert.match(html,/57,035\.21/);
});
async function main(){
  if(process.argv.includes('--excel')){
    const res=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');if(!res.ok)throw Error('Excel library HTTP '+res.status);run(await res.text());
    check('editable Excel keeps numeric factor and dynamic audit pair, without repricing',()=>{
      const built=run("buildEditableComponentSheet('Pipe Group',pipeItems)");
      assert.equal(built.sheet.J5.v,'Normal Factor');assert.equal(built.sheet.J6.v,1.8);assert.equal(built.sheet.Q6.v,'1.80 / 2.70');
      assert.match(built.sheet.Q6.f,/J6\*L6/);assert.match(built.sheet.Q6.f,/TEXT/);assert.equal(built.sheet.K6.v,first.medianUnitRate);
      close(built.sheet.I6.v*built.sheet.J6.v,first.medianUnitRate);close(built.sheet.M6.v+built.sheet.M7.v,built.sheet['M'+built.totalRow].v);
      assert.match(built.sheet['!ref'],/:R/);assert.equal(built.sheet.Q7.v,'1.80 / 2.70');
      assert.equal(built.sheet.I5.v,'Base Rate Rs/m');assert.equal(built.sheet.R5.v,'Weight kg/m');
      close(built.sheet.R6.v,0.0246615*(168.3-21.95)*21.95);
      assert.equal(built.sheet.I6.f,'IF(AND(ISNUMBER(R6),R6>0,ISNUMBER(F6),F6>0),R6*F6,"Review")');
      close(built.sheet.R6.v*built.sheet.F6.v,built.sheet.I6.v);
      assert.equal(built.sheet.F6.s.fill.fgColor.rgb,'FFF2CC');
      assert.equal(built.sheet.I6.s.fill.fgColor.rgb,'EAF4F1');
      assert.match(built.sheet['B'+(built.totalRow+2)].v,/Base Rate Rs\/m = Weight kg\/m x Raw Steel Rs\/kg/);
      context.sheet=built.sheet;
      const back=run("(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,sheet,'Pipe Group');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true}).Sheets['Pipe Group'];})()");
      assert.equal(back.J6.v,1.8);assert.equal(back.Q6.v,'1.80 / 2.70');assert.equal(back.K7.v,second.medianUnitRate);assert.equal(back.Q6.f,built.sheet.Q6.f);
      assert.equal(back.I6.f,built.sheet.I6.f);close(back.R6.v,built.sheet.R6.v);
    });
    check('Excel pipe override basis and unpriced rows remain auditable; other groups unchanged',()=>{
      context.overrideCost=price({factorOverrideText:'1.3',rawOverrideText:'100'});
      context.missingCost=price({materialText:'UNMAPPED ALLOY'});
      const pipe=run("buildEditableComponentSheet('Pipe Group',[{...pipeItems[0],componentCost:overrideCost},{...pipeItems[0],componentCost:missingCost}]).sheet");
      close(pipe.R6.v,0.0246615*(168.3-21.95)*21.95);assert.equal(pipe.F6.v,100);assert.equal(pipe.J6.v,1.3);
      close(pipe.R6.v*pipe.F6.v*pipe.J6.v,pipe.K6.v);
      assert.equal(pipe.R7.v,'');assert.equal(pipe.I7.v,'Review');assert.equal(pipe.K7.v,'Review');
      const other=run("buildEditableComponentSheet('Valves Group',[{item:'Gate Valve',quantity:2,uom:'Nos',componentCost:valve}]).sheet");
      assert.equal(other.I5.v,'Base Rate Rs');assert.equal(other.I6.f,undefined);assert.equal(other.R5,undefined);
    });
  }
  console.log(checks+' pipe conversion-factor display checks passed; screenshot rates unchanged.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
