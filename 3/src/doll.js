import {sculptureFor,parts,p,e} from './sculptures.js';
import './sculptures-disney.js';
import './sculptures-pixar-games.js';
import './sculptures-catalog.js';

function tint(hex,amount) {
  const rgb=hex.replace('#','').match(/.{2}/g).map(value=>parseInt(value,16));
  return '#'+rgb.map(value=>Math.round(amount>0?value+(255-value)*amount:value*(1+amount)).toString(16).padStart(2,'0')).join('');
}

export function dollArt(c,namespace='doll') {
  const sculpt=sculptureFor(c),id=`${namespace}-${c.id}`;
  const skin=sculpt.skin||c.skin,body=sculpt.bodyColor||(sculpt.animal?skin:c.outfit);
  const headMaterial=`url(#${id}-head)`,bodyMaterial=`url(#${id}-body)`;
  const defs=`<defs><radialGradient id="${id}-head" cx="30%" cy="22%" r="85%"><stop stop-color="${tint(skin,.16)}"/><stop offset=".52" stop-color="${skin}"/><stop offset="1" stop-color="${tint(skin,-.2)}"/></radialGradient><linearGradient id="${id}-body" x2="1" y2=".3"><stop stop-color="${tint(body,.12)}"/><stop offset=".55" stop-color="${body}"/><stop offset="1" stop-color="${tint(body,-.23)}"/></linearGradient></defs>`;
  let art=e(40,117,30,3.5,'#343039','opacity=".13"')+sculpt.back;
  art+=Object.hasOwn(sculpt,'feet')?sculpt.feet:parts.boots(sculpt.boots);
  if(sculpt.limbs!==false) {
    const sleeve=sculpt.animal?headMaterial:bodyMaterial;
    art+=p('M25 72Q14 68 10 82L10 92Q16 96 21 90L30 78Z',sleeve)+p('M55 72Q66 68 70 82L70 92Q64 96 59 90L50 78Z',sleeve);
    art+=e(14,92,5.5,6,headMaterial)+e(66,92,5.5,6,headMaterial);
  }
  art+=p(sculpt.bodyShape,bodyMaterial,`stroke="${tint(body,-.3)}" stroke-width=".65"`)+sculpt.costume;
  if(!sculpt.animal&&!sculpt.masked)art+=e(9,42,4,6,headMaterial)+e(71,42,4,6,headMaterial);
  art+=p(sculpt.headShape,headMaterial,`stroke="${tint(skin,-.32)}" stroke-width=".65"`)+sculpt.hair+sculpt.underEyes;
  if(sculpt.customEyes)art+=sculpt.customEyes;
  else if(sculpt.eyeType==='white')art+=p('M16 35 32 39 29 47 21 48Z','#f3f3e8')+p('M64 35 48 39 51 47 59 48Z','#f3f3e8');
  else art+=parts.eyes();
  if(!sculpt.animal&&!sculpt.masked)art+=e(40,49,2.2,1.8,tint(skin,-.13));
  art+=sculpt.face+e(25,23,8,2.3,'#fff','opacity=".07" transform="rotate(-16 25 23)"')+sculpt.prop;
  return defs+art;
}

export function dollPortrait(c,namespace='portrait') {
  return `<svg viewBox="-20 -12 120 140" fill="none" aria-hidden="true">${dollArt(c,namespace)}</svg>`;
}

export function dollImage(c) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -12 120 140" fill="none">${dollArt(c,'pile')}</svg>`;
  return `<image class="doll-image" x="-20" y="-12" width="120" height="140" href="data:image/svg+xml,${encodeURIComponent(svg)}"/>`;
}
