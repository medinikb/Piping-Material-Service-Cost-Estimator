// Derived class specification snapshot, never a dimension/weight/price table.
// Regenerate after changing Old NRL PMS/data: node scripts/build-gasket-class-catalog.cjs
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const records=fs.readdirSync(path.join(root,'Old NRL PMS/data')).filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(fs.readFileSync(path.join(root,'Old NRL PMS/data',f),'utf8')));
const catalog={schemaVersion:1,source:'Old NRL PMS/data',classes:records.map(d=>d.pipeClass),rows:records.flatMap(d=>d.items.filter(r=>/^Gaskets?$/i.test(r.group)).map(r=>({pipeClass:d.pipeClass,...r}))),flanges:records.flatMap(d=>d.items.filter(r=>/^Flanges?$/i.test(r.group)&&/^(?:WN|SO|BLIND)$/.test(r.type)).map(r=>({pipeClass:d.pipeClass,...r})))};
const text='// GENERATED class metadata only. No gasket dimensions, weights or prices are inferred.\n'+'globalThis.PIPING_GASKET_CLASS_CATALOG = '+JSON.stringify(catalog,null,2).replace(/</g,'\\u003c')+';\n';
const filename=path.join(root,'gasket-class-catalog.bundle.js');
if(process.argv.includes('--check')){if(fs.readFileSync(filename,'utf8')!==text)throw Error('Gasket class snapshot is out of sync.');}
else fs.writeFileSync(filename,text);
console.log(`${catalog.classes.length} classes; ${catalog.rows.length} gasket specification rows; no prices or geometry invented.`);
