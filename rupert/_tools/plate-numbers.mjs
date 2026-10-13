import { imageId } from './artwork-lock.mjs';
export const plateCaption = no => `TRA Plate No. ${String(no).padStart(3,'0')}`;
// Numbers belong to image IDs, not destinations, captions, retries or image byte revisions.
export function assignPlateNumbers(editions,photos) {
  const out=structuredClone(photos),numbers=new Set();let next=0;
  for(const p of out.photos)if(p.plate_no!==undefined){
    if(!Number.isInteger(p.plate_no)||p.plate_no<1||p.plate_no>999||numbers.has(p.plate_no))throw Error('Invalid or duplicate established plate number.');
    numbers.add(p.plate_no);next=Math.max(next,p.plate_no);
  }
  for(const ed of editions.filter(e=>['published','withdrawn'].includes(e.status)).sort((a,b)=>new Date(a.published_at)-new Date(b.published_at))) {
    const p=out.photos.find(p=>p.id===imageId(ed));if(!p)throw Error('Cannot number unregistered published artwork.');
    if(p.plate_no===undefined){if(next>=999)throw Error('Three-digit plate sequence is exhausted.');p.plate_no=++next;}
    p.caption=plateCaption(p.plate_no);
  }return out;
}
export function plateNumberProblems(editions,photos) {
  const used=new Set(editions.filter(e=>['published','withdrawn'].includes(e.status)).map(imageId)),numbers=new Set(),issues=[];
  for(const p of photos.photos) {
    if(used.has(p.id) && !Number.isInteger(p.plate_no))issues.push('Published illustration lacks its permanent plate number.');
    if(p.plate_no===undefined)continue;
    if(!used.has(p.id)||!Number.isInteger(p.plate_no)||p.plate_no<1||p.plate_no>999||numbers.has(p.plate_no))issues.push('Invalid, duplicate or prematurely assigned plate number.');
    numbers.add(p.plate_no);if(p.caption!==plateCaption(p.plate_no))issues.push('Numbered illustration caption must use TRA Plate No. XXX only.');
  }return issues;
}
