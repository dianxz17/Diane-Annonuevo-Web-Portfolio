
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);
const d=ctx.window.PORTFOLIO;
for(const p of d.projects){
 for(const g of p.gallery){
  const source=path.join('dist',g.fullSrc),dest=path.join('dist',g.src);
  const info=await sharp(source).autoOrient().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:92}).toFile(dest);
  g.width=info.width;g.height=info.height;
 }
 // Cover source is chosen explicitly; do not infer it from gallery ordering.
 const sources={'apple-of-my-eye':'apple-of-my-eye.jpg','pur-dyn-brand-identity':'pur-dyn-horizontal.png','typography-advertising-studies':'coke-kasalo-poster.jpg','tech-week-digital-marketing':'tech-week-social-media-post.png'};
 const cover=p.gallery.find(g=>g.fullSrc.endsWith(sources[p.slug]));
 p.coverAlt=cover.alt;
 await sharp(path.join('dist',cover.fullSrc)).resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toFile(path.join('dist',p.coverImage));
}
fs.writeFileSync('dist/data.js','window.PORTFOLIO = '+JSON.stringify(d,null,2)+';\n');
console.log('Optimized 19 gallery previews and four covers; rotated four photographed artworks; originals preserved.');

