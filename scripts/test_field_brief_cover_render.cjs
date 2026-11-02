/* Optional rendered-art audit using the QA runtime's existing sharp renderer.
   No dependency is added to the site or unattended publisher. */
'use strict';
const sharp=require('sharp'),assert=require('node:assert/strict'),fs=require('fs');
const art=require('../daily-watchlist-5/artwork'),archive=require('../personal-updates/issue-mark-archive');
const e=JSON.parse(fs.readFileSync('daily-watchlist-5/index.html','utf8').match(/id="briefing-data">([\s\S]*?)<\/script>/)[1]).editions.find(x=>x.date==='2026-11-02');
const proposal=art.issueModel({date:e.date,no:37,title:e.issueTitle,stories:e.stories,framing:[e.deck,e.signalTitle,...e.signal].join(' ')},archive);
const geometry=art.issuePlate(proposal,['#f1e6d0','#221a14','#8a2a36','#c5ad88']);
async function render(value){const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 560"><rect width="600" height="560" fill="#f1e6d0"/>'+art.centralArtwork(value)+'</svg>';const {data,info}=await sharp(Buffer.from(svg)).resize(144,144,{fit:'fill'}).removeAlpha().raw().toBuffer({resolveWithObject:true});return Array.from({length:info.width*info.height},(_,i)=>Math.abs(data[i*3]-241)+Math.abs(data[i*3+1]-230)+Math.abs(data[i*3+2]-208)>45?1:0);}
function iou(a,b){let intersection=0,union=0;for(let i=0;i<a.length;i++){intersection+=a[i]&&b[i];union+=a[i]||b[i];}return intersection/union;}
(async()=>{const p=await render(geometry),nov1=await render(archive['fb:2026-11-01']),nov2=await render(archive['fb:2026-11-02']);const scores=[];for(const m of Object.values(archive).filter(m=>m.key==='fb'))scores.push({date:m.date,iou:iou(p,await render(m))});
 assert(scores.every(x=>x.iou<.70),'proposal is materially distinct from all rendered archived covers');assert.equal(iou(nov1,nov1),1);
 console.log(JSON.stringify({renderer:'sharp SVG rasterization, 144x144, palette-aware foreground mask',originalAdjacent:iou(nov1,nov2),proposalVsNov1:iou(p,nov1),proposalVsNov2:iou(p,nov2),nearest:scores.sort((a,b)=>b.iou-a.iou).slice(0,3),compared:scores.length},null,2));})().catch(e=>{console.error(e);process.exitCode=1});
