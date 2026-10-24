
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
const base=path.resolve('dist/assets/ceel');
fs.mkdirSync('outputs',{recursive:true});
for(const [src,dest] of [['apple-original.jpg','apple-of-my-eye.jpg'],['typography-sketch-original.jpg','typography-sketch.jpg'],['pur-dyn-sketch.jpg','pur-dyn-sketch-upright.jpg'],['tech-week-logo-sketch.jpg','tech-week-logo-sketch-upright.jpg']]){
 const meta=await sharp(path.join(base,src)).metadata();
 console.log(src,JSON.stringify({width:meta.width,height:meta.height,orientation:meta.orientation}));
 await sharp(path.join(base,src)).autoOrient().rotate(270).jpeg({quality:98}).toFile(path.join(base,dest));
}
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
const doc=await pdfjs.getDocument({data:new Uint8Array(fs.readFileSync(path.join(base,'coke-kasalo-original.pdf'))),useSystemFonts:true}).promise;
console.log('PDF pages:',doc.numPages);
const page=await doc.getPage(1),natural=page.getViewport({scale:1}),viewport=page.getViewport({scale:2200/Math.max(natural.width,natural.height)});
const canvas=createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));
await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
fs.writeFileSync(path.join(base,'coke-kasalo-poster.jpg'),canvas.toBuffer('image/jpeg',98));

const files=fs.readdirSync(base).filter(n=>/\.(png|jpg)$/.test(n)),cells=[];
for(let i=0;i<files.length;i++){
 const name=files[i],meta=await sharp(path.join(base,name)).metadata();
 console.log(name,JSON.stringify({width:meta.width,height:meta.height,orientation:meta.orientation}));
 const thumb=await sharp(path.join(base,name)).autoOrient().resize(320,230,{fit:'contain',background:'#f5f3f8'}).png().toBuffer();
 const label=Buffer.from('<svg width="320" height="30"><rect width="320" height="30" fill="white"/><text x="8" y="20" font-size="12" fill="black">'+name+'</text></svg>');
 cells.push({input:thumb,left:(i%4)*320,top:Math.floor(i/4)*260},{input:label,left:(i%4)*320,top:Math.floor(i/4)*260+230});
}
await sharp({create:{width:1280,height:Math.ceil(files.length/4)*260,channels:3,background:'white'}}).composite(cells).jpeg().toFile('outputs/ceel-contact-sheet.jpg');

