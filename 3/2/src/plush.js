import {dollArt} from '../../src/doll.js';
import {sculptureFor,parts,p,e} from '../../src/sculptures.js';
const cache=new Map();
const metal={bronze:['#f0c89b','#bc8152','#785034'],silver:['#fafbff','#adbcc9','#71818e'],gold:['#fff0ad','#e1b745','#987025']};

export function plushSvg(character,rarity='normal'){
  const key=`${character.id}-${rarity}`,id=`plush-${key}`;
  let art=dollArt(character,id);
  // Matte fabric, embroidered seams and irregular fibres replace the vinyl shine.
  art=art.replaceAll('stroke-width=".65"','stroke-width="1.1" stroke-dasharray="2 2"');
  let palette='';
  if(metal[rarity]){
    const [light,mid,dark]=metal[rarity];
    palette=`<linearGradient id="${id}-thread" x2=".8" y2="1"><stop stop-color="${light}"/><stop offset=".5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
    // Keep dark facial embroidery readable in every metallic thread edition.
    art=art.replace(/fill="(#[\da-fA-F]{6})"/g,(match,color)=>{
      const rgb=color.slice(1).match(/../g).map(n=>parseInt(n,16));
      return Math.max(...rgb)<75?match:`fill="url(#${id}-thread)"`;
    }).replace(/fill="url\(#[^\"]+-(head|body)\)"/g,`fill="url(#${id}-thread)"`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-22 -16 124 148" fill="none"><defs>${palette}<filter id="${id}-fabric" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="${Number(character.id.replace(/\D/g,''))%97}" result="noise"/><feColorMatrix in="noise" type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".38" intercept=".62"/><feFuncG type="linear" slope=".38" intercept=".62"/><feFuncB type="linear" slope=".38" intercept=".62"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/><feDisplacementMap in2="noise" scale=".85" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#${id}-fabric)">${art}</g></svg>`;
}
export function plushImage(c,rarity='normal'){
  const key=`${c.id}:${rarity}`;
  if(!cache.has(key))cache.set(key,`data:image/svg+xml,${encodeURIComponent(plushSvg(c,rarity))}`);
  return cache.get(key);
}

// Semantic parts let the 3D sculptor wrap clothing and facial details over volumes.
export function sculptureSvg(c,rarity){
  const sculpt=sculptureFor(c),colors=metal[rarity];
  const skin=sculpt.skin||c.skin,body=sculpt.bodyColor||(sculpt.animal?skin:c.outfit);
  const part=(name,art)=>`<g data-part="${name}">${art}</g>`;
  let art=part('back',sculpt.back)+part('feet',Object.hasOwn(sculpt,'feet')?sculpt.feet:parts.boots(sculpt.boots));
  if(sculpt.limbs!==false){
    const sleeve=sculpt.animal?skin:body;
    art+=part('arms',p('M25 72Q14 68 10 82L10 92Q16 96 21 90L30 78Z',sleeve)+p('M55 72Q66 68 70 82L70 92Q64 96 59 90L50 78Z',sleeve));
    art+=part('hands',e(14,92,5.5,6,skin)+e(66,92,5.5,6,skin));
  }
  art+=part('body',p(sculpt.bodyShape,body))+part('clothing',sculpt.costume);
  if(!sculpt.animal&&!sculpt.masked)art+=part('ears',e(9,42,4,6,skin)+e(71,42,4,6,skin));
  art+=part('head',p(sculpt.headShape,skin))+part('hair',sculpt.hair)+part('face-relief',sculpt.underEyes);
  let eyes;
  if(sculpt.customEyes)eyes=sculpt.customEyes;
  else if(sculpt.eyeType==='white')eyes=p('M16 35 32 39 29 47 21 48Z','#f3f3e8')+p('M64 35 48 39 51 47 59 48Z','#f3f3e8');
  else eyes=parts.eyes();
  art+=part('eyes',eyes);
  if(!sculpt.animal&&!sculpt.masked)art+=part('nose',e(40,49,2.2,1.8,skin));
  art+=part('face',sculpt.face)+part('accessory',sculpt.prop);
  // Keep black inlays and small ivory highlights, tint every other physical part.
  if(colors)art=art.replace(/(fill|stroke)="(#[\da-fA-F]{3,6})"/g,(m,attr,color)=>{
    const hex=color.length===4?color.slice(1).split('').map(n=>n+n).join(''):color.slice(1),rgb=hex.match(/../g).map(v=>parseInt(v,16));
    if(Math.max(...rgb)<75)return m;
    return `${attr}="${colors[1]}"`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" fill="none">${art}</svg>`;
}
