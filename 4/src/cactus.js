import {spines} from './game.js';

const silhouette='M310 560V421H266C207 421 176 394 176 341V292C176 268 191 249 212 249C233 249 248 268 248 290V332Q248 350 269 350H310V143C310 88 340 64 374 64C414 64 445 96 445 142V307H465Q493 307 493 280V218C493 186 512 173 531 173C552 173 566 191 566 214V294C566 355 526 383 475 383H445V560Z';

export function cactusArtwork(){
  let seed=41;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const flecks=Array.from({length:1000},()=>`<ellipse cx="${170+random()*400}" cy="${65+random()*500}" rx="${.5+random()*.9}" ry="${.5+random()*1.5}" fill="${random()>.5?'#c1ce97':'#213d2d'}" opacity="${.05+random()*.11}"/>`).join('');
  const grains=Array.from({length:130},()=>`<circle cx="${243+random()*267}" cy="${574+random()*83}" r="${.4+random()*1.1}" fill="#6e392d" opacity=".16"/>`).join('');
  return `<svg class="cactus-art" viewBox="150 30 450 670" xmlns="http://www.w3.org/2000/svg" aria-label="Cactus en pot avec ${spines.length} épines à retirer" role="group">
  <defs>
    <linearGradient id="cactus-skin"><stop stop-color="#203f31"/><stop offset=".22" stop-color="#456e4f"/><stop offset=".51" stop-color="#8b9e68"/><stop offset=".7" stop-color="#577c51"/><stop offset="1" stop-color="#264d38"/></linearGradient>
    <linearGradient id="rib-light"><stop stop-color="#d4dd9a" stop-opacity=".03"/><stop offset=".45" stop-color="#b9c780" stop-opacity=".32"/><stop offset="1" stop-color="#1c3a2a" stop-opacity=".4"/></linearGradient>
    <linearGradient id="clay"><stop stop-color="#9e5f46"/><stop offset=".25" stop-color="#c28563"/><stop offset=".62" stop-color="#d4a382"/><stop offset="1" stop-color="#a7654c"/></linearGradient>
    <linearGradient id="rim"><stop stop-color="#b27c5f"/><stop offset=".5" stop-color="#e0b08c"/><stop offset="1" stop-color="#ae7358"/></linearGradient>
    <radialGradient id="soil"><stop stop-color="#584739"/><stop offset="1" stop-color="#2e2920"/></radialGradient>
    <radialGradient id="shadow"><stop stop-color="#534934" stop-opacity=".22"/><stop offset="1" stop-color="#534934" stop-opacity="0"/></radialGradient>
    <radialGradient id="petal"><stop stop-color="#f0c1a4"/><stop offset=".6" stop-color="#d99283"/><stop offset="1" stop-color="#b7686a"/></radialGradient>
    <clipPath id="cactus-clip"><path d="${silhouette}"/></clipPath>
    <clipPath id="pot-clip"><path d="M237 561L263 648Q378 684 493 648L520 561Z"/></clipPath>
  </defs>
  <g aria-hidden="true">
    <ellipse cx="393" cy="672" rx="204" ry="25" fill="url(#shadow)"/>
    <ellipse cx="378" cy="558" rx="145" ry="31" fill="#8e5c46"/>
    <ellipse cx="378" cy="554" rx="134" ry="23" fill="url(#soil)"/>
    <path d="${silhouette}" fill="url(#cactus-skin)"/>
    <g clip-path="url(#cactus-clip)">
      <path d="M310 560V141Q308 85 348 69L327 132V560Z" fill="#152f25" opacity=".35"/>
      <path d="M336 565V146Q333 86 363 67Q350 102 352 145V565Z" fill="url(#rib-light)"/>
      <path d="M366 565V140Q366 83 375 65Q390 98 388 140V565Z" fill="url(#rib-light)"/>
      <path d="M402 565V144Q402 98 386 68Q422 84 424 144V565Z" fill="url(#rib-light)"/>
      <path d="M329 563V146Q328 97 359 75M362 560V142Q358 93 375 68M397 560V147Q400 94 382 71M429 561V143Q427 97 397 78" fill="none" stroke="#213f2e" stroke-opacity=".24" stroke-width="2.3"/>
      <path d="M200 255V337Q199 388 262 389H310M229 255V336Q225 371 270 371H310M517 180V286Q520 343 466 345H445M545 180V292Q545 367 475 367H445" fill="none" stroke="url(#rib-light)" stroke-width="16"/>
      <path d="M189 262V340Q190 401 267 405H310M242 270V331Q242 357 273 359H310M503 187V284Q503 321 465 322H445M554 193V291Q552 376 473 377H445" fill="none" stroke="#1c3c2b" stroke-opacity=".22" stroke-width="2"/>
      ${flecks}
    </g>
    <path d="M237 561L263 648Q378 684 493 648L520 561Z" fill="url(#clay)"/>
    <g clip-path="url(#pot-clip)">${grains}<path d="M270 580 283 641Q335 655 373 655" stroke="#edc4a4" stroke-opacity=".23" stroke-width="3" fill="none"/><path d="M484 584 472 644" stroke="#794630" stroke-opacity=".13" stroke-width="5"/></g>
    <path d="M237 556Q378 603 520 556L516 577Q378 622 241 577Z" fill="url(#rim)"/>
    <path d="M242 577Q378 621 516 577" fill="none" stroke="#75442f" stroke-opacity=".22"/>
    <path d="M248 560Q378 601 508 560" fill="none" stroke="#f3ceb0" stroke-opacity=".5" stroke-width="1.5"/>
    <g class="cactus-flower" transform="translate(375 74)"><g class="flower-petals">
      ${Array.from({length:9},(_,n)=>`<ellipse cy="-19" rx="9" ry="23" transform="rotate(${n*40})" fill="url(#petal)" stroke="#a96b68" stroke-width=".4"/>`).join('')}
      <circle r="10" fill="#d0a760"/><circle r="6" fill="#eace85"/>
      ${Array.from({length:9},(_,n)=>`<circle cx="${Math.cos(n)*6}" cy="${Math.sin(n)*6}" r="1" fill="#856c36"/>`).join('')}
    </g></g>
  </g>
  <g id="spines">${spines.map((pin,i)=>`<g class="spine" id="${pin.id}" data-spine="${pin.id}" transform="translate(${pin.x} ${pin.y})" role="button" tabindex="0" aria-label="Retirer l’épine ${i+1}, ${pin.region}" style="--pluck-x:${Math.sin(pin.angle*Math.PI/180)*65}px;--pluck-y:${-Math.cos(pin.angle*Math.PI/180)*65}px">
    <circle class="spine-hit" r="21" fill="transparent"/>
    <circle class="spine-halo" r="14" fill="#ecdfb7"/>
    <ellipse class="areole" rx="3.4" ry="2.7" fill="#c5b98d"/>
    <g class="needle" transform="rotate(${pin.angle})"><path d="M0 2 1.8 -${pin.length} -.9 -${pin.length-3}Z" fill="#efe0bb"/><path d="M.2 1 .3 -${pin.length-1}" stroke="#786344" stroke-width=".65"/><path d="M2 2 4 -${pin.length-6}" stroke="#1e3829" stroke-opacity=".2" stroke-width="1"/></g>
  </g>`).join('')}</g>
  </svg>`;
}
