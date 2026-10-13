import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const stable = value => JSON.stringify(value,(_,v)=>v && !Array.isArray(v) && typeof v==='object'
  ? Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))) : v);
export const objectDigest = value => digest(stable(value) ?? 'undefined');
export const readJSON = async path => JSON.parse(await readFile(path,'utf8'));
export async function editionData(root) {
  return Promise.all((await readdir(join(root,'data/editions'))).filter(f=>/^\d{4}-W\d{2}-(?:r\d+-)?(tue|thu)\.json$/.test(f)).map(f=>readJSON(join(root,'data/editions',f))));
}
export const imageId = ed => ed.flagship.artwork?.image_id || ed.flagship.photo?.id;
export async function pinFor(root,ed,photos) {
  const record=photos.photos.find(p=>p.id===imageId(ed));
  if(!record)throw Error('Released artwork has no registry record.');
  const files={};for(const w of record.widths) {
    const file=`${record.file}-${w}.jpg`;files[file]=digest(await readFile(join(root,'photos',file)));
  }
  return {image_id:record.id,association:objectDigest({artwork:ed.flagship.artwork||null,photo:ed.flagship.photo||null}),record:objectDigest(record),files};
}
export async function lockProblems(root,editions,photos,{publicTree=false,anchor=true}={}) {
  const issues=[];let locks;
  try{locks=await readJSON(join(root,'data/artwork-locks.json'));}catch{return ['Missing immutable artwork registry.'];}
  if(locks.schema_version!==1 || !locks.editions)return ['Invalid immutable artwork registry.'];
  if(anchor) {
    // Existing master pins cannot be deleted or edited along with the assets they protect.
    const old=spawnSync('git',['show','origin/master:rupert/data/artwork-locks.json'],{cwd:root,encoding:'utf8'});
    if(old.status===0)for(const [id,pin]of Object.entries(JSON.parse(old.stdout).editions))
      if(objectDigest(locks.editions[id])!==objectDigest(pin))issues.push('A master artwork pin was changed or removed.');
  }
  for(const ed of editions) {
    if(['published','withdrawn'].includes(ed.status)) {
      if(!locks.editions[ed.id])issues.push(`${ed.id}: released artwork is not pinned.`);
      else if(objectDigest(await pinFor(root,ed,photos))!==objectDigest(locks.editions[ed.id]))issues.push(`${ed.id}: published artwork bytes, record or association changed.`);
    } else if(publicTree)issues.push('An unpublished edition is in the public release tree.');
  }
  for(const id of Object.keys(locks.editions))if(!editions.some(e=>e.id===id && ['published','withdrawn'].includes(e.status)))issues.push('A pinned historical edition was removed.');
  if(publicTree)for(const p of photos.photos)if(p.generation && !Object.values(locks.editions).some(x=>x.image_id===p.id))issues.push('Unused generated artwork is in public assets.');
  return issues;
}
export async function appendPins(root,editions,photos) {
  const path=join(root,'data/artwork-locks.json'),locks=await readJSON(path);
  for(const ed of editions)if(['published','withdrawn'].includes(ed.status) && !locks.editions[ed.id])locks.editions[ed.id]=await pinFor(root,ed,photos);
  await writeFile(path,JSON.stringify(locks,null,2)+'\n');
}
