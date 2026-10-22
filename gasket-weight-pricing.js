/* Weight-based gasket costing. No nominal-size mass lookup, assumed density,
 * constituent fractions, stock rate, yield or manufacturing factor is supplied.
 * All weights are finished constituent kg per ONE gasket, not batch weights.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GasketWeightPricing=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const fields = Object.freeze({
    type:'Gasket Type', pricingMode:'Gasket Pricing Mode', mode:'Gasket Weight Method', primaryWeightKg:'Gasket Primary Weight kg/No',
    odMm:'Gasket OD mm', idMm:'Gasket ID mm', thicknessMm:'Gasket Thickness mm', densityKgM3:'Gasket Density kg/m3',
    holeCount:'Gasket Bolt Hole Count', holeDiameterMm:'Gasket Bolt Hole Diameter mm',
    fillerWeightKg:'Gasket Filler Weight kg/No', fillerRate:'Gasket Filler Raw Rs/kg',
    rings:'Gasket Ring Configuration', innerWeightKg:'Gasket Inner Ring Weight kg/No', innerRate:'Gasket Inner Ring Raw Rs/kg',
    outerWeightKg:'Gasket Outer Ring Weight kg/No', outerRate:'Gasket Outer Ring Raw Rs/kg',
    yieldPercent:'Gasket Yield %', factor:'Gasket Conversion Factor', p90Ratio:'Gasket P90 Ratio', basis:'Gasket Calculation Basis',
    acceptReferences:'Gasket Accept Stock References'
  });
  const types=Object.freeze({SHEET_RING:'Sheet Ring Gasket',FULL_FACE:'Full Face Gasket',SPIRAL_WOUND:'Spiral Wound Gasket',RTJ:'Octagonal RTJ Gasket',MEASURED:'Measured Gasket'});
  const norm=v=>String(v??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
  function number(v,label,zero=false){
    if(!present(v)||typeof v==='boolean')throw Error(`Enter ${label}.`);
    const n=typeof v==='number'?v:Number(String(v).trim().replace(/,/g,''));
    if(!Number.isFinite(n)||(zero?n<0:n<=0))throw Error(`${label} must be ${zero?'zero or positive':'positive'} and finite.`);
    return n;
  }
  function identifyType(value,material=''){
    const n=norm(value),m=norm(material);
    const exact=Object.keys(types).find(key=>norm(key)===n);
    if(exact)return exact;
    if(/SPIRAL|SPRWND|SPIRALWND|SPWND/.test(n))return 'SPIRAL_WOUND';
    if(/OCT|RTJ|RINGJOINT/.test(n))return 'RTJ';
    if(/FULLFACE/.test(n))return 'FULL_FACE';
    if(/SHEETRING|FLATGASKET|SHEETGASKET/.test(n))return 'SHEET_RING';
    if(/MEASURED|CUSTOM/.test(n))return 'MEASURED';
    if(/SPIRAL|SPRWND|SPWND|WITHCAFILLER/.test(m))return 'SPIRAL_WOUND';
    if(/BHN|SOFTIRON|5CR/.test(m))return 'RTJ';
    if(/2712|BUTYLRUBBER|NONASBESTOS|NONASB|CNAF|BS7531/.test(m))return 'SHEET_RING';
    return '';
  }
  function resolveClass(catalog,pipeClass,nps,material){
    if(!present(pipeClass))return null;
    if(!catalog||!Array.isArray(catalog.rows))return {error:'Gasket pipe-class catalog did not load. Refresh the app.'};
    const rows=catalog.rows.filter(r=>norm(r.pipeClass)===norm(pipeClass)&&nps>=r.lowSize&&nps<=r.highSize);
    if(rows.length!==1)return {error:`No unique gasket specification for class ${pipeClass}, ${nps} IN. No adjacent size/class is substituted.`};
    const row=rows[0];
    if(row.verificationStatus==='needs_review')return {error:`PMS source review required: ${row.verificationNote.replace(/\bprovisional\b/gi,'unverified')}`,sourceReviewRequired:true};
    if(norm(material)!==norm(row.material))return {error:`Material does not match the ${row.pipeClass} gasket specification. Select the class material or remove the class to estimate a separately confirmed design.`};
    return {row,type:identifyType(row.type,row.material)};
  }
  function calculate(input){
    try{
      const type=identifyType(input.type,input.material);
      if(!type)throw Error('Select gasket construction: sheet ring, full face, spiral wound, RTJ or measured. SS304 alone does not define construction.');
      const g=input.geometry||{};
      const mode=norm(g.mode)||(present(g.primaryWeightKg)?'MASS':'DIMENSIONS');
      if(!['MASS','DIMENSIONS'].includes(mode))throw Error('Gasket weight method must be MASS or DIMENSIONS.');
      if(!present(g.basis))throw Error('Enter Gasket Calculation Basis (drawing, weight record or confirmed assumption reference).');
      const yieldPercent=number(g.yieldPercent,'Gasket Yield %');
      if(yieldPercent>100)throw Error('Gasket Yield % must be above 0 and at most 100.');
      const factor=number(g.factor,'Gasket Conversion Factor');
      const p90Ratio=present(g.p90Ratio)?number(g.p90Ratio,'Gasket P90 Ratio'):1.5;
      if(p90Ratio<1)throw Error('Gasket P90 Ratio must be at least 1.');
      let primaryWeightKg,dimensions=null;
      if(mode==='DIMENSIONS'){
        if(!['SHEET_RING','FULL_FACE'].includes(type))throw Error('Spiral-wound, RTJ and measured constructions require confirmed constituent weights. Do not model an RTJ as a flat washer.');
        const od=number(g.odMm,'gasket outside diameter mm'),id=number(g.idMm,'gasket inside diameter mm',true);
        const t=number(g.thicknessMm,'gasket thickness mm'),density=number(g.densityKgM3,'gasket material density kg/m3');
        if(od<=id)throw Error('Gasket OD must be greater than ID. Use actual gasket diameters, not nominal pipe size.');
        const holes=type==='FULL_FACE'?number(g.holeCount,'full-face bolt hole count'):present(g.holeCount)?number(g.holeCount,'bolt hole count',true):0;
        if(!Number.isInteger(holes))throw Error('Bolt hole count must be a whole number.');
        const hole=holes?number(g.holeDiameterMm,'bolt hole diameter mm'):0;
        if(holes&&hole>(od-id)/2)throw Error('Bolt hole diameter exceeds the available annular width. Confirm actual dimensions.');
        const area=Math.PI/4*(od*od-id*id-holes*hole*hole);
        if(area<=0)throw Error('Hole deductions leave no positive gasket area.');
        primaryWeightKg=area*t*density*1e-9;
        dimensions={odMm:od,idMm:id,thicknessMm:t,densityKgM3:density,holeCount:holes,holeDiameterMm:hole,netAreaMm2:area};
      }else primaryWeightKg=number(g.primaryWeightKg,'finished primary constituent weight kg per gasket');
      const parts=[{name:type==='SPIRAL_WOUND'?'Metal winding':type==='RTJ'?'RTJ ring':'Primary gasket material',weightKg:primaryWeightKg,rate:number(input.primaryRate,'primary raw-material Rs/kg'),source:input.primaryRateSource||'User input'}];
      if(type==='SPIRAL_WOUND'){
        parts.push({name:'Filler',weightKg:number(g.fillerWeightKg,'filler weight kg per gasket'),rate:number(input.fillerRate,'filler raw Rs/kg'),source:input.fillerRateSource||'User input'});
        const rings=norm(g.rings);
        if(!['NONE','INNER','OUTER','BOTH'].includes(rings))throw Error('Explicitly select ring configuration: NONE, INNER, OUTER or BOTH.');
        for(const kind of ['inner','outer']){
          const included=rings==='BOTH'||rings===kind.toUpperCase();
          if(included)parts.push({name:`${kind} ring`,weightKg:number(g[kind+'WeightKg'],`${kind} ring weight kg per gasket`),rate:number(g[kind+'Rate'],`${kind} ring raw Rs/kg`),source:'User input'});
          else if(present(g[kind+'WeightKg'])||present(g[kind+'Rate']))throw Error(`Remove ${kind} ring inputs or include that ring in the configuration.`);
        }
      }else if(['fillerWeightKg','fillerRate','innerWeightKg','innerRate','outerWeightKg','outerRate'].some(k=>present(g[k])))throw Error('Remove composite constituent inputs for this single-material gasket construction.');
      const netMaterialCost=parts.reduce((n,p)=>n+p.weightKg*p.rate,0);
      const rawCostPerUnit=netMaterialCost/(yieldPercent/100);
      const unit=rawCostPerUnit*factor;
      const mass=parts.reduce((n,p)=>n+p.weightKg,0);
      if(![mass,rawCostPerUnit,unit,unit*p90Ratio].every(n=>Number.isFinite(n)&&n>0))throw Error('Gasket calculation overflow or invalid result; check input units.');
      const quantity=present(input.quantity)?Number(String(input.quantity).replace(/,/g,'')):NaN;
      const quantityValid=Number.isSafeInteger(quantity)&&quantity>0&&Number.isFinite(unit*p90Ratio*quantity);
      if(!['NOS','NO','EA','EACH','PCS','PC','NUMBER','NUMBERS'].includes(norm(input.uom)))throw Error('Gasket quantity UOM must be a piece count (Nos/EA/PCS), not kg, set or lot.');
      return {status:'READY',gasketWeightBased:true,gasketType:type,gasketWeightMode:mode,
        autoCostAllowed:true,unitCostAllowed:true,totalCostAllowed:quantityValid,quantity:quantityValid?quantity:NaN,uom:'NOS',
        factor,factorSource:'User-entered gasket conversion factor',factorOverrideApplied:true,
        p90Ratio,medianUnitRate:unit,p90UnitRate:unit*p90Ratio,medianTotal:quantityValid?unit*quantity:NaN,p90Total:quantityValid?unit*p90Ratio*quantity:NaN,
        massPerUnitKg:mass,rawCostPerUnit,rawSteel:netMaterialCost/mass,gasketYieldPercent:yieldPercent,gasketParts:parts,gasketDimensions:dimensions,
        gasketBasis:String(g.basis).trim(),rawMaterialBasis:'Weight-based gasket constituent inputs',
        note:`Weight-based ${types[type]}; ${mode}; basis: ${String(g.basis).trim()}. `+
          parts.map(p=>`${p.name}: ${p.weightKg} kg/No x Rs ${p.rate}/kg (${p.source})`).join(' | ')+
          `. Net raw cost Rs ${netMaterialCost}; yield ${yieldPercent}%; purchased raw cost Rs ${rawCostPerUnit}/No x entered factor ${factor} = Rs ${unit}/No. `+
          (dimensions?`Geometry: OD ${dimensions.odMm}, ID ${dimensions.idMm}, thickness ${dimensions.thicknessMm} mm; density ${dimensions.densityKgM3} kg/m3; ${dimensions.holeCount} holes x ${dimensions.holeDiameterMm} mm. Hole placement/fit is not verified. `:'')+
          `P90 ratio ${p90Ratio}${present(g.p90Ratio)?' entered':' (existing app budget scenario 1.50, not a calibrated probability)'}. `+
          'Factor covers fabrication, inspection, overhead and margin as entered; do not add these twice. Tax/freight excluded. Geometry, rates, yield and factor are estimating inputs, not engineering approval.'+
          (quantityValid?'':' Enter a positive whole-number gasket quantity for totals.')};
    }catch(error){return {status:'REVIEW_REQUIRED',autoCostAllowed:false,unitCostAllowed:false,totalCostAllowed:false,reason:error.message};}
  }
  return Object.freeze({fields,types,identifyType,resolveClass,calculate});
});
