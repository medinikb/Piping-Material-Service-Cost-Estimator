// Run: node tests/service-size-fallback.cjs [--excel]
// Tests run the real app functions. Source libraries/workbooks are never written.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const controls = new Map();
const control = id => {
  if (!controls.has(id)) controls.set(id, {value:'',dataset:{},textContent:'',innerHTML:'',hidden:false,
    classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[],setAttribute(){},removeAttribute(){}});
  return controls.get(id);
};
const context = vm.createContext({console,ArrayBuffer,Uint8Array,document:{querySelector:control,querySelectorAll:()=>[]}});
context.window = context;
const run = code => vm.runInContext(code, context);
for (const name of ['service_cost_rates_CS.js','service_cost_rates_SS.js','service_cost_rates_AS.js','service_cost_engine.js','pipe_support_calculator_MT.js','nrl_pwht_rules.js','unequal_tee_dimensions_C_M.js']) {
  run(read('Piping Service Cost for Web App/'+name));
}
run(read('special-component-pricing.js'));
run(read('app.js').split('\npopulateSizeOptions();')[0]);
context.prices = json('raw_material_price_library.json');
context.materials = json('astm_piping_material_specification_webapp.json');
context.flange = json('flange-weight-3-input-model-v2.json');
context.tees = json('Piping Service Cost for Web App/unequal_tee_dimensions_C_M.json');
run(`rawMaterialPriceLibrary=prices.raw_material_price_library;
  materialSpecificationRows=prepareMaterialSpecificationRows(materials.material_specification_rows);
  flangeWeightModel=flange;flangeWeightModelStatus='loaded';unequalTeeDimensions=tees.records;unequalTeeDimensionsStatus='loaded';
  elements.year.value='2026';elements.coating.value='No';elements.factorOverride.value='';elements.rawOverride.value='';elements.spec.value='A106 Gr.B';
  elements.serviceLocation.value='ABOVE_GROUND';elements.serviceRegulatoryClass.value='NON_IBR';
  elements.serviceReworkRate.value='15';elements.serviceCivilSupportScope.value='INSIDE_UNIT';elements.designTemperature.value='';
  elements.projectDescription.value='Service fallback regression';elements.projectNumber.value='TEST';
  renderLineItems=()=>{};renderBomGroupReview=()=>{};renderWhatIfAnalysis=()=>{};updateReportGenerated=()=>{};showSuccessMessage=()=>{};`);
