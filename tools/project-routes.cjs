
/* Run from the portfolio root after adding/changing a project in dist/data.js. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),c);
const base=fs.readFileSync('dist/projects/index.html','utf8');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const origin='https://dianxz17.github.io';
for(const p of c.window.PORTFOLIO.projects){
 if(!['prelim','midterm','finals'].includes(p.academicPeriod))throw Error('Invalid academicPeriod: '+p.slug);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug))throw Error('Invalid slug: '+p.slug);
 let html=base.replace(/<title>.*?<\/title>/,'<title>'+esc(p.title)+' | Diane Annonuevo Portfolio</title>');
 for(const [attribute,key,value] of [['name','description',p.description],['property','og:title',p.title],['property','og:description',p.description]]){
  html=html.replace(new RegExp('<meta '+attribute+'="'+key+'" content="[^"]*">'),'<meta '+attribute+'="'+key+'" content="'+esc(value)+'">');
 }
 html=html.replace(/<meta property="og:image" content="[^"]*">/g,'').replace('</head>','<meta property="og:image" content="'+origin+esc(p.coverImage)+'"></head>');
 const dir=path.join('dist/projects',p.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);
}
console.log('Generated '+c.window.PORTFOLIO.projects.length+' project route shells.');

