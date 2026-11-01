/* Base path: '' when served from a domain root, or the folder name (e.g. '/Annonuevo_Diane_Portfolio') on a GitHub project site. */
(() => {
 'use strict';
 const script=document.currentScript,base=script?new URL('.',script.src).pathname.replace(/\/$/,''):'';
 const local=p=>typeof p==='string'&&p.startsWith('/')&&!p.startsWith('//');
 const url=p=>local(p)&&!(base&&(p===base||p.startsWith(base+'/')))?base+p:p;
 const html=h=>base?String(h).replace(/(\s(?:href|src)=")\/(?!\/)/g,'$1'+base+'/'):h;
 window.SITE={base,url,html};
})();