let checks = 0;
const check = (label, fn) => {try {fn();checks++;}catch(error){error.message=label+': '+error.message;throw error;}};
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-7, `${a} != ${b}`);
const engine = context.PipingServiceCost;
const ss = context.PIPING_SERVICE_COST_RATES_SS;
const before = JSON.stringify(ss);
const query = {nps:6,thicknessMm:21.95,location:'ABOVE_GROUND',regulatoryClass:'NON_IBR',activity:'ERECTION',weldType:'NA'};
const find = changes => engine.findRate(ss,{...query,...changes});
const input = {nps:6,thicknessMm:21.95,lengthM:60,location:'ABOVE_GROUND',regulatoryClass:'NON_IBR',fabricationMode:'STOCK_LENGTH_PROXY',stockLengthM:6,lineCount:1,jointAllowanceFactor:1.6};
const priced = engine.calculatePipeService(input,ss);
check('6 IN SS copies only 8 IN rates; actual IM, joints and ID retained',()=>{
  assert.equal(priced.status,'READY');assert.equal(priced.pricingStatus,'BUDGET_FALLBACK');assert.equal(priced.requiresApproval,true);
  assert.equal(priced.rates.erectionRsPerIM,490);assert.equal(priced.rates.buttFabricationRsPerID,5170);
  assert.equal(priced.quantities.erectionQuantityIM,360);assert.equal(priced.quantities.straightButtWeldJoints,16);assert.equal(priced.quantities.buttWeldDiameterInch,96);
  assert.equal(priced.costs.erectionCost,176400);assert.equal(priced.costs.buttFabricationCost,496320);assert.equal(priced.costs.directServiceCost,672720);
  assert.equal(priced.audit.sizeFallbacks.length,2);assert.ok(priced.audit.sizeFallbacks.every(r=>r.actualNpsIn===6&&r.rateBasisNpsIn===8&&r.actualThicknessMm===21.95));
  assert.match(priced.audit.fallbackNote,/SS; ABOVE_GROUND\/NON_IBR/);assert.match(priced.audit.fallbackNote,/not guaranteed conservative/);
});
check('8 IN exact rate wins without approval flag',()=>{
  const p=engine.calculatePipeService({...input,nps:8,thicknessMm:23.01,lengthM:24},ss);
  assert.equal(p.pricingStatus,'EXACT');assert.equal(p.budgetFallbackUsed,false);assert.equal(p.costs.directServiceCost,383600);
});
for(const [label,changes] of Object.entries({
  'no lower-size substitution':{nps:40},'unknown location':{location:'OFFSHORE'},'SS underground':{location:'UNDERGROUND'},
  'SS IBR':{regulatoryClass:'IBR'},'wrong unit':{unit:'KG'},'wrong activity':{activity:'UNKNOWN'},
  'wrong weld':{activity:'FABRICATION',weldType:'FILLET_WELD'},'no thickness band':{thicknessMm:100},
  'zero thickness':{thicknessMm:0},'zero size':{nps:0},'nonfinite size':{nps:Infinity},'explicit exact-only mode':{allowHigherSizeFallback:false}
})) check(label,()=>assert.equal(find(changes).status,'REVIEW_REQUIRED'));
check('thickness boundaries stay in their own documented bands',()=>{
  assert.equal(find({thicknessMm:20}).budgetFallbackUsed,false);
  assert.equal(find({thicknessMm:20.00001}).fallbackAudit.rateBasisNpsIn,8);
  assert.equal(find({thicknessMm:30}).fallbackAudit.thicknessMaxInclusiveMm,30);
  assert.equal(find({thicknessMm:30.00001}).fallbackAudit.thicknessMinExclusiveMm,30);
});
check('calculation respects explicit exact-only mode',()=>assert.equal(engine.calculatePipeService({...input,allowHigherSizeFallback:false},ss).status,'REVIEW_REQUIRED'));
const baseRate = {location:'ABOVE_GROUND',regulatoryClass:'NON_IBR',activity:'ERECTION',weldType:'NA',thicknessMinExclusiveMm:20,thicknessMaxInclusiveMm:30,npsMinIn:8,npsMaxIn:12,unit:'IM',rateRs:490,source:'Test source'};
const synthetic = rows => ({libraryCode:'TEST',rateTable:rows});
check('nearest eligible size chosen, even when next-higher rate is cheaper',()=>{
  const r=engine.findRate(synthetic([{...baseRate,npsMinIn:10,rateRs:900},baseRate]),query);
  assert.equal(r.rateRs,490);assert.equal(r.fallbackAudit.rateBasisNpsIn,8);
});
check('exact wins ahead of higher-size rows',()=>{
  const r=engine.findRate(synthetic([baseRate,{...baseRate,npsMinIn:6,npsMaxIn:6,rateRs:600}]),query);
  assert.equal(r.rateRs,600);assert.equal(r.budgetFallbackUsed,false);
});
for(const rate of [0,-1,NaN,Infinity]) check('invalid source rate '+rate,()=>assert.equal(engine.findRate(synthetic([{...baseRate,rateRs:rate}]),query).status,'REVIEW_REQUIRED'));
check('ambiguous nearest rates stay Review',()=>assert.equal(engine.findRate(synthetic([baseRate,{...baseRate,rateRs:491}]),query).status,'REVIEW_REQUIRED'));
for(const [activity,weldType,unit] of [['FABRICATION','BUTT_WELD','ID'],['FABRICATION','FILLET_WELD','ID'],['FLAME_CUTTING','NA','ID']]) {
  check(activity+'/'+weldType+' uses own matching activity and unit',()=>{
    const r=engine.findRate(synthetic([{...baseRate,activity,weldType,unit}]),{...query,activity,weldType});
    assert.equal(r.budgetFallbackUsed,true);assert.equal(r.unit,unit);
  });
}
check('flame cutting cannot silently switch IBR status',()=>{
  const p=engine.calculatePipeService({...input,includeErection:false,regulatoryClass:'IBR',fabricationMode:'MANUAL_DIAMETER_INCH',buttWeldDiameterInch:0,flameCutDiameterInch:6},synthetic([{...baseRate,activity:'FLAME_CUTTING',unit:'ID'}]));
  assert.equal(p.status,'REVIEW_REQUIRED');
});
check('source table and original inputs are unchanged',()=>{assert.equal(JSON.stringify(ss),before);assert.equal(input.nps,6);assert.equal(input.thicknessMm,21.95);});
context.fixtureRows = [
  {Item:'PIPE SEAMLESS',Size:'6 IN','Sch/Thck/Rating':'XXS',Material:'A 312 TP 321(SHTP)',Quantity:'60',UOM:'M','Piping Class':'G5M'},
  {Item:'PIPE E.F.S.W.',Size:'8 IN','Sch/Thck/Rating':'S160',Material:'A 358 GR321 CL.1(SHTP)',Quantity:'24',UOM:'M','Piping Class':'G5M'}
];
run("importBomRows(fixtureRows,'G5M regression',{replaceBatchKey:'fallback-test'})");
const summary=run('getPipingServiceEstimate()');context.summary=summary;
check('BOM routes are isolated by material and count items, not activities',()=>{
  assert.equal(summary.rows[0].rateLibrary.code,'SS');assert.equal(summary.budgetFallbackCount,1);assert.equal(summary.review,0);
  close(summary.rows[0].costs.directServiceCost,672720);close(summary.rows[1].costs.directServiceCost,383600);
  close(summary.erection+summary.welding,1056320);close(summary.rework,0.15*(496320+289520));
});
check('fabrication, erection and rework packages carry their own approval notes',()=>{
  const rows=run('getServicePartBRows(summary)');
  for(const number of [1,4,6]) {const row=rows.find(r=>r.slNo===number);assert.equal(row.budgetFallbackUsed,true);assert.match(row.source,/6 IN -> 8 IN/);context.row=row;assert.match(run('getServiceDisplayStatus(row)'),/approval required/);}
  for(const row of rows.filter(r=>![1,4,6].includes(r.slNo))) assert.ok(!row.budgetFallbackUsed);
  close(rows.reduce((n,r)=>n+r.amount,0),summary.direct);
});
check('screen, printable report and Ask Estimator expose budget assumption',()=>{
  run('renderPipingServiceCost()');assert.match(run('elements.serviceCostTableWrap.innerHTML'),/Budget fallback - approval required/);
  assert.match(run('elements.servicePartBWrap.innerHTML'),/6 IN -&gt; 8 IN/);
  assert.match(run('elements.serviceReadyCount.textContent'),/1 budget fallback/);
  const html=run('buildBomCostReportHtml()');assert.match(html,/Budget fallback - approval required/);assert.match(html,/6 IN -&gt; 8 IN/);
  assert.match(html,/not guaranteed conservative/);assert.match(html,/budget fallback item/);
  assert.match(html,/Budget assumptions need approval/);assert.ok(!html.includes('No pending item'));
  for(const length of [true,false]) {context.hasLength=length;const answer=run('getEstimatorQueryService(bomGroupItems[0],hasLength)');assert.equal(answer.budgetFallbackUsed,true);assert.match(answer.source,/6 IN -> 8 IN/);}
});
check('source-review flags still block service and Ask pricing',()=>{
  run("bomGroupItems[0].componentCost.sourceReviewRequired=true;bomGroupItems[0].componentCost.reviewMessage='Verify controlled PMS';");
  assert.equal(run('getPipingServiceEstimate().rows[0].status'),'REVIEW_REQUIRED');
  assert.equal(run('getEstimatorQueryService(bomGroupItems[0],true).status'),'REVIEW_REQUIRED');
  run('delete bomGroupItems[0].componentCost.sourceReviewRequired');
});
check('welding-only fittings retain actual size, wall and joint quantities',()=>{
  const p=engine.calculatePipeService({...input,includeErection:false,lengthM:0,fabricationMode:'MANUAL_JOINT_COUNT',straightButtWeldJoints:3},ss);
  assert.equal(p.budgetFallbackUsed,true);assert.equal(p.quantities.erectionQuantityIM,0);assert.equal(p.quantities.buttWeldDiameterInch,18);
  assert.equal(p.costs.directServiceCost,18*5170);assert.equal(p.inputs.thicknessMm,21.95);
});
check('small-tee workaround cannot change to a thinner band',()=>{
  const q={...query,nps:1.5,thicknessMm:12,activity:'FABRICATION',weldType:'BUTT_WELD'};
  const r=engine.findRate(ss,q);assert.equal(r.status,'READY');assert.equal(r.budgetFallbackUsed,true);
  assert.equal(r.fallbackAudit.actualThicknessMm,12);assert.ok(r.fallbackAudit.thicknessMinExclusiveMm>=10);
});
check('higher-size rate does not enlarge support geometry or surface area',()=>{
  const saved=engine.calculatePipeService;
  try {
    engine.calculatePipeService=(input,data)=>saved({...input,allowHigherSizeFallback:false},data);
    const exactOnly=run('getPipingServiceEstimate()');
    close(exactOnly.pipeSupport.weightMt,summary.pipeSupport.weightMt);close(exactOnly.civilSupport.cost,summary.civilSupport.cost);
    close(exactOnly.insulation.surfaceAreaM2,summary.insulation.surfaceAreaM2);close(exactOnly.painting.surfaceAreaM2,summary.painting.surfaceAreaM2);
  } finally {engine.calculatePipeService=saved;}
});
check('other material libraries do not become SS substitutions',()=>{
  for(const category of ['Duplex Stainless Steel','Non Ferrous']) {context.category=category;assert.equal(run('getServiceRateLibraryForMaterialCategory(category).library'),null);}
});
async function main(){
  if(process.argv.includes('--excel')) {
    const res=await fetch('https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js');if(!res.ok)throw Error('Excel library HTTP '+res.status);run(await res.text());
    check('Excel service sheets preserve numeric values, status and full rate trace on reopen',()=>{
      const back=run(`(()=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,buildPipingServiceCostSheet(summary),'Piping Service Cost');XLSX.utils.book_append_sheet(w,buildPipingServicePartBSheet(summary),'Service Cost Part B');return XLSX.read(XLSX.write(w,{type:'array',bookType:'xlsx'}),{type:'array',cellFormula:true});})()`);
      const s=back.Sheets['Piping Service Cost'];assert.equal(s.H7.v,360);assert.equal(s.I7.v,96);assert.equal(s.J7.v,490);assert.equal(s.K7.v,5170);assert.equal(s.Q7.v,672720);
      assert.match(s.R7.v,/Budget fallback - approval required/);assert.match(s.R7.v,/6 IN -> 8 IN/);assert.match(s.R7.v,/thickness >20 to 30 mm/);
      assert.ok(!/Budget fallback/.test(s.R8.v));
      const b=back.Sheets['Service Cost Part B'];for(const row of [5,8,10]){assert.match(b['I'+row].v,/approval required/);assert.match(b['H'+row].v,/6 IN -> 8 IN/);}
      assert.equal(b.G16.f,'SUM(G5:G15)');close(b.G16.v,summary.direct);
    });
    const filename=path.join(root,'Validation/G5M_Piping BOM Example Template (2).xlsx');
    if(fs.existsSync(filename)) {
      context.sourceBytes=new Uint8Array(fs.readFileSync(filename));
      check('actual G5M workbook passes through the app import unchanged',()=>{
        run(`var sourceBook=XLSX.read(sourceBytes,{type:'array'});var actualRows=worksheetToBomRows(sourceBook.Sheets['Piping BOM']);importBomRows(actualRows,'Actual G5M workbook',{replaceBatchKey:'fallback-test'});`);
        const actual=run('getPipingServiceEstimate()');const pipes=actual.rows.filter(r=>r.scope==='Pipe');
        assert.equal(pipes.length,2);assert.equal(pipes[0].nps,6);assert.equal(pipes[0].thicknessMm,21.95);assert.equal(pipes[0].budgetFallbackUsed,true);
        close(pipes[0].costs.directServiceCost,672720);close(pipes[1].costs.directServiceCost,383600);
      });
    }
  }
  console.log(checks+' service-size fallback checks passed. Source rates and workbook untouched.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
