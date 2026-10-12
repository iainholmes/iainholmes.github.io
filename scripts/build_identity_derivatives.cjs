/* Deterministic source-pixel matting. Requires ImageMagick `convert`.
   No generated artwork, tracing, resampling, or changes to canonical sources. */
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'desk/assets/identity');
const out = path.join(root, 'assets/identity');
function read(name, w, h) {
  const raw = execFileSync('convert', [path.join(source, name), '-depth', '8', 'rgba:-']);
  if (raw.length !== w*h*4) throw Error('Unexpected source dimensions');
  return raw;
}
function write(name, raw, w, h) {
  execFileSync('convert', ['-size', `${w}x${h}`, '-depth', '8', 'rgba:-', '-define', 'png:exclude-chunks=date,time', path.join(out,name)], {input:raw});
}
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
// Convex support only protects the enclosed cream illustration; it does not
// draw the circle. Every edge sample is matted from its original source color.
function hull(points) {
  points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lower=[],upper=[];
  for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(const p of points.toReversed()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function inside(x,y,poly) {
  return poly.every((a,i)=>{const b=poly[(i+1)%poly.length];return (b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0])>=0;});
}
function matte(raw,w,h,kind) {
  const result=Buffer.alloc(raw.length), core=new Uint8Array(w*h), solid=new Uint8Array(w*h);
  const points=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,k=i*4,[r,g,b]=raw.subarray(k,k+3);
    const ink=kind==='copper' ? r-g>35&&g-b>15&&b<130 : g-r>22&&g-b>7&&r<48;
    if(ink){core[i]=1;points.push([x,y]);}
  }
  const boundary=kind==='copper'?hull(points):null;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;
    if(boundary&&inside(x,y,boundary)){solid[i]=1;continue;}
    if(!core[i])continue;
    let full=true;
    for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)
      if(xx<0||yy<0||xx>=w||yy>=h||!core[yy*w+xx])full=false;
    solid[i]=full?1:0;
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,k=i*4;
    if(solid[i]){raw.copy(result,k,k,k+4);continue;}
    // Estimate coverage from chroma against nearby opaque source ink. Neutral
    // paper/shadows have zero chroma and do not survive as white edge halos.
    let nearest=-1,best=Infinity;
    for(let yy=Math.max(0,y-7);yy<=Math.min(h-1,y+7);yy++)for(let xx=Math.max(0,x-7);xx<=Math.min(w-1,x+7);xx++){
      const j=yy*w+xx;
      if(!core[j])continue;
      const distance=(xx-x)**2+(yy-y)**2+(solid[j]?0:100);
      if(distance<best){nearest=j;best=distance;}
    }
    if(nearest<0)continue;
    const p=[...raw.subarray(k,k+3)],f=[...raw.subarray(nearest*4,nearest*4+3)];
    const pm=p.reduce((s,v)=>s+v,0)/3,fm=f.reduce((s,v)=>s+v,0)/3;
    const den=f.reduce((s,v)=>s+(v-fm)**2,0);
    let a=Math.max(0,Math.min(1,p.reduce((s,v,c)=>s+(v-pm)*(f[c]-fm),0)/den));
    if(a<.012)continue;
    // Do not turn background color noise into a colored veil.
    if(kind==='green' && !(p[1]>p[0]&&p[1]>p[2]))continue;
    if(kind==='copper' && !(p[0]>p[1]&&p[1]>p[2]))continue;
    result[k+3]=clamp(a*255);
    for(let c=0;c<3;c++)result[k+c]=clamp((p[c]-(1-a)*255)/a);
  }
  return result;
}
const master=fs.readFileSync(path.join(source,'ih-master.png'));
if(createHash('sha256').update(master).digest('hex')!=='7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619')throw Error('Canonical master changed');
const original=read('ih-signature.png',466,438),period=read('ih-period.png',60,60);
const green=Buffer.from(original);
// Exclude the period from letter matting; reinsert its independently protected
// illustration at the exact integer crop offset in the canonical master.
for(let y=343;y<403;y++)for(let x=380;x<440;x++)green.fill(255,(y*466+x)*4,(y*466+x)*4+4);
const signature=matte(green,466,438,'green'),coin=matte(period,60,60,'copper');
for(let y=0;y<60;y++)coin.copy(signature,((y+343)*466+380)*4,y*60*4,(y+1)*60*4);
const night=Buffer.from(signature);
for(let y=0;y<438;y++)for(let x=0;x<466;x++){
  if(x>=380&&x<440&&y>=343&&y<403)continue;
  const k=(y*466+x)*4;if(!night[k+3])continue;
  // Ivory lettering retains the original alpha/geometry and restrained source
  // tonal variation. The copper period is byte-identical in both treatments.
  const tone=(signature[k]*.2126+signature[k+1]*.7152+signature[k+2]*.0722)/255;
  const light=.94+.06*tone;
  [243,239,229].forEach((v,c)=>night[k+c]=clamp(v*light));
}
write('ih-signature.png',signature,466,438);
write('ih-signature-night.png',night,466,438);
write('ih-period.png',coin,60,60);
console.log('Three source-derived transparent PNGs written; canonical sources unchanged.');
