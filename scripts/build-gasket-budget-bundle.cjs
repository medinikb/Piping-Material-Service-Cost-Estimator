// Offline/static deployment snapshot. JSON remains the editable source of truth.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data={policy:JSON.parse(fs.readFileSync(path.join(root,'gasket-budget-policy.json'),'utf8')),dimensions:JSON.parse(fs.readFileSync(path.join(root,'gasket-standard-dimensions.json'),'utf8'))};
if(data.policy.schemaVersion!==1||data.dimensions.schemaVersion!==1)throw Error('Unsupported gasket library schema');
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
if(data.policy.sizeFallback&&(!positive(data.policy.sizeFallback.nominalMmPerInch)||data.policy.sizeFallback.method!=='CONSTANT_SECTION'||typeof data.policy.sizeFallback.enabled!=='boolean'))throw Error('Invalid gasket size-fallback policy');
for(const [name,row]of Object.entries(data.policy.families)){
  if(!positive(row.yieldPercent)||row.yieldPercent>100||!positive(row.factor))throw Error('Invalid family '+name);
}
const spiral=data.policy.families.SPIRAL_WOUND;
if(!positive(spiral.metalVolumeFraction)||!positive(spiral.fillerVolumeFraction)||spiral.metalVolumeFraction+spiral.fillerVolumeFraction>1)throw Error('Invalid winding volume fractions');
for(const row of Object.values(data.policy.materials))if(!positive(row.densityKgM3)||!positive(row.fallbackRawRsKg))throw Error('Invalid material density/rate');
if(!positive(data.policy.p90Ratio)||data.policy.p90Ratio<1)throw Error('Invalid P90 ratio');
for(const group of ['spiral','sheet','fullFace','rtjMappings']){
  const seen=new Set();for(const row of data.dimensions[group]){
    const key=`${row.nps}|${row.rating}`;
    if(seen.has(key)||!positive(row.nps)||!positive(row.rating)||!positive(row.sourcePage))throw Error('Invalid/duplicate geometry '+group+' '+key);
    seen.add(key);
    if(group==='spiral'&&!(0<row.innerIdMm&&row.innerIdMm<row.windingIdMm&&row.windingIdMm<row.windingOdMm&&row.windingOdMm<row.outerOdMm))throw Error('Invalid spiral geometry');
    if(['sheet','fullFace'].includes(group)&&!(0<row.idMm&&row.idMm<row.odMm))throw Error('Invalid sheet geometry');
  }
}
for(const row of data.dimensions.rtjRings)if(!positive(row.pitchMm)||!positive(row.heightMm)||!(0<row.flatMm&&row.flatMm<row.widthMm))throw Error('Invalid RTJ geometry');
const output='// GENERATED: default policy + published geometry; do not edit this bundle.\n'+'globalThis.PIPING_GASKET_BUDGET_LIBRARY = '+JSON.stringify(data,null,2).replace(/</g,'\\u003c')+';\n';
const target=path.join(root,'gasket-budget-library.bundle.js');
if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8')!==output)throw Error('Rebuild gasket budget bundle');}
else fs.writeFileSync(target,output);
console.log('Gasket budget policy/dimension offline snapshot verified.');
