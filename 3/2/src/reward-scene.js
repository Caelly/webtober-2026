import {createFigurineStudio} from './figurine-studio.js';

export function showPlush(canvas,character,rarity){
  const studio=createFigurineStudio(canvas);studio.setModel(character,rarity);
  canvas.removeAttribute('tabindex');canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label',`Poupée rembourrée de ${character.name}`);
  function resize(){const r=canvas.getBoundingClientRect();studio.resize(r.width,r.height);studio.render();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  return ()=>{observer.disconnect();studio.dispose();};
}
