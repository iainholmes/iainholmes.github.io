/* Rehearse legitimate growth without touching production files or .git. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict'),fx=require('./fixtures/art-originality.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'periodicals-growth-')),before=fx.currentHistory(fx.root),outputs=fx.snap(fx.root);
try{
 fx.copySite(fx.root,dir);const growth=fx.append(dir);let checks=fx.assertHistory(growth.after,before);
 for(const kind of ['brief','workbook','journal']){assert.equal(Object.keys(growth.after[kind]).length,Object.keys(before[kind]).length+1);checks++;}
 // Run the actual permanent suites on the augmented files, not a mocked result.
 const env={...process.env,PERIODICALS_TEST_GIT_ROOT:process.env.PERIODICALS_TEST_GIT_ROOT||fx.root};delete env.SHELF_FIXTURE;
 for(const test of ['test_art_originality.cjs','test_workbook_marks.cjs'])process.stdout.write(cp.execFileSync(process.execPath,['scripts/'+test],{cwd:dir,env,encoding:'utf8',stdio:'pipe'}));
 // The actual permanent test command must still fail on serialized mutations.
 const mutationCases=[
  ['personal-updates/issue-mark-archive.js',s=>{const pins=fx.load(s);pins['cp:2026-10-08'].frozen+='<!-- unauthorized test mutation -->';return 'module.exports='+JSON.stringify(pins);}],
  ['daily-econ-challenge/index.html',s=>{const payload=fx.data(s,'challenge-data');payload.editions[0].questions[0].stem+=' Unauthorized test mutation.';return fx.replaceData(s,'challenge-data',payload);}],
  ['weekly-economics-environment/index.html',s=>{const original=fx.editions(s)['2026-10-23'];return s.replace(original,original.replace('data-title="','data-title="UNAUTHORIZED '));}],
  ['weekly-economics-environment/index.html',s=>{const field=fx.data(s,'field-studies');field['2026-10-23'].html+='<!-- unauthorized test mutation -->';return fx.replaceData(s,'field-studies',field);}]
 ];
 for(const [file,mutate]of mutationCases){const original=fx.read(dir,file);try{fx.write(dir,file,mutate(original));assert.throws(()=>cp.execFileSync(process.execPath,['scripts/test_art_originality.cjs'],{cwd:dir,env,encoding:'utf8',stdio:'pipe'}),/immutable/,'permanent suite rejects actual historical mutation in '+file);checks++;}finally{fx.write(dir,file,original);}}
 assert.deepEqual(fx.snap(fx.root),outputs,'rehearsal does not change source publications');checks++;
 if(process.env.ART_GROWTH_FIXTURE){fs.mkdirSync(process.env.ART_GROWTH_FIXTURE,{recursive:true});fx.copySite(dir,process.env.ART_GROWTH_FIXTURE);}
 console.log(JSON.stringify({checks,result:'passed',appendedDate:growth.date,counts:{brief:Object.keys(growth.after.brief).length,workbook:Object.keys(growth.after.workbook).length,journal:Object.keys(growth.after.journal).length},fixture:process.env.ART_GROWTH_FIXTURE||'removed'}));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
