const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const folder of ['src','site'])test(folder+': confirmed profile collection partitions every About photo without duplicates',()=>{
 const c={window:{}};vm.createContext(c);
 for(const file of ['media.js','chanel-subjects.js'])vm.runInContext(fs.readFileSync(folder+'/data/'+file,'utf8'),c);
 const page=fs.readFileSync('src/index.html','utf8');vm.runInContext(page.slice(page.indexOf('function aboutPhotoGroups'),page.indexOf('function openProfileCollection')),c);
 const own=c.window.MEDIA.filter(x=>x.own&&x.type!=='video'),groups=c.aboutPhotoGroups(own);
 assert.equal(groups.profile.length,79);assert.equal(groups.work.length,146);
 assert.equal(new Set(groups.profile.concat(groups.work).map(x=>x.src)).size,225);
 assert.deepEqual(Array.from(c.window.CHANEL_SUBJECT_SOURCES).sort(),Array.from(groups.profile,x=>x.src).sort());
});
