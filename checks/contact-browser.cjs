
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
 let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'chrome',headless:true}),origin='http://127.0.0.1:'+server.address().port;
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let requests=[],mode='success';
 await page.route('https://formspree.io/f/**',async route=>{
  requests.push(route.request().postDataJSON());
  if(mode==='network'){await route.abort('failed');return;}
  await new Promise(r=>setTimeout(r,120));
  await route.fulfill({status:mode==='http'?503:mode==='rejected'?422:200,contentType:'application/json',body:mode==='json'?'not json':JSON.stringify(mode==='rejected'?{errors:[{message:'test rejection'}]}:{ok:true,next:'https://formspree.io/thanks'})});
 });
 const fill=async()=>{
  await page.locator('#name').fill('Portfolio Test');
  await page.locator('#email').fill('visitor@example.com');
  await page.locator('#subject').fill('A new design project');
  await page.locator('#message').fill('I would like to discuss a graphic design project.');
 };
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['light','dark']){
   await page.goto(origin+'/contact');
   await page.evaluate(t=>{document.documentElement.dataset.theme=t;localStorage.setItem('portfolio-theme',t)},theme);
   assert.equal(await page.locator('.draft').count(),0);
   assert.equal(await page.locator('.contact-links a[href="https://github.com/dianxz17"]').count(),1);
   assert.equal(await page.locator('#socials a[href="https://github.com/dianxz17"]').count(),1);
   assert.equal(await page.locator('.contact-links a[href="mailto:annonuevodyn@gmail.com"]').count(),1);
   assert(await page.locator('button[type=submit]').isEnabled());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Contact overflow');
   const before=requests.length;
   await page.locator('button[type=submit]').click();assert.equal(requests.length,before,'Empty form must not submit');
   await fill();
   await page.locator('button[type=submit]').click();
   await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='success');
   assert.equal(await page.locator('#message').inputValue(),'');
   assert(await page.locator('button[type=submit]').isEnabled());
   const sent=requests[requests.length-1];assert.equal(sent._replyto,'visitor@example.com');assert.equal(sent._subject,'Portfolio message: A new design project');assert(!('_cc' in sent));assert(!('_gotcha' in sent));
   await page.screenshot({path:'outputs/contact-'+width+'-'+theme+'.png',fullPage:true});
  }
 }
 for(mode of ['rejected','http','json','network']){
  await fill();await page.locator('button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='error');
  assert((await page.locator('#message').inputValue()).includes('graphic design project'),'Failure retains input');
  assert(await page.locator('button[type=submit]').isEnabled(),'Failure allows retry');
 }
 mode='success';
 const before=requests.length;
 await page.locator('#name').fill('   ');await page.locator('button[type=submit]').click();assert.equal(requests.length,before);
 await fill();await page.evaluate(()=>document.querySelector('#company').value='spam');await page.locator('button[type=submit]').click();assert.equal(requests.length,before,'Honeypot');
 await page.evaluate(()=>document.querySelector('#company').value='');
 await page.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='success');
 for(const route of ['/','/about','/projects','/skills','/education','/experience']){
  await page.goto(origin+route);await page.locator('h1').waitFor();assert.equal(await page.locator('.draft').count(),0);assert.equal(await page.locator('#socials a[href="https://github.com/dianxz17"]').count(),1);assert(!await page.locator('body').evaluate(b=>b.textContent.includes('ccc.edu.ph')));
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: contact at 375/768/1440px in both themes; email and GitHub; no banner; validation, submission payload, provider success/rejection, HTTP/JSON/network failures, retained input, retry, honeypot. Provider delivery is tested separately, not by these mocked requests.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

