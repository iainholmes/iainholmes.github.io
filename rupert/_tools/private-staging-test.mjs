// Synthetic packets only. No real upcoming editorial/artwork content is generated or exposed.
import assert from 'node:assert/strict';
import { mkdtemp, cp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { seal,verifySeal,checkPacket,stagePacket,promoteAssembly,fingerprint,chooseCandidate,similar,privatePath } from './private-staging.mjs';
import { readJSON,editionData,digest,objectDigest,lockProblems } from './artwork-lock.mjs';
import { reservePrompt } from './art-direction.mjs';
import { cycleWeekend } from '../assets/js/core/cycles.js';
import { expectedPublish } from '../assets/js/core/editions.js';
import { isoWeek,nyTimestamp,nyDateString } from '../assets/js/core/dates.js';
const source=fileURLToPath(new URL('../',import.meta.url)),scratch=await mkdtemp(join(tmpdir(),'atlas-private-pipeline-')),root=join(scratch,'rupert');
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};
try {
  await mkdir(root);for(const name of await readdir(source))if(!['_private','__pycache__'].includes(name))await cp(join(source,name),join(root,name),{recursive:true});
  await cp(resolve(source,'../assets/identity'),join(scratch,'assets/identity'),{recursive:true});await mkdir(join(root,'_private'),{mode:0o700});
  const now=new Date(),weekend=cycleWeekend(now),slot=now>=expectedPublish('thursday',weekend.start)?'thursday':'tuesday';
  const week=isoWeek(weekend.start),id=`${week.year}-W${String(week.week).padStart(2,'0')}-${slot.slice(0,3)}`;
  const histories=await editionData(root),seed=await readJSON(join(source,'data/editions/2026-W42-tue.json'));
  const existing=histories.find(e=>e.id===id),locks=await readJSON(join(root,'data/artwork-locks.json'));
  const photos=await readJSON(join(root,'data/photos.json'));
  if(existing){await rm(join(root,`data/editions/${id}.json`));delete locks.editions[id];const old=photos.photos.find(p=>p.id===(existing.flagship.artwork?.image_id||existing.flagship.photo.id));photos.photos=photos.photos.filter(p=>p.id!==old.id);for(const w of old.widths)await rm(join(root,'photos',`${old.file}-${w}.jpg`));}
  await writeFile(join(root,'data/artwork-locks.json'),JSON.stringify(locks));await writeFile(join(root,'data/photos.json'),JSON.stringify(photos));
  const place=(await readJSON(join(root,'data/places.json'))).places.find(p=>p.id==='hanging-rock-trail');
  const hostData=await readJSON(join(root,'data/access-checks.json'));
  const makeCandidate=(key,n)=>{const ed=structuredClone(seed);ed.id=id;ed.slot=slot;ed.weekend=weekend;ed.status='draft';ed.published_at=nyTimestamp(expectedPublish(slot,weekend.start));ed.flagship.place_id=`fixture-access-${n}`;ed.flagship.snapshot.route.route_id=`fixture-route-${n}@1`;ed.flagship.snapshot.as_of=nyDateString(now);delete ed.flagship.artwork;ed.flagship.photo={id:'private-unassigned',alt:'Unassigned private fixture artwork'};
    ed.conditions.as_of=nyTimestamp(new Date(+now-60000));ed.conditions.source.issued_at=new Date(ed.conditions.as_of).toISOString();ed.conditions.checked_at=now.toISOString();ed.conditions.source.retrieved_at=now.toISOString();
    const p=structuredClone(place);p.id=ed.flagship.place_id;
    return {key,independence_key:`fixture-independent-${n}`,edition:ed,places:[p],checks:[{place_id:p.id,checked:nyDateString(now),checked_at:new Date(+now-1000).toISOString(),official_url:'https://www.ncparks.gov/state-parks/hanging-rock-state-park',status:'open',discrepancy:false,note:'Synthetic fixture access evidence, never a real preparation.'}],verification:{reviewed_at:now.toISOString(),official_access:true,dog_rules:true,parking:true,route:true,coordinates:true,current_conditions:true,note:'Synthetic verified-candidate fixture for integration tests only.'}};};
  const bytes=spawnSync(process.env.ATLAS_PYTHON||'python3',['-c',"from PIL import Image;import sys;im=Image.new('RGB',(160,200));im.putdata([((x*13+y*7)%256,(x*x+y*11)%256,(y*y+x*17)%256) for y in range(200) for x in range(160)]);im.save(sys.stdout.buffer,'JPEG',quality=78,subsampling=0)"],{maxBuffer:1024*1024});assert.equal(bytes.status,0);const image=bytes.stdout;
  const art={record:{id:'atlas-plate-000000000001',file:'atlas-plate-000000000001',kind:'plate',provenance:'editorial',width:160,height:200,widths:[160],alt:'Synthetic test image; not editorial artwork',focal:[.5,.5],caption:'Illustration',generation:{owner:'reserve/atlas-plate-000000000001',created_at:nyDateString(now),style_version:'atlas-engraved-3'}},artwork:{image_id:'atlas-plate-000000000001',characters:['rupert'],brief:'Synthetic private test brief, never an upcoming illustration.'},composition_key:'fixture-original-layout-only',review:{likeness:true,style:true,composition:true,originality:true,reviewed_at:now.toISOString(),note:'Synthetic fixture review flags for integration testing only.'},files:{'atlas-plate-000000000001-160.jpg':{base64:image.toString('base64'),sha256:digest(image)}},visual:fingerprint(image,root)};
  const payload={type:'rupert-private-preparation',version:1,prepared_at:now.toISOString(),edition_id:id,slot,weekend,candidates:[makeCandidate('primary',1),makeCandidate('alternative',2)],artworks:[art]},packet=seal(payload);
  const p=join(root,'_private/packet.json');await writeFile(p,JSON.stringify(packet),{mode:0o600});
  ok(objectDigest(verifySeal(await readJSON(p)))===objectDigest(payload),'Sealed packet persists between reads');await checkPacket(await readJSON(p),root,{now});checks++;
  const corrupt=structuredClone(packet);corrupt.artworks[0].files['atlas-plate-000000000001-160.jpg'].base64+='x';assert.throws(()=>verifySeal(corrupt),/checksum/);checks++;
  const duplicate=structuredClone(payload);duplicate.candidates[1].independence_key=duplicate.candidates[0].independence_key;await assert.rejects(()=>checkPacket(seal(duplicate),root,{now}),/independent/);checks++;
  const stale=structuredClone(payload);stale.candidates[0].verification.reviewed_at=new Date(+now-49*3600000).toISOString();await assert.rejects(()=>checkPacket(seal(stale),root,{now}),/48 hours/);checks++;
  const missingCoords=structuredClone(payload);missingCoords.candidates[0].places[0].access.coords_verified=false;await assert.rejects(()=>checkPacket(seal(missingCoords),root,{now}),/coordinates/);checks++;
  await assert.rejects(()=>privatePath(root,join(scratch,'public.json')),/ignored/);checks++;
  const direction=reservePrompt({brief:'Synthetic neutral composition brief for prompt verification.'});ok(direction.includes('Portrait 4:5') && !direction.includes(seed.flagship.title),'Artwork prompt is destination independent and 4:5');
  ok(similar(art.visual,art.visual),'Exact/near visual duplicates are rejected');
  const badReview=structuredClone(payload);badReview.artworks[0].review.originality=false;await assert.rejects(()=>checkPacket(seal(badReview),root,{now}),/visual review/);checks++;
  const duplicateArt=structuredClone(payload);duplicateArt.artworks.push(structuredClone(art));await assert.rejects(()=>checkPacket(seal(duplicateArt),root,{now}),/duplicated/);checks++;
  const publicDup=structuredClone(payload);publicDup.artworks[0].record.id=photos.photos[0].id;await assert.rejects(()=>checkPacket(seal(publicDup),root,{now}),/already public/);checks++;
  const currentChecks=payload.candidates.flatMap(c=>c.checks),closed={...currentChecks[0],status:'closed'};
  const choice=chooseCandidate(payload,{checks:[...currentChecks,closed],officialHosts:hostData.official_hosts,history:await editionData(root),now});ok(choice.candidate.key==='alternative' && choice.rejected[0].key==='primary','Closed primary substitutes independent alternative');
  const historicalPhotos=objectDigest(photos),historicalPins=objectDigest(locks);
  const work=join(root,'_private/attempt-primary');await stagePacket(root,packet,work,{now});ok(objectDigest(await readJSON(join(root,'data/photos.json')))===historicalPhotos,'Private assembly leaves public registry unchanged');
  ok(!await readFile(join(root,'data/editions',id+'.json')).then(()=>true).catch(()=>false),'Private draft is absent from public edition paths');
  const preview=spawn(process.execPath,[join(root,'_tools/preview.mjs'),'--port','0'],{stdio:['ignore','pipe','pipe']});
  try {const port=await new Promise((done,fail)=>{const timer=setTimeout(()=>fail(Error('Preview startup timed out')),5000);preview.stdout.once('data',bytes=>{clearTimeout(timer);done(Number(bytes.toString().match(/:(\d+)/)[1]));});preview.once('error',e=>{clearTimeout(timer);fail(e);});preview.once('exit',()=>{clearTimeout(timer);fail(Error('Preview failed; localhost permission is required'));});});
    for(const path of ['/_private/packet.json','/%5Fprivate/packet.json','/_tools/private-staging.mjs','/photos/atlas-plate-000000000001-160.jpg'])ok((await fetch(`http://127.0.0.1:${port}${path}`)).status===404,'Unpublished/private assets cannot be served');
    ok(!(await fetch(`http://127.0.0.1:${port}/data/editions/index.json`).then(r=>r.text())).includes(art.record.id),'Public manifest discloses no reserve art');
  }finally{preview.kill();}
  const staged=await readJSON(join(work,'rupert/data/access-checks.json'));staged.checks.push(closed);await writeFile(join(work,'rupert/data/access-checks.json'),JSON.stringify(staged));
  await assert.rejects(()=>promoteAssembly(root,work,{apply:true}),/Guarded private release failed/);checks++;
  ok(objectDigest(await readJSON(join(root,'data/photos.json')))===historicalPhotos && objectDigest(await readJSON(join(root,'data/artwork-locks.json')))===historicalPins,'Failed release preserves public artwork/history');
  const alt=join(root,'_private/attempt-alternative');await stagePacket(root,packet,alt,{candidateKey:'alternative',now});
  const ae=await readJSON(join(alt,`rupert/data/editions/${id}.json`)),ar=await readJSON(join(alt,'rupert/data/editorial-reviews.json'));
  ok(ae.flagship.artwork.image_id===art.record.id,'Substitution retains unused destination-independent artwork');
  ar.reviews=ar.reviews.filter(r=>r.edition_id!==id);ar.reviews.push({edition_id:id,reviewed_at:new Date().toISOString(),conditions_as_of:ae.conditions.as_of,ready:true,note:'Synthetic current evidence and safety/artwork review fixture, not real editorial approval.'});await writeFile(join(alt,'rupert/data/editorial-reviews.json'),JSON.stringify(ar));
  if(now>=expectedPublish(slot,weekend.start) && nyDateString(now)<weekend.start) {
    let release;try{release=await promoteAssembly(root,alt,{apply:true});}catch(e){console.error(await readFile(join(alt,'release-validation.log'),'utf8'));throw e;}ok(release.released,'Real-clock canonical guarded release succeeds in synthetic isolated fixture');
    const published=await readJSON(join(root,`data/editions/${id}.json`));ok(published.status==='published' && new Date(published.published_at)<=new Date(),'Release records actual time');
    ok((await promoteAssembly(root,alt,{apply:true})).already_released,'Retry is idempotent');
    const after=await readJSON(join(root,'data/artwork-locks.json'));for(const [key,value]of Object.entries(locks.editions))ok(objectDigest(after.editions[key])===objectDigest(value),'Historical pins remain unchanged');
    ok(!(await lockProblems(root,await editionData(root),await readJSON(join(root,'data/photos.json')),{publicTree:true,anchor:false})).length,'Published artwork passes immutable/public checks');
    const filename=Object.keys(after.editions[id].files)[0],old=await readFile(join(root,'photos',filename));await writeFile(join(root,'photos',filename),Buffer.concat([old,Buffer.from('tamper')]));ok((await lockProblems(root,await editionData(root),await readJSON(join(root,'data/photos.json')),{anchor:false})).some(x=>x.includes('changed')),'Published asset tampering fails');await writeFile(join(root,'photos',filename),old);
    const assoc=structuredClone(published);assoc.flagship.artwork.brief+=' changed';ok((await lockProblems(root,[...await editionData(root)].map(e=>e.id===id?assoc:e),await readJSON(join(root,'data/photos.json')),{anchor:false})).some(x=>x.includes('changed')),'Published association tampering fails');
    const git=(...args)=>{const r=spawnSync('git',args,{cwd:scratch,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
    git('init','-q');git('config','user.name','Atlas Test');git('config','user.email','fixture@example.invalid');git('add','rupert','assets/identity');git('commit','-qm','Synthetic released baseline');git('update-ref','refs/remotes/origin/master',git('rev-parse','HEAD'));
    await writeFile(join(root,`data/editions/${id}.json`),JSON.stringify({...published,status:'draft'}));git('add',`rupert/data/editions/${id}.json`);git('commit','-qm','Synthetic forbidden public draft');await writeFile(join(root,`data/editions/${id}.json`),JSON.stringify(published));
    const audit=spawnSync(process.execPath,[join(root,'_tools/rupert.mjs'),'audit','--history'],{encoding:'utf8'});ok(audit.status===1 && audit.stderr.includes('unpublished edition in public Git history'),'History audit detects an unpublished draft even after working-tree restoration');
  }else {await assert.rejects(()=>promoteAssembly(root,alt,{apply:true}),/Guarded private release failed/);checks++;}
  console.log(`${checks} private persistence, reserve, substitution, guarded-release and immutable-history checks passed (synthetic fixtures only).`);
}finally {await rm(scratch,{recursive:true,force:true});}
