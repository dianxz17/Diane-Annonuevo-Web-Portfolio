
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}
 catch{res.writeHead(404).end('Not found');}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[],failed=[];
 try{
 const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failed.push(r.status()+' '+r.url());});
 await page.goto(origin+'/projects');
 await page.locator('h1').waitFor();
 const projects=await page.evaluate(()=>window.PORTFOLIO.projects);
 const count=async n=>assert.equal(await page.locator('.project-card').count(),n);
 const search=async(q,n)=>{await page.locator('#search').fill(q);await count(n);assert((await page.locator('#result-count').textContent()).startsWith(n+' project'));};
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['dark','light']){
   await page.evaluate(t=>{localStorage.setItem('portfolio-theme',t);document.documentElement.dataset.theme=t;},theme);
   await page.goto(origin+'/projects');await count(5);
   assert.equal(await page.locator('select').count(),0);
   for(const [q,n] of [['apple',1],['LOGO',3],['typography',3],['coke',1],['tech week',1],['banner',1],['prelim',2],['midterm',2],['2026',5],['Figma',1],['wireframe',1],['no such work',0],['Photoshop',1],['Canva',1],['Activity 1',1],['Activity 4',1],['digital marketing campaign',1],['appl',1],['',5]]){
    await search(q,n);
    if(!n){assert.equal(await page.locator('.projects-empty h2').textContent(),'No projects found.');await page.locator('#empty-clear-search').click();await count(5);}
   }
   await page.locator('[data-period=prelim]').click();await count(2);await search('logo',1);
   assert((await page.locator('.project-card').textContent()).includes('PUR-DYN'));
   await page.locator('#clear-search').click();await count(2);
   await page.locator('[data-period=midterm]').click();await count(2);await search('Canva',1);
   await page.locator('#clear-search').click();
   await page.locator('[data-period=finals]').click();await count(1);await search('Figma',1);
   await search('apple',0);assert.equal(await page.locator('.projects-empty h2').textContent(),'No projects found.');
   await page.locator('#clear-search').click();await count(1);
   await page.locator('[data-period=all]').click();await count(5);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Listing overflow '+width);
   const columns=await page.locator('.project-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   assert.equal(columns,width===1440?3:width===768?2:1);
   const loaded=await page.locator('.project-cover img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode()));return imgs.every(i=>i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain');});
   assert(loaded);assert(await page.locator('.project-cover img').evaluateAll(imgs=>imgs.every(i=>Math.abs(i.clientHeight-i.parentElement.clientHeight)<=1&&Math.abs(i.clientWidth-i.parentElement.clientWidth)<=1)),'Cover image must fit its frame');
   if(theme==='dark')await page.screenshot({path:'outputs/projects-'+width+'-dark.png',fullPage:true});
   await page.locator('.theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),theme==='dark'?'light':'dark');
   await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),theme==='dark'?'light':'dark');
  }
 }
 for(const p of projects){
  await page.goto(origin+'/projects');
  await page.locator('a[href="/projects/'+p.slug+'"]').click();
  await page.waitForURL('**/projects/'+p.slug+'**');
  assert.equal(await page.locator('h1').textContent(),p.title);
  await page.reload();assert.equal(await page.locator('h1').textContent(),p.title);
  assert(await page.locator('nav a[href="/projects"]').evaluate(a=>a.classList.contains('active')));
  for(const width of [375,768,1440]){
   await page.setViewportSize({width,height:1000});
   await page.locator('.artwork:last-child').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Detail overflow '+p.slug+' '+width);
   await page.locator('[data-image="0"]').click();assert(await page.locator('dialog').evaluate(d=>{const r=d.getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight;}),'Responsive lightbox');await page.keyboard.press('Escape');
   assert(await page.locator('.artwork img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode()));return imgs.every(i=>i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain');}));
  }
  await page.setViewportSize({width:1440,height:1000});
  for(let i=0;i<p.gallery.length;i++){
   const button=page.locator('[data-image="'+i+'"]');
   await button.click();assert(await page.locator('dialog').evaluate(d=>d.open));
   assert.equal(await page.locator('#lightbox-title').textContent(),p.gallery[i].title);
   assert(await page.locator('#lightbox-image').evaluate(async i=>{await i.decode();return i.naturalWidth>0;}));
   await page.keyboard.press('Escape');
   assert(!(await page.locator('dialog').evaluate(d=>d.open)));
   assert(await button.evaluate(b=>b===document.activeElement),'Focus restoration');
  }
  await page.locator('[data-image="0"]').click();
  if(p.gallery.length>1){
   await page.locator('.lightbox-next').click();assert.equal(await page.locator('#lightbox-position').textContent(),'2 / '+p.gallery.length);
   await page.locator('.lightbox-prev').click();assert.equal(await page.locator('#lightbox-position').textContent(),'1 / '+p.gallery.length);
   await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#lightbox-position').textContent(),p.gallery.length+' / '+p.gallery.length);
   await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#lightbox-position').textContent(),'1 / '+p.gallery.length);
   await page.keyboard.press('End');await page.keyboard.press('Home');assert.equal(await page.locator('#lightbox-position').textContent(),'1 / '+p.gallery.length);
  }else assert(await page.locator('.lightbox-next').isHidden());
  for(let i=0;i<7;i++){await page.keyboard.press('Tab');assert(await page.locator('dialog').evaluate(d=>d.contains(document.activeElement)),'Modal focus trap');}
  await page.locator('.lightbox-close').click();
  await page.locator('[data-image="0"]').focus();await page.keyboard.press('Enter');assert(await page.locator('dialog').evaluate(d=>d.open));await page.keyboard.press('Escape');
  const pdf=page.locator('a[href$=".pdf"]');
  if(await pdf.count()){const response=await page.request.get(origin+await pdf.getAttribute('href'));assert.equal(response.status(),200);assert((await response.body()).subarray(0,5).toString()==='%PDF-');}
  await page.screenshot({path:'outputs/'+p.slug+'.png',fullPage:true});
  await page.locator('.project-back-bottom').click();await count(5);
 }
 for(const route of ['/','/about','/skills','/experience','/education','/contact','/cv']){
  await page.goto(origin+route);await page.locator('h1').waitFor();
  assert.equal(await page.locator('h1').count(),1);assert(!await page.locator('main').evaluate(el=>/undefined|Illustrative concept/.test(el.textContent)));
 }
 for(const old of ['identity-study','interface-exploration','workspace-concept']){await page.goto(origin+'/projects/'+old);await page.waitForURL('**/projects');await count(5);}
 assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(failed,[],'Failed requests');
 console.log('PASS: Chrome at 375/768/1440px; both themes; live search and all periods; counts; all 5 direct/refreshed routes; 26 image previews; lightbox buttons, arrows, Esc, focus trap/return; PDF; legacy redirects; unrelated pages. No JS errors or failed asset requests.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

