
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const context={window:{}};
for(const f of ['data.js','projects.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),context);
const projects=context.window.PORTFOLIO.projects,api=context.window.CEEL;
assert.equal(projects.length,5);
assert.deepEqual(Object.keys(api.periods),['prelim','midterm','finals']);
assert.equal(api.filter(projects,'','prelim').length,2);assert.equal(api.filter(projects,'','midterm').length,2);assert.equal(api.filter(projects,'','finals').length,1);
const cases=[['apple',1],['LOGO',3],['typography',3],['coke',1],['tech week',1],['banner',1],['prelim',2],['midterm',2],['2026',5],['Figma',1],['wireframe',1],['Activity 6',1],['Photoshop',1],['Canva',1],['Activity 1',1],['Activity 2',1],['Activity 3',1],['Activity 4',1],['Activity 5',1],['traditional illustration',1],['digital marketing campaign',1],['  ',5],['appl',1],['no such work',0],['<script>',0]];
// PUR-DYN legitimately mentions customized typography, so typography matches it too; the Finals project mentions its logo and typography.
for(const [q,n] of cases)assert.equal(api.filter(projects,q).length,n,'Search '+q);
assert.equal(api.filter(projects,'logo','prelim').length,1);
assert.equal(api.filter(projects,'Canva 2026','midterm').length,1);
assert.equal(api.filter(projects,'coke','prelim').length,0);
const future={...projects[0],academicPeriod:'finals',title:'Figma design',tools:['Figma']};
assert.equal(api.filter([...projects,future],'Figma','finals').length,2,'Future Finals data needs no layout changes');
assert(!api.cards(projects).includes('<select'));
assert(api.cards(projects).includes('View Project'));
assert(!api.cards(projects).includes('drive.google.com'));
let images=0;
for(const p of projects){
 assert(api.periods[p.academicPeriod]);
 for(const key of ['id','slug','title','category','projectType','year','role','status','description','overview','designFocus','coverImage','gallery'])assert(p[key],p.slug+' '+key);
 assert.equal(p.status,'Completed');assert.equal(p.year,2026);
 const shell=fs.readFileSync('dist/projects/'+p.slug+'/index.html','utf8');
 assert(shell.includes('/projects.js?'));assert(!shell.includes('Portfolio Preview'));
 for(const src of [p.coverImage,...p.gallery.flatMap(g=>[g.src,g.fullSrc]),...p.externalLinks.filter(l=>l.url.startsWith('/')).map(l=>l.url)])assert(fs.existsSync(path.join('dist',src)),src);
 for(const g of p.gallery){for(const key of ['src','alt','title','caption','width','height'])assert(g[key],key);images++;}
 const html=api.detail(p);assert(html.includes('Back to Projects'));assert.equal((html.match(/data-image=/g)||[]).length,p.gallery.length);assert(!/undefined|Illustrative concept/.test(html));
}
assert.equal(images,26);
assert.equal(fs.readFileSync('dist/assets/ceel/coke-kasalo-original.pdf').subarray(0,5).toString(),'%PDF-');
console.log('PASS: five project schemas, 26 gallery assets, local images/PDF, all project routes, metadata search, combined filters, empty and future Finals.');

