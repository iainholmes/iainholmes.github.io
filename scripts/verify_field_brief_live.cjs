/* Read-only noninteractive release verification. Never publishes, changes tasks or marks a backup complete. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {promisify}=require('node:util'),execFile=promisify(require('node:child_process').execFile);
const {inspect,registry}=require('./check_field_brief.cjs');
const repository='iainholmes/iainholmes.github.io',api='https://api.github.com/repos/'+repository;
const files=['daily-watchlist-5/index.html','daily-watchlist-5/artwork-archive.js','daily-watchlist-5/artwork.js','personal-updates/issue-mark-archive.js','personal-updates/index.html'];
async function retrieve(url){
 const r=await execFile('curl',['--fail','--location','--silent','--show-error','--max-time','25','--retry','1',url],{encoding:'utf8',maxBuffer:16e6});
 return r.stdout;
}
async function verify({date,ref='master',get=retrieve}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!['master'].includes(ref)&&!/^[a-f0-9]{40}$/.test(ref))throw Error('Supply YYYY-MM-DD and master or an exact commit SHA');
 const commit=JSON.parse(await get(api+'/commits/'+ref));
 if(!/^[a-f0-9]{40}$/.test(commit.sha))throw Error('GitHub did not return a canonical commit');
 if(ref!=='master'&&commit.sha!==ref)throw Error('Canonical commit differs from requested commit');
 if(ref!=='master'){
  const comparison=JSON.parse(await get(api+'/compare/'+commit.sha+'...master'));
  if(!['ahead','identical'].includes(comparison.status))throw Error('Requested commit is not integrated into canonical master');
 }
 const pairs=await Promise.all(files.map(async file=>{
  const [source,live]=await Promise.all([get('https://raw.githubusercontent.com/'+repository+'/'+commit.sha+'/'+file),get('https://iainholmes.github.io/'+file)]);
  if(source!==live)throw Error('Public byte mismatch: '+file+'; retry verification of this commit after deployment, never regenerate the issue');
  return {file,source,sha256:crypto.createHash('sha256').update(live).digest('hex'),bytes:Buffer.byteLength(live)};
 }));
 const read=file=>pairs.find(x=>x.file===file).source;
 const state=inspect({date,html:read(files[0]),plates:registry(read(files[1])),marks:registry(read(files[3])),hub:read(files[4])});
 if(state.state!=='complete')throw Error('Canonical/public edition is incomplete: '+JSON.stringify(state));
 const runs=JSON.parse(await get(api+'/actions/runs?head_sha='+commit.sha+'&per_page=20')).workflow_runs;
 const run=runs?.find(x=>x.head_sha===commit.sha&&x.name==='pages build and deployment'&&x.conclusion==='success'&&x.status==='completed');
 if(!run)throw Error('No successful Pages deployment for '+commit.sha+'; retry this verification without republishing');
 // Reject an advanced master after all comparisons; do not certify an obsolete latest snapshot.
 if(ref==='master'&&JSON.parse(await get(api+'/commits/master')).sha!==commit.sha)throw Error('Master advanced during verification; retry against its current tree');
 return {report:{publication:'verified-live',commit:commit.sha,date,no:state.no,latest:state.latest,deployment:{id:run.id,url:run.html_url,completedAt:run.updated_at},verifiedAt:new Date().toISOString(),files:pairs.map(({file,sha256,bytes})=>({file,sha256,bytes})),backup:'not-synchronized-by-this-read-only-command'},sources:Object.fromEntries(pairs.map(x=>[x.file,x.source]))};
}
async function main(){
 const args=process.argv.slice(2),date=args.shift();let ref='master',output;
 while(args.length){const flag=args.shift(),value=args.shift();if(!value||!['--commit','--output'].includes(flag))throw Error('Usage: node scripts/verify_field_brief_live.cjs YYYY-MM-DD [--commit SHA] [--output DIRECTORY]');if(flag==='--commit')ref=value;else output=path.resolve(value);}
 if(output){const root=path.resolve(__dirname,'..');if(output===root||output.startsWith(root+path.sep))throw Error('Verification output must be outside the publication checkout');}
 const result=await verify({date,ref});
 // Write a handoff artifact only after every deployment/content check succeeds.
 if(output){fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(result.report,null,2)+'\n');fs.writeFileSync(path.join(output,'Daily Briefing Archive.html'),result.sources[files[0]]);}
 console.log(JSON.stringify(result.report,null,2));
}
if(require.main===module)main().catch(e=>{console.error('Verification incomplete: '+e.message);process.exitCode=1;});
module.exports={verify,files};
