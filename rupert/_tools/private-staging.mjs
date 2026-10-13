// One private packet; master is the authority for consumed artwork. No network credentials here.
import { readFile, writeFile, mkdir, realpath, cp, stat, readdir, chmod } from 'node:fs/promises';
import { join, resolve, sep, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { digest, objectDigest, readJSON, editionData, imageId, lockProblems } from './artwork-lock.mjs';
import { validate } from './validate.mjs';
import { reuseEligibility } from '../assets/js/core/recommendations.js';
import { accessProblem } from '../assets/js/core/publication.js';
import { nyDateString } from '../assets/js/core/dates.js';
import { expectedPublish } from '../assets/js/core/editions.js';
import { cycleWeekend } from '../assets/js/core/cycles.js';
import { loadRecommendationHistory } from './history-input.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const sealedType='rupert-private-preparation';
export function seal(payload) {return {...payload,checksum:objectDigest(payload)};}
export function verifySeal(packet) {const {checksum,...payload}=packet;assert(checksum===objectDigest(payload),'Private packet checksum mismatch.');return payload;}
export async function privatePath(root,path) {
  assert(/^_private\/$/m.test(await readFile(join(root,'.gitignore'),'utf8')),'Private staging requires the canonical ignore rule.');
  const base=join(await realpath(root),'_private');await mkdir(base,{recursive:true,mode:0o700});await chmod(base,0o700);
  assert(await realpath(base)===base,'Private staging directory cannot be a symlink.');
  const requested=resolve(path),originalRoot=resolve(root),target=requested.startsWith(originalRoot+sep)?join(await realpath(root),relative(originalRoot,requested)):requested;
  assert(target.startsWith(base+sep),'Output must be inside the ignored Atlas private directory.');
  await mkdir(resolve(target,'..'),{recursive:true,mode:0o700});
  const parent=await realpath(resolve(target,'..')),actualBase=await realpath(base);
  assert(parent===actualBase || parent.startsWith(actualBase+sep),'Private output escapes through a symlink.');
  try {assert(!(await stat(target)).isSymbolicLink(),'Private output is a symlink.');assert((await realpath(target)).startsWith(base+sep),'Private output escapes.');}catch(e){if(e.code!=='ENOENT')throw e;}
  return target;
}
async function workspaceFiles(dir,prefix='',{publicOnly=false}={}) {
  const out=[];for(const entry of await readdir(dir,{withFileTypes:true})) {
    if(entry.name==='_private' || entry.name==='__pycache__' || entry.name==='node_modules' || entry.name.startsWith('.') && entry.name!=='.gitignore' || publicOnly && entry.name.startsWith('_'))continue;
    const path=prefix?prefix+'/'+entry.name:entry.name;
    if(entry.isDirectory())out.push(...await workspaceFiles(join(dir,entry.name),path,{publicOnly}));else out.push(path);
  }return out.sort();
}
async function assemblyBaseline(root) {
  const files=await workspaceFiles(root),identity=await workspaceFiles(resolve(root,'../assets/identity'));
  files.push(...identity.map(path=>'../assets/identity/'+path));
  const base={};for(const file of files.sort())base[file]=digest(await readFile(join(root,file)));
  try{base['personal-history-input']=digest(await readFile(join(root,'_private/recommendation-history.json')));}catch(e){if(e.code!=='ENOENT')throw e;base['personal-history-input']=null;}
  return base;
}
export function fingerprint(bytes,root=ROOT) {
  const r=spawnSync(process.env.ATLAS_PYTHON||'python3',[join(root,'_tools/artwork-fingerprint.py')],{input:bytes,maxBuffer:1024*1024});
  assert(r.status===0,'Image fingerprint/metadata check failed; Pillow-capable Python is required.');return JSON.parse(r.stdout);
}
const distance=(a,b)=>{let n=BigInt('0x'+a)^BigInt('0x'+b),bits=0;while(n){bits+=Number(n&1n);n>>=1n;}return bits;};
export function similar(a,b) {return a.pixels===b.pixels || distance(a.dhash,b.dhash)<=6;}
export async function publishedVisuals(root) {
  const photos=await readJSON(join(root,'data/photos.json')),editions=await editionData(root),out=[];
  for(const ed of editions.filter(e=>['published','withdrawn'].includes(e.status))) {
    const p=photos.photos.find(p=>p.id===imageId(ed));
    out.push(fingerprint(await readFile(join(root,'photos',`${p.file}-${p.widths[0]}.jpg`)),root));
  }return out;
}
export async function checkPacket(packet,root,{now=new Date(),ready=true}={}) {
  const p=verifySeal(packet);
  assert(p.type===sealedType && p.version===1,'Unknown private packet contract.');
  assert(Number.isFinite(+new Date(p.prepared_at)) && new Date(p.prepared_at)<=now,'Invalid preparation time.');
  assert(Array.isArray(p.candidates) && p.candidates.length<=2 && Array.isArray(p.artworks) && p.artworks.length<=4,'Keep at most two candidates and four unused artworks.');
  if(ready)assert(p.candidates.length===2 && p.artworks.length>0,'Preparation is incomplete: two independent verified candidates and approved unused artwork are required.');
  const ids=new Set(),sites=new Set(),photos=await readJSON(join(root,'data/photos.json')),base=await readJSON(join(root,'data/places.json'));
  const schema=await readJSON(join(root,'schema/edition.schema.json')),photoSchema=await readJSON(join(root,'schema/photo.schema.json'));
  const checks=await readJSON(join(root,'data/access-checks.json'));
  for(const c of p.candidates) {
    assert(['primary','alternative'].includes(c.key)&&!ids.has(c.key),'Candidates must have unique editorial roles.');ids.add(c.key);
    assert(c.independence_key && !sites.has(c.independence_key),'Alternatives must be independent access areas.');sites.add(c.independence_key);
    assert(c.edition.status==='draft' && c.edition.slot===p.slot && c.edition.weekend.start===p.weekend.start && c.edition.weekend.end===p.weekend.end,'Wrong private draft slot/weekend.');
    assert(c.edition.id===p.edition_id,'Both alternatives must target the same upcoming slot identity.');
    assert(!validate(c.edition,schema).length,'Private candidate does not satisfy the edition schema.');
    const point=[...(c.places||[]),...base.places].find(x=>x.id===c.edition.flagship.place_id)?.access;
    assert(point?.coords_verified===true && Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.coords_source,'Verify public trailhead coordinates before preparation.');
    for(const place of c.places||[]) {const existing=base.places.find(x=>x.id===place.id);assert(!existing || objectDigest(existing)===objectDigest(place),'Prepared candidates cannot overwrite an existing public place.');}
    const v=c.verification;
    assert(v && ['official_access','dog_rules','parking','route','coordinates','current_conditions'].every(k=>v[k]===true) && v.note?.length>=30 && Number.isFinite(+new Date(v.reviewed_at)) && new Date(v.reviewed_at)<=now,'Preparation requires substantive official-source verification.');
    assert(now-new Date(v.reviewed_at)<=48*3600000,'Prepared candidate evidence is over 48 hours old; reverify privately.');
    assert(!accessProblem({...c.edition,status:'published',published_at:v.reviewed_at},c.checks,checks.official_hosts),'Prepared official access is closed, disputed or unverified.');
    assert(c.checks.some(x=>x.place_id===c.edition.flagship.place_id && x.checked_at && new Date(x.checked_at)<=now && new Date(x.checked_at)<=new Date(v.reviewed_at)),'Official review needs its actual evidence timestamp.');
  }
  const visuals=await publishedVisuals(root),artIds=new Set(),compositions=new Set();
  const history=await editionData(root),recent=history.filter(e=>['published','withdrawn'].includes(e.status)).sort((a,b)=>b.published_at.localeCompare(a.published_at)).slice(0,3);
  for(const ed of recent){const key=photos.photos.find(p=>p.id===imageId(ed))?.generation?.composition_key;if(key)compositions.add(key);}
  for(const art of p.artworks) {
    const r=art.record;
    assert(r && !artIds.has(r.id) && !photos.photos.some(x=>x.id===r.id || x.file===r.file),'Reserve art ID/filename was already public or duplicated.');artIds.add(r.id);
    assert(/^atlas-plate-[a-f0-9]{12}$/.test(r.id) && r.file===r.id,'Use an opaque reserve ID, not a subject/destination filename.');
    assert(!validate(r,photoSchema).length && r.kind==='plate' && r.provenance==='editorial' && r.generation?.owner===`reserve/${r.id}` && r.generation.style_version==='atlas-engraved-3','Reserve requires an original, unassigned registered editorial plate.');
    assert(r.generation.created_at<=nyDateString(now),'Artwork creation time is in the future.');
    assert(r.plate_no===undefined,'Plate numbers are assigned only at actual guarded publication.');
    assert(r.width>0 && r.height>0 && Math.abs(r.width/r.height-.8)<.002,'Reserve illustration must be portrait 4:5.');
    assert(art.artwork?.image_id===r.id && art.artwork.brief?.length>=20 && art.artwork.characters?.includes('rupert') && new Set(art.artwork.characters).size===art.artwork.characters.length && art.artwork.characters.every(x=>['rupert','bosch','tilli'].includes(x)),'Invalid artwork identity/character record.');
    assert(art.review && ['likeness','style','composition','originality'].every(k=>art.review[k]===true) && art.review.note?.length>=30 && Number.isFinite(+new Date(art.review.reviewed_at)) && new Date(art.review.reviewed_at)<=now,'Original artwork requires a real visual review before reserve approval.');
    assert(typeof art.composition_key==='string' && art.composition_key.length>=12,'Record a private structural composition key.');
    assert(!compositions.has(art.composition_key),'Repeated structural composition in the reserve or latest three publications.');compositions.add(art.composition_key);
    assert(Object.keys(art.files||{}).length===r.widths.length,'Reserve files do not match the registry.');
    let visual;
    for(const w of r.widths) {
      const name=`${r.file}-${w}.jpg`,f=art.files[name],bytes=Buffer.from(f?.base64||'','base64');
      assert(bytes.length>0 && bytes.length<900*1024 && f.sha256===digest(bytes),'Reserve file checksum/size failed.');
      const v=fingerprint(bytes,root);assert(v.width===w && Math.abs(v.width/v.height-.8)<.002,'Reserve JPEG dimensions disagree.');
      if(w===r.widths[0])visual=v;
    }
    assert(visuals.every(v=>!similar(v,visual)),'Reserve artwork duplicates or closely resembles a published/reserve plate.');visuals.push(visual);
    assert(objectDigest(art.visual)===objectDigest(visual),'Reserve visual fingerprint mismatch.');
  }
  return p;
}
export function chooseCandidate(packet,{checks,officialHosts,history,now=new Date(),personal=null}={}) {
  const rejected=[];
  for(const c of packet.candidates) {
    const access=accessProblem({...c.edition,status:'published',published_at:now.toISOString()},checks,officialHosts);
    const reuse=reuseEligibility(c.edition,history,{at:now.toISOString(),log:personal});
    if(access || !reuse.eligible) {rejected.push({key:c.key,reason:access||reuse.reason});continue;}
    return {candidate:c,rejected};
  }return {candidate:null,rejected};
}
export async function stagePacket(root,packet,work,{candidateKey,now=new Date()}={}) {
  const baseline=await assemblyBaseline(root);
  const p=await checkPacket(packet,root,{now}),history=await editionData(root);
  assert(!history.some(e=>e.id===p.edition_id),'This slot already exists; inspect master rather than overwrite it.');
  work=await privatePath(root,work);
  try{await stat(work);throw Error('Use a fresh private assembly directory.');}catch(e){if(e.code!=='ENOENT')throw e;}
  const sourcePhotos=await readJSON(join(root,'data/photos.json'));
  const art=p.artworks.filter(a=>!sourcePhotos.photos.some(x=>x.id===a.record.id)).sort((a,b)=>a.record.id.localeCompare(b.record.id))[0];assert(art,'No unpublished approved artwork remains.');
  const access=await readJSON(join(root,'data/access-checks.json'));
  const personal=await loadRecommendationHistory([],{places:await readJSON(join(root,'data/places.json')),manifest:{editions:history},now},root);
  const choice=candidateKey?{candidate:p.candidates.find(c=>c.key===candidateKey)}:chooseCandidate(p,{checks:[...access.checks,...p.candidates.flatMap(c=>c.checks)],officialHosts:access.official_hosts,history,now,personal});
  const c=choice.candidate;assert(c,'No verified eligible candidate is ready.');
  assert(reuseEligibility(c.edition,history,{at:now.toISOString(),log:personal}).eligible,'Private candidate is not reuse-eligible.');
  const r=join(work,'rupert');await mkdir(r,{recursive:true,mode:0o700});
  for(const name of await readdir(root))if(!['_private','.git','__pycache__'].includes(name))await cp(join(root,name),join(r,name),{recursive:true});
  await cp(resolve(root,'../assets/identity'),join(work,'assets/identity'),{recursive:true});
  try{await mkdir(join(r,'_private'),{mode:0o700});await cp(join(root,'_private/recommendation-history.json'),join(r,'_private/recommendation-history.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
  const ed=structuredClone(c.edition);ed.flagship.artwork=structuredClone(art.artwork);ed.flagship.photo={id:art.record.id,alt:art.record.alt};
  const record=structuredClone(art.record);record.generation.owner=`${ed.id}/flagship`;
  record.generation.composition_key=art.composition_key;
  sourcePhotos.photos.push(record);await writeFile(join(r,'data/photos.json'),JSON.stringify(sourcePhotos,null,2)+'\n');
  for(const [name,f]of Object.entries(art.files))await writeFile(join(r,'photos',name),Buffer.from(f.base64,'base64'),{mode:0o600});
  await writeFile(join(r,`data/editions/${ed.id}.json`),JSON.stringify(ed,null,2)+'\n');
  const places=await readJSON(join(r,'data/places.json'));for(const place of c.places||[])if(!places.places.some(x=>x.id===place.id))places.places.push(place);
  await writeFile(join(r,'data/places.json'),JSON.stringify(places,null,2)+'\n');
  access.checks.push(...c.checks);await writeFile(join(r,'data/access-checks.json'),JSON.stringify(access,null,2)+'\n');
  assert(objectDigest(await assemblyBaseline(root))===objectDigest(baseline),'Atlas or identity files changed during private assembly; reassemble before release.');
  await writeFile(join(work,'assembly.json'),JSON.stringify({version:2,edition_id:ed.id,packet_checksum:packet.checksum,base:baseline,art_id:art.record.id,art_sha:objectDigest(art),created_at:now.toISOString()},null,2)+'\n',{mode:0o600});
  // Do not build or commit this private draft into the public checkout.
  return {work,edition_id:ed.id,candidate_key:c.key};
}

export async function promoteAssembly(root,work,{apply=false}={}) {
  work=await privatePath(root,work);const state=await readJSON(join(work,'assembly.json')),r=join(work,'rupert');
  assert(state.version===2,'Reassemble with the current private handoff contract before publishing.');
  const history=await editionData(root),already=history.find(e=>e.id===state.edition_id);
  if(already) {assert(['published','withdrawn'].includes(already.status) && imageId(already)===state.art_id,'Slot already exists with a different association.');assert(!(await lockProblems(root,history,await readJSON(join(root,'data/photos.json')),{publicTree:true})).length,'Published retry integrity failed.');return {already_released:true};}
  assert(objectDigest(await assemblyBaseline(root))===objectDigest(state.base),'Atlas or identity files changed since private assembly; refetch/reassemble before release.');
  const target=await readJSON(join(r,`data/editions/${state.edition_id}.json`)),now=new Date();
  assert(target.weekend.start===cycleWeekend(now).start && now>=expectedPublish(target.slot,target.weekend.start),'Guarded private release failed: target publication slot is not due; public checkout is unchanged.');
  const check=spawnSync(process.execPath,[join(r,'_tools/publish.mjs'),'release',...(apply?['--apply']:[])],{encoding:'utf8',maxBuffer:4*1024*1024});
  await writeFile(join(work,'release-validation.log'),check.stdout+check.stderr,{mode:0o600});
  const reason=check.stderr.split('\n').find(line=>line.startsWith(state.edition_id+': '));
  assert(check.status===0,'Guarded private release failed; public checkout is unchanged. '+(reason||'See private release log.'));
  if(!apply)return {ready:true};
  const released=await readJSON(join(r,`data/editions/${state.edition_id}.json`));
  assert(released.status==='published' && imageId(released)===state.art_id,'Private release did not publish the expected association.');
  const audit=spawnSync(process.execPath,[join(r,'_tools/rupert.mjs'),'audit'],{encoding:'utf8',maxBuffer:4*1024*1024});
  await writeFile(join(work,'privacy-validation.log'),audit.stdout+audit.stderr,{mode:0o600});assert(audit.status===0,'Private release privacy audit failed; public checkout is unchanged.');
  // Copy only differences from the audited public tree; no private paths/tools or unrelated sites.
  const changed=[];for(const file of await workspaceFiles(r,'',{publicOnly:true})) {if(file.startsWith('.'))continue;const bytes=await readFile(join(r,file));let old;try{old=await readFile(join(root,file));}catch(e){if(e.code!=='ENOENT')throw e;}if(!old?.equals(bytes))changed.push({file,bytes});}
  // No deletions, and recheck the base before the first public write. Commit/push remains a leased master transaction.
  assert(objectDigest(await assemblyBaseline(root))===objectDigest(state.base),'Atlas or identity files changed during release; nothing integrated.');
  for(const {file,bytes}of changed){await mkdir(resolve(root,file,'..'),{recursive:true});await writeFile(join(root,file),bytes);}
  return {released:true,changed_files:changed.map(x=>x.file)};
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [cmd,input,output]=process.argv.slice(2);
  try {
    if(cmd==='init') {const path=await privatePath(ROOT,input);await writeFile(path,JSON.stringify(seal({type:sealedType,version:1,prepared_at:new Date().toISOString(),edition_id:null,slot:null,weekend:null,candidates:[],artworks:[]}),null,2)+'\n',{mode:0o600,flag:'wx'});console.log('Private store initialized; not ready for publication.');}
    else if(cmd==='seal') {const p=seal(await readJSON(input));await checkPacket(p,ROOT);const path=await privatePath(ROOT,output);await writeFile(path,JSON.stringify(p,null,2)+'\n',{mode:0o600});console.log('Private packet validated and sealed; two candidates and unused artwork remain undisclosed.');}
    else if(cmd==='check') {await checkPacket(await readJSON(input),ROOT);console.log('Private preparation verified; contents withheld.');}
    else if(cmd==='stage') {const r=await stagePacket(ROOT,await readJSON(input),output,{candidateKey:process.argv.includes('--alternative')?'alternative':undefined});console.log(JSON.stringify(r));}
    else if(cmd==='publish') {textResult(await promoteAssembly(ROOT,input,{apply:process.argv.includes('--apply')}));}
    else throw Error('Usage: private-staging.mjs init PRIVATE_STORE | seal PRIVATE_INPUT PRIVATE_PACKET | check PRIVATE_PACKET | stage PRIVATE_PACKET PRIVATE_WORK [--alternative] | publish PRIVATE_WORK [--apply]');
  }catch(e){console.error(e.message);process.exitCode=1;}
}
function textResult(result){console.log(JSON.stringify(result));}
