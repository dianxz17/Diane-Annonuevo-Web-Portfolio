
/* CEEL 301 projects. Data lives in data.js; only verified tools belong in tools/technologies. */
(() => {
 'use strict';
 const site=window.SITE||{base:'',url:x=>x,html:x=>x};
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const periods=Object.freeze({prelim:'Prelim',midterm:'Midterm',finals:'Finals'});
 const normalize=s=>String(s??'').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const activities=p=>(p.activityNumber||[]).map(n=>'Activity '+n);
 const tags=p=>[...(p.tools||[]),...(p.technologies||[])].filter((v,i,a)=>a.indexOf(v)===i);
 function searchable(p){
  return normalize([p.title,p.description,p.overview,p.designFocus,p.academicPeriod,p.category,p.projectType,p.year,p.role,p.status,...activities(p),...tags(p),...(p.keywords||[]),...(p.gallery||[]).flatMap(g=>[g.title,g.caption])].join(' '));
 }
 function filter(items,query='',period='all'){
  const terms=normalize(query).split(/\s+/).filter(Boolean);
  const requestedActivities=[...normalize(query).matchAll(/\bactivity\s+(\d+)\b/g)].map(m=>Number(m[1]));
  return items.filter(p=>(period==='all'||p.academicPeriod===period)&&requestedActivities.every(n=>(p.activityNumber||[]).includes(n))&&terms.every(term=>searchable(p).includes(term)));
 }
 function cards(items){
  return items.map(p=>'<article class="card project-card"><a class="project-card-link" href="/projects/'+e(p.slug)+'" aria-label="View project: '+e(p.title)+'"><div class="project-cover"><img src="'+e(p.coverImage)+'" alt="'+e(p.coverAlt||p.title)+'" loading="lazy" decoding="async" width="640" height="480"></div><div class="card-body"><div class="meta"><span>'+e(periods[p.academicPeriod])+'</span><span>'+e(p.year)+'</span></div><p class="project-category">'+e(p.category)+'</p><h3>'+e(p.title)+'</h3><p class="project-description">'+e(p.description)+'</p><div class="tags">'+[...activities(p),...tags(p)].map(t=>'<span class="tag">'+e(t)+'</span>').join('')+'</div><p class="small-note">'+e(p.status)+' · '+e(p.projectType)+'</p><span class="text-link project-action">View Project <span aria-hidden="true">↗</span></span></div></a></article>').join('');
 }
 function listing(){
  return '<div class="projects-page"><div class="page-title"><span class="eyebrow">CEEL 301 · GRAPHIC DESIGN</span><h1>Explore the work.</h1><p class="lead">A collection of creative outputs from my Graphic Design coursework, showcasing my progress from traditional artwork to digital design.</p></div><section class="project-browser" aria-label="Browse coursework"><div class="project-search"><label for="search">Search projects</label><div class="search-row"><input id="search" type="search" placeholder="Try logo, banner, Activity 4, or 2026…" aria-describedby="search-help" aria-controls="results" autocomplete="off"><button class="button secondary" id="clear-search" type="button">Clear Search</button></div><p id="search-help" class="small-note">Search by name, tool, category, activity, year, or project type.</p></div><div class="period-filters" role="group" aria-label="Academic period"><button type="button" data-period="all" aria-pressed="true" aria-controls="results">All Projects</button>'+Object.entries(periods).map(([key,label])=>'<button type="button" data-period="'+key+'" aria-pressed="false" aria-controls="results">'+label+'</button>').join('')+'</div><p id="result-count" class="small-note" role="status" aria-live="polite" aria-atomic="true"></p><div id="results" class="grid project-grid"></div></section></div>';
 }
 function bindListing(){
  const input=document.querySelector('#search'),results=document.querySelector('#results'),count=document.querySelector('#result-count'),buttons=[...document.querySelectorAll('[data-period]')];
  let period='all';
  const update=()=>{
   const found=filter(window.PORTFOLIO.projects,input.value,period);
   const scope=period==='all'?'all periods':periods[period];
   count.textContent=found.length+' project'+(found.length===1?'':'s')+' found · '+scope;
   if(found.length)results.innerHTML=site.html(cards(found));
   else if(period==='finals'&&!window.PORTFOLIO.projects.some(p=>p.academicPeriod==='finals')){
    results.innerHTML='<div class="empty projects-empty"><span class="eyebrow">FINALS · NEXT CHAPTER</span><h2>Final projects are coming soon.</h2><p>My Figma design and low-fidelity wireframe will be added here once completed.</p></div>';
   }else{
    results.innerHTML='<div class="empty projects-empty"><h2>No projects found.</h2><p>Try another search or choose a different academic period.</p><button type="button" class="button secondary" id="empty-clear-search">Clear Search</button></div>';
    document.querySelector('#empty-clear-search').addEventListener('click',clear);
   }
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.period===period)));
  };
  function clear(){input.value='';update();input.focus();}
  input.addEventListener('input',update);
  document.querySelector('#clear-search').addEventListener('click',clear);
  buttons.forEach(b=>b.addEventListener('click',()=>{period=b.dataset.period;update();}));
  update();
 }
 function detail(p){
  const facts=[['Academic period',periods[p.academicPeriod]],['Category',p.category],['Year',p.year],['Creator’s role',p.role],['Status',p.status],['Project type',p.projectType]];
  if(activities(p).length)facts.push(['Activities',activities(p).join(', ')]);
  return '<div class="project-detail"><a class="back" href="/projects">← Back to Projects</a><div class="page-title"><span class="eyebrow">CEEL 301 · '+e(periods[p.academicPeriod])+' · '+e(p.year)+'</span><h1>'+e(p.title)+'</h1><p class="lead">'+e(p.description)+'</p></div><section class="project-overview section" aria-labelledby="overview-title"><div><span class="eyebrow">PROJECT OVERVIEW</span><h2 id="overview-title">The work behind the image.</h2><p>'+e(p.overview)+'</p><h3>Design focus</h3><p>'+e(p.designFocus)+'</p>'+(tags(p).length?'<h3>Tools &amp; materials</h3><div class="tags">'+tags(p).map(t=>'<span class="tag">'+e(t)+'</span>').join('')+'</div>':'')+'</div><dl class="facts project-facts">'+facts.map(([k,v])=>'<div><dt>'+e(k)+'</dt><dd>'+e(v)+'</dd></div>').join('')+'</dl></section><section class="section project-gallery-section" aria-labelledby="gallery-title"><div class="section-head"><div><span class="eyebrow">THE OUTPUTS</span><h2 id="gallery-title">Artwork &amp; process</h2><p>Select any image to explore the full artwork.</p></div><span class="small-note">'+p.gallery.length+' image'+(p.gallery.length===1?'':'s')+'</span></div><div class="artwork-grid">'+p.gallery.map((g,i)=>'<figure class="artwork"><button type="button" class="artwork-open" data-image="'+i+'" aria-label="Enlarge '+e(g.title)+'" aria-haspopup="dialog"><img src="'+e(g.src)+'" alt="'+e(g.alt)+'" loading="lazy" decoding="async"'+(g.width?' width="'+g.width+'" height="'+g.height+'"':'')+'><span class="enlarge-hint" aria-hidden="true">View artwork ↗</span></button><figcaption><h3>'+e(g.title)+'</h3><p>'+e(g.caption)+'</p></figcaption></figure>').join('')+'</div></section>'+(p.externalLinks?.length?'<section class="project-sources" aria-labelledby="source-title"><h2 id="source-title">Original files</h2><p class="small-note">Optional sources open in a new tab. Google Drive access may be required.</p><div class="actions">'+p.externalLinks.map(l=>'<a class="button secondary" href="'+e(l.url)+'" target="_blank" rel="noopener">'+e(l.label)+' <span aria-hidden="true">↗</span></a>').join('')+'</div></section>':'')+'<a class="back project-back-bottom" href="/projects">← Back to Projects</a><dialog id="artwork-lightbox" class="artwork-lightbox" aria-labelledby="lightbox-title" aria-describedby="lightbox-caption"><div class="lightbox-toolbar"><p id="lightbox-position" class="small-note" aria-live="polite"></p><button type="button" class="lightbox-close" aria-label="Close artwork" autofocus>Close <span aria-hidden="true">×</span></button></div><div class="lightbox-stage"><button type="button" class="lightbox-prev" aria-label="Previous artwork">←</button><img id="lightbox-image" alt=""><button type="button" class="lightbox-next" aria-label="Next artwork">→</button></div><div class="lightbox-caption"><h2 id="lightbox-title"></h2><p id="lightbox-caption"></p><p class="small-note">Use ← and → to browse. Press Esc to close.</p></div></dialog></div>';
 }
 function bindLightbox(p){
  const dialog=document.querySelector('#artwork-lightbox'),img=document.querySelector('#lightbox-image'),prev=dialog.querySelector('.lightbox-prev'),next=dialog.querySelector('.lightbox-next');
  let current=0,opener;
  function show(index){
   current=(index+p.gallery.length)%p.gallery.length;
   const g=p.gallery[current];
   img.src=site.url(g.fullSrc||g.src);img.alt=g.alt;
   document.querySelector('#lightbox-title').textContent=g.title;
   document.querySelector('#lightbox-caption').textContent=g.caption;
   document.querySelector('#lightbox-position').textContent=(current+1)+' / '+p.gallery.length;
   prev.hidden=next.hidden=p.gallery.length<2;
  }
  document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{
   opener=b;show(Number(b.dataset.image));dialog.showModal();document.body.classList.add('lightbox-open');
  }));
  prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
  dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.classList.remove('lightbox-open');opener?.focus();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('keydown',event=>{
   if(event.key==='Tab'){
    const controls=[...dialog.querySelectorAll('button:not([hidden])')].filter(b=>b.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus();}
   }
   if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}
   if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}
   if(event.key==='Home'){event.preventDefault();show(0);}
   if(event.key==='End'){event.preventDefault();show(p.gallery.length-1);}
  });
 }
 window.CEEL={periods,filter,cards,listing,bindListing,detail,bindLightbox};
})();

