/* Automatic budget preparation ONLY. The existing weight calculator still owns
 * cost arithmetic/validation. Missing sizes use an audited cost-only geometry
 * allowance, never a claim of standard fit or an adjacent pressure-class rate.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GasketBudgetPricing=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const present=value=>value!==undefined&&value!==null&&String(value).trim()!=='';
  const normalized=value=>String(value??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const annulus=(od,id,t,density)=>Math.PI/4*(od*od-id*id)*t*density*1e-9;
  // Preserve the reference radial section rather than scaling every dimension:
  // ring thickness and winding width do not grow in proportion to pipe diameter.
  function estimatedRow(table,nps,rating,policy,diameters){
    if(!policy?.enabled||policy.method!=='CONSTANT_SECTION')return null;
    if(!Number.isFinite(policy.nominalMmPerInch)||policy.nominalMmPerInch<=0)throw Error('Invalid gasket size-fallback policy.');
    const candidates=table.filter(row=>row.rating===rating);
    const anchor=candidates.sort((a,b)=>Math.abs(a.nps-nps)-Math.abs(b.nps-nps)||b.nps-a.nps)[0];
    if(!anchor)return null; // Never borrow another pressure class.
    const result={...anchor,nps,estimated:true,anchorNps:anchor.nps};
    const delta=(nps-anchor.nps)*policy.nominalMmPerInch;
    for(const key of diameters){result[key]=anchor[key]+delta;if(!Number.isFinite(result[key])||result[key]<=0)throw Error('Estimated gasket dimensions are invalid; enter confirmed weights.');}
    return result;
  }
  function materialKey(text){
    const n=normalized(text);
    const ss=n.match(/(?:SS|SUS|AISI)(304H|304L|304|316L|316|321)(?![A-Z0-9])/);
    if(ss)return 'SS'+ss[1];
    // Text after the grade often starts SPR/WND, so require an explicit token
    // boundary in the original description rather than shortening unknown grades.
    const grade=String(text??'').toUpperCase().match(/(?:SS|SUS|AISI)\s*(304H|304L|304|316L|316|321)(?=$|[^A-Z0-9])/);
    if(grade)return 'SS'+grade[1];
    if(n.includes('SOFTIRON'))return 'SOFT_IRON';
    if(n.includes('5CR'))return '5CR';
    if(n.includes('BUTYL'))return 'BUTYL';
    if(/NONASBESTOS|NONASB|CNAF|BS7531/.test(n))return 'NON_ASBESTOS';
    if(n.includes('CAF')||n.includes('2712'))return 'CAF';
    if(n==='PTFE')return 'PTFE';
    if(n==='GRAPHITE')return 'GRAPHITE';
    return '';
  }
  function prepare(input,library){
    try{
      if(!library?.policy||!library?.dimensions)throw Error('Automatic gasket library did not load. Refresh the app.');
      const p=library.policy,d=library.dimensions,g={...input.geometry},assumptions=[],type=input.type;
      if(!p.families[type])throw Error('No automatic construction model. Use Advanced / confirmed weights for this custom gasket.');
      const family=p.families[type];
      let key=materialKey(input.material);
      if(!key&&type==='SPIRAL_WOUND'&&/^SPIRAL\s*WOUND\s*\(32TB\)/i.test(String(input.material).trim())&&!/SS\s*\d|SUS|AISI|UNS|INCONEL|MONEL|HASTELLOY/i.test(String(input.material))){
        key=p.defaultWithoutClass.ungradedSpiralMaterial;
        assumptions.push(`Unverified 32TB trade designation: assumed ${key}/graphite winding and default rings for costing only; not identification of 32TB or PMS approval`);
      }
      const material=p.materials[key];
      if(!material)throw Error('No budget material mapping for this exact gasket grade. Enter confirmed inputs in Manual mode.');
      if(key==='NON_ASBESTOS')assumptions.push('Non-asbestos sheet: budget density/rate allowance uses the existing CAF commercial allowance (1800 kg/m3, Rs 250/kg), not asbestos composition, material equivalence or a BS7531 supplier quotation');
      if(type!=='SPIRAL_WOUND'&&key.startsWith('SS')&&/SPIRAL|SPRWND|GRAFIL|GRAPHITE|CAF|PTFE|FILLER/.test(normalized(input.material)))throw Error('Composite/wound material description does not match the selected single-material construction. Confirm construction; constituents cannot be silently discarded.');
      if(type==='SPIRAL_WOUND'&&!key.startsWith('SS'))throw Error('Spiral-wound class specification has no supported winding metal. Confirm the source; a CAF sheet cannot silently become a metal winding.');
      if(['SPIRAL_WOUND','RTJ'].includes(type)&&['odMm','idMm','holeCount','holeDiameterMm'].some(key=>present(g[key])))throw Error('Sheet OD/ID/hole inputs are not a winding or RTJ cross-section override. Use confirmed constituent masses for this construction.');
      const density=present(g.densityKgM3)?Number(g.densityKgM3):material.densityKgM3;
      if(!Number.isFinite(density)||density<=0)throw Error('Primary material density must be positive and finite.');
      const nps=Number(input.nps),rating=Number(input.rating);
      if(!Number.isFinite(nps)||!(nps>0)||![150,300,400,600,900,1500,2500].includes(rating))throw Error('Enter a valid nominal size and pressure class (150/300/400/600/900/1500/2500).');
      const put=(field,value,source)=>{if(!present(g[field])){g[field]=value;assumptions.push(`${field}=${value} (${source})`);}};
      const rate=(which,keyName,entered)=>{
        if(present(entered)){const n=Number(String(entered).replace(/,/g,''));if(!Number.isFinite(n)||n<=0)throw Error(`${which} must be a positive finite rate.`);return {rate:n,source:'User/BOM override'};}
        // RTJ stock is machined ring/bar stock: never automatically activate a
        // saved thin-strip observation as its source. The policy allowance is
        // explicitly default and must be replaced for procurement.
        const ref=type==='RTJ'?null:(input.stockRates||[]).find(r=>r.key===keyName);
        const value=ref?.observed_rate_inr_per_kg??p.materials[keyName]?.fallbackRawRsKg;
        if(!Number.isFinite(value)||value<=0)throw Error(`Missing ${which} for ${keyName}.`);
        const source=ref?`Saved stock observation ${ref.source_url}; ${ref.limitations}`:`Default raw allowance (${keyName}), not a supplier quote`;
        assumptions.push(`${which}=${value}: ${source}`);return {rate:value,source};
      };
      const primary=rate('Primary Rs/kg',key,input.rawOverride);
      put('yieldPercent',family.yieldPercent,'default family yield');
      put('factor',present(input.factorOverride)?input.factorOverride:family.factor,present(input.factorOverride)?'BOM factor override':'default family conversion');
      put('p90Ratio',p.p90Ratio,'budget scenario, not probability calibration');
      const table=type==='SPIRAL_WOUND'?d.spiral:type==='FULL_FACE'?d.fullFace:type==='SHEET_RING'?d.sheet:null;
      const row=table?.find(r=>r.nps===nps&&r.rating===rating)||
        (table&&!present(g.primaryWeightKg)?estimatedRow(table,nps,rating,p.sizeFallback,type==='SPIRAL_WOUND'?['innerIdMm','windingIdMm','windingOdMm','outerOdMm']:['idMm','odMm']):null);
      let dimensionEstimate=row?.estimated?`Estimated dimensions: ${nps} IN, class ${rating}; reference ${row.anchorNps} IN, same construction/class, Lamons p.${row.sourcePage}. ${p.sizeFallback.note}`:'';
      let geometrySource='',filler=null,fillerMaterialKey='';
      const sourceThickness=String(input.classRow?.schThkRating||'').match(/^(\d+(?:\.\d+)?)\s*MM$/i)?.[1] || input.describedThicknessMm;
      if(sourceThickness)assumptions.push(`BOM/PMS described thickness=${sourceThickness} mm; entered Advanced thickness takes priority`);
      if(type==='RTJ'){
        let mapping=d.rtjMappings.find(r=>r.nps===nps&&r.rating===rating);
        let ring=d.rtjRings.find(r=>r.ring===mapping?.ring);
        if(!ring&&!present(g.primaryWeightKg)){
          const reference=estimatedRow(d.rtjMappings.filter(r=>d.rtjRings.some(s=>s.ring===r.ring)),nps,rating,p.sizeFallback,[]);
          if(reference){
            const anchor=d.rtjRings.find(r=>r.ring===reference.ring);
            ring={...anchor,pitchMm:anchor.pitchMm+(nps-reference.anchorNps)*p.sizeFallback.nominalMmPerInch};
            if(!Number.isFinite(ring.pitchMm)||ring.pitchMm<=ring.widthMm)throw Error('Invalid estimated RTJ pitch; enter confirmed ring mass.');
            mapping={...reference,ring:'Estimated RTJ (no assigned R-number)'};
            dimensionEstimate=`Estimated dimensions: RTJ pitch shifted from ${reference.anchorNps} IN class ${rating}, ${reference.ring}; retained octagonal section. ${p.sizeFallback.note}`;
          }
        }
        if(!ring&&!present(g.primaryWeightKg))throw Error('No published RTJ R-number/cross-section for this size/class. Custom rings need confirmed mass.');
        if(ring){
          const area=ring.widthMm*ring.heightMm-Math.pow(ring.widthMm-ring.flatMm,2)/(2*Math.tan(family.flankAngleDegrees*Math.PI/180));
          if(!(area>0))throw Error('Invalid RTJ octagonal cross-section.');
          put('primaryWeightKg',Math.PI*ring.pitchMm*area*density*1e-9,'published octagonal geometry; entered or default density; corner fillets neglected');
          geometrySource=`${mapping.ring}: pitch ${ring.pitchMm}, width ${ring.widthMm}, height ${ring.heightMm}, flat ${ring.flatMm} mm; octagon area W*H-(W-C)^2/(2*tan(23deg)); Lamons pp.117,${ring.sourcePage}`;
        }
        g.mode='MASS';
      }else if(type==='SPIRAL_WOUND'){
        if(!row&&!present(g.primaryWeightKg))throw Error('No published spiral dimension row for this size/class. No nearest-size substitution; use Advanced confirmed weights.');
        const m=normalized(input.material);
        const fillerKey=m.includes('PTFE')?'PTFE':/GRAFIL|GRAPHITE/.test(m)?'GRAPHITE':/CAF|CAFIL|CAFILLER/.test(m)?'CAF':p.defaultWithoutClass.stainlessFiller;
        fillerMaterialKey=fillerKey;
        if(!/PTFE|GRAFIL|GRAPHITE|CAF/.test(m))assumptions.push(`Unspecified filler=${fillerKey}; default configuration, not PMS approval`);
        filler=rate('Filler Rs/kg',fillerKey,g.fillerRate);
        put('rings',family.rings,'default inner/outer configuration unless overridden');
        const thickness=present(g.thicknessMm)?Number(g.thicknessMm):sourceThickness?Number(sourceThickness):family.thicknessMm;
        if(!Number.isFinite(thickness)||thickness<=0)throw Error('Invalid winding thickness.');
        if(row){
          const envelope=Math.PI/4*(row.windingOdMm**2-row.windingIdMm**2)*thickness*1e-9;
          put('primaryWeightKg',envelope*family.metalVolumeFraction*density,'winding envelope x default metal volume fraction and entered/default density');
          put('fillerWeightKg',envelope*family.fillerVolumeFraction*p.materials[fillerKey].densityKgM3,'winding envelope x default filler volume fraction/density');
          assumptions.push(`winding thickness=${thickness} mm; metal/filler/void volume=${family.metalVolumeFraction}/${family.fillerVolumeFraction}/${1-family.metalVolumeFraction-family.fillerVolumeFraction}; ring thickness=${family.ringThicknessMm} mm`);
          if(['INNER','BOTH'].includes(g.rings))put('innerWeightKg',annulus(row.windingIdMm,row.innerIdMm,family.ringThicknessMm,density),'published inner-ring geometry x same-grade entered/default density');
          if(['OUTER','BOTH'].includes(g.rings))put('outerWeightKg',annulus(row.outerOdMm,row.windingOdMm,family.ringThicknessMm,p.materials.CARBON_STEEL.densityKgM3),'published outer-ring geometry x default CS density');
          geometrySource=`Lamons p.${row.sourcePage}: inner ID ${row.innerIdMm}, winding ID ${row.windingIdMm}, winding OD ${row.windingOdMm}, outer OD ${row.outerOdMm} mm`;
        }
        if(['INNER','BOTH'].includes(g.rings))put('innerRate',rate('Inner ring Rs/kg',key,g.innerRate).rate,'same-grade default stock basis, not ring-stock approval');
        if(['OUTER','BOTH'].includes(g.rings))put('outerRate',rate('Outer ring Rs/kg','CARBON_STEEL',g.outerRate).rate,'default carbon-steel ring allowance');
        g.mode='MASS';
      }else{
        if(!row&&!present(g.primaryWeightKg)&&!(present(g.odMm)&&present(g.idMm)))throw Error('No sheet/full-face reference for this pressure class. Use Advanced actual dimensions or confirmed mass.');
        if(present(g.primaryWeightKg)&&g.mode!=='DIMENSIONS')g.mode='MASS';
        else{
          g.mode='DIMENSIONS';
          if(row){put('odMm',row.odMm,'published OD');put('idMm',row.idMm,'published ID');put('holeCount',row.holeCount||0,'published bolt hole count');if(row.holeCount)put('holeDiameterMm',row.holeDiameterMm,'published bolt hole diameter');geometrySource=`Lamons p.${row.sourcePage}, sheet/full-face dimensions ${JSON.stringify(row)}`;}
          put('thicknessMm',sourceThickness?Number(sourceThickness):family.thicknessMm,sourceThickness?'PMS gasket thickness':'default sheet thickness');
          put('densityKgM3',material.densityKgM3,'default material density');
        }
      }
      if(dimensionEstimate){geometrySource=`${dimensionEstimate} Calculated geometry: ${geometrySource}`;assumptions.push(dimensionEstimate);}
      if(!present(g.basis))g.basis=`Automatic budget ${p.version}; ${geometrySource||'entered constituent weights'}`;
      assumptions.push(`primary density=${density} kg/m3 (${present(input.geometry?.densityKgM3)?'entered':'default'})`);
      if(fillerMaterialKey)assumptions.push(`${fillerMaterialKey} filler density=${p.materials[fillerMaterialKey].densityKgM3} kg/m3 (default)`);
      return {ok:true,type,geometry:g,primaryRate:primary.rate,primaryRateSource:primary.source,fillerRate:filler?.rate,fillerRateSource:filler?.source,
        assumptions,geometryEstimated:!!dimensionEstimate,geometrySource,policyVersion:p.version,policyNote:p.calibrationNote,sourceUrl:d.sourceUrl,materialKey:key};
    }catch(error){return {ok:false,reason:error.message};}
  }
  return Object.freeze({prepare,materialKey});
});
