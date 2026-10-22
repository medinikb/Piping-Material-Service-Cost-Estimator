// Creates a local handoff only. Never uploads, deletes, or overwrites a release.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),target=path.join(root,'GitHub code');
const upload=path.join(target,'Upload to GitHub'),privateRoot=path.join(target,'Private references - DO NOT UPLOAD');
if(fs.existsSync(upload)||fs.existsSync(privateRoot))throw Error('Package folders already exist. Preserve them and choose a new release destination before rerunning.');
fs.mkdirSync(upload,{recursive:true});fs.mkdirSync(privateRoot,{recursive:true});
const copied=[];
function copy(relative,destination){
 const source=path.join(root,relative),output=path.join(destination,relative);
 if(!fs.existsSync(source))throw Error('Missing source '+relative);
 if(fs.statSync(source).isDirectory()){
  for(const name of fs.readdirSync(source))if(!name.startsWith('~$')&&!['desktop.ini','.DS_Store','node_modules','.git','__pycache__','gasket-weight-verification'].includes(name))copy(path.join(relative,name),destination);
 }else{
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(source,output,fs.constants.COPYFILE_EXCL);
  copied.push({section:destination===upload?'upload':'private',path:relative.replaceAll('\\','/'),bytes:fs.statSync(source).size,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')});
 }
}
for(const name of fs.readdirSync(root))if(/\.(?:js|json|css)$/i.test(name))copy(name,upload);
for(const name of ['index.html','sitemap.xml','README.md','AGENTS.md','DESIGN_SYSTEM.md','calculated-only-pricing-notes.md','component-coverage-notes.md','source-verification-log.md','regression-verification-log.md','astm_piping_material_specification_viewable.txt','Gasket Weight BOM Example.csv','Piping BOM Example Template.xlsx'])copy(name,upload);
for(const folder of ['assets','scripts','tests','Piping Service Cost for Web App','Old NRL PMS/data','Old NRL PMS/src'])copy(folder,upload);
// Retain source lookup code/JSON, but place the original workbooks privately.
for(const folder of ['Old NRL PMS/pipe_material_lookup_files','Old NRL PMS/Piping_Data']){
 for(const name of fs.readdirSync(path.join(root,folder)))copy(path.join(folder,name),/\.(?:js|json)$/i.test(name)?upload:privateRoot);
}
for(const name of ['Old NRL PMS/README.md','Old NRL PMS/PLAN.md'])copy(name,upload);
for(const name of fs.readdirSync(root)){
 if(name.startsWith('~$'))continue;
 if(/\.(?:pdf|docx|xlsx)$/i.test(name)&&name!=='Piping BOM Example Template.xlsx')copy(name,privateRoot);
}
for(const folder of ['Testing_CS pipe predictor','Validation'])copy(folder,privateRoot);
for(const name of fs.readdirSync(path.join(root,'Old NRL PMS')))if(/\.(?:pdf|xlsx)$/i.test(name))copy(path.join('Old NRL PMS',name),privateRoot);
// Website metadata only: no calculation edits in the handoff copy.
for(const file of ['index.html','README.md','sitemap.xml']){
 const output=path.join(upload,file),before=fs.readFileSync(output,'utf8');
 fs.writeFileSync(output,before.replaceAll('https://medinikb.github.io/Pipe-Price-Predictor/','https://medinikb.github.io/Piping-Material-Service-Cost-Estimator/'));
}
const sitemap=path.join(upload,'sitemap.xml');fs.writeFileSync(sitemap,fs.readFileSync(sitemap,'utf8').replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-10-22</lastmod>'));
fs.writeFileSync(path.join(upload,'.nojekyll'),'');
// Validate all non-network page files, runtime fetches, and stylesheet assets.
const local=new Set(),html=fs.readFileSync(path.join(upload,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!/^(?:https?:|data:|mailto:)/i.test(m[1]))local.add(decodeURIComponent(m[1].split(/[?#]/)[0]));
const app=fs.readFileSync(path.join(upload,'app.js'),'utf8');
for(const m of app.matchAll(/fetch\(\s*["']([^"']+)["']/g))if(!/^https?:/i.test(m[1]))local.add(decodeURIComponent(m[1]));
for(const m of fs.readFileSync(path.join(upload,'style.css'),'utf8').matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g))if(!/^(?:https?:|data:|#)/i.test(m[1]))local.add(decodeURIComponent(m[1]));
for(const name of local)if(!fs.existsSync(path.join(upload,name)))throw Error('Missing deployment dependency '+name);
for(const item of copied){const dest=path.join(item.section==='upload'?upload:privateRoot,item.path);item.packagedSha256=crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex');}
const manifest={packagedOn:'2026-10-22',repository:'https://github.com/medinikb/Piping-Material-Service-Cost-Estimator',publicMetadataOnlyChanges:['index.html canonical/OG/structured-data URL','README.md live URL','sitemap.xml URL/date'],runtimeDependenciesChecked:[...local].sort(),counts:{upload:copied.filter(r=>r.section==='upload').length+1,private:copied.filter(r=>r.section==='private').length},files:copied};
fs.writeFileSync(path.join(target,'PACKAGE-MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({upload,privateRoot,counts:manifest.counts,dependenciesChecked:local.size},null,2));
