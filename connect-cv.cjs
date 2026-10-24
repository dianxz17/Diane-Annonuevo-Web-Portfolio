const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const source='../ANNONUEVO_RESUME.pdf',target='dist/assets/annonuevo_resume.pdf';
assert.equal(fs.readFileSync(source).subarray(0,5).toString(),'%PDF-','Resume must be a PDF');
fs.copyFileSync(source,target);
let data=fs.readFileSync('dist/data.js','utf8');assert(data.includes("cv: ''"));data=data.replace("cv: ''","cv: '/assets/annonuevo_resume.pdf'");fs.writeFileSync('dist/data.js',data,'utf8');
let app=fs.readFileSync('dist/app.js','utf8');app=app.replace(' download>Download CV',' download="annonuevo_resume.pdf">Download CV');fs.writeFileSync('dist/app.js',app,'utf8');
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name==='index.html'){let html=fs.readFileSync(f,'utf8').replace('Personal details, projects and CV are awaiting your content.','Project details and professional links are being updated.').replaceAll('?v=3','?v=4');fs.writeFileSync(f,html,'utf8');}}}walk('dist');
const context={window:{}};vm.runInNewContext(data,context);assert.equal(context.window.PORTFOLIO.cv,'/assets/annonuevo_resume.pdf');assert(fs.readFileSync(source).equals(fs.readFileSync(target)));assert(app.includes('download="annonuevo_resume.pdf"'));console.log('PDF signature, exact file copy, CV configuration and download filename verified.');
