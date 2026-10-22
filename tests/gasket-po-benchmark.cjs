// Historical comparison only: do not relabel the PO as a current material quote.
const assert=require('node:assert/strict');
const b=require('../gasket-budget-pricing.js'),w=require('../gasket-weight-pricing.js');
const policy=require('../gasket-budget-policy.json'),dimensions=require('../gasket-standard-dimensions.json');
const fixture=require('../Validation/gasket-po4500030816-benchmark.json');
let po=0,base=0,old=0,current=0;
assert.equal(fixture.rows.length,34);
assert.equal(new Set(fixture.rows.map(r=>r[0])).size,34);
for(const [item,nps,rating,quantity,unit]of fixture.rows){
  const prepared=b.prepare({type:'SPIRAL_WOUND',material:'SS316L/Graphite',nps,rating,geometry:{}},{policy,dimensions});
  assert.equal(prepared.ok,true,item);assert.equal(prepared.geometryEstimated,false,item);
  const cost=w.calculate({type:prepared.type,geometry:prepared.geometry,primaryRate:prepared.primaryRate,fillerRate:prepared.fillerRate,quantity,uom:'NOS'});
  assert.equal(cost.status,'READY',item);assert.equal(cost.factor,1.8);
  po+=quantity*unit;base+=quantity*cost.medianUnitRate/cost.factor;
  old+=quantity*cost.medianUnitRate/cost.factor*1.8;current+=quantity*cost.medianUnitRate;
}
assert.equal(po,1595129);
assert.ok(Math.abs(po/base-1.5857)<0.001);
const historicalAlternative=base*1.6;
assert.ok(Math.abs(historicalAlternative-po)<Math.abs(current-po));
assert.ok(Math.abs(current-old)<0.001);
console.log(JSON.stringify({rows:34,poTotal:po,defaultFactor:1.8,modelTotal:current,historicalAlternativeFactor:1.6,historicalAlternativeTotal:historicalAlternative,aggregateMatchingFactor:po/base,differencePercent:100*(current/po-1),note:'Owner-selected budget default is 1.8; PO matching does not set the default. '+fixture.commercialBasis},null,2));
