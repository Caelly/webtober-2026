import {dollArt} from '../../src/doll.js';
import {sculptureFor} from '../../src/sculptures.js';
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

// The same unique character silhouette becomes a padded, bevelled plush sculpture.
export function sculptureSvg(c,rarity){
  const sculpt=sculptureFor(c),colors=metal[rarity];
  const skin=colors?.[1]||sculpt.skin||c.skin,body=colors?.[1]||sculpt.bodyColor||(sculpt.animal?skin:c.outfit);
  let art=dollArt(c,'sculpt').replace(/<defs>[\s\S]*?<\/defs>/g,'').replace(/<ellipse cx="40" cy="117"[^>]*\/>/,'')
    .replace(/url\(#[^)]*-head\)/g,skin).replace(/url\(#[^)]*-body\)/g,body);
  if(colors)art=art.replace(/(fill|stroke)="(#[\da-fA-F]{6})"/g,(m,attr,color)=>Math.max(...color.slice(1).match(/../g).map(v=>parseInt(v,16)))<75?m:`${attr}="${colors[1]}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" fill="none">${art}</svg>`;
}
