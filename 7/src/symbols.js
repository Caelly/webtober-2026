// A shared seal with two independent markings: 10 × 10 distinct silhouettes.
const point=(radius,position)=>{const angle=(position*36-90)*Math.PI/180;return [24+radius*Math.cos(angle),24+radius*Math.sin(angle)].map(n=>n.toFixed(3)).join(' ');};
export function sealDescription(id){return `Sceau, marque extérieure ${Math.floor(id/10)+1}, marque intérieure ${id%10+1}`;}
export function sealSvg(id){const outer=Math.floor(id/10),inner=id%10;return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="11"/><path d="m24 19 5 5-5 5-5-5Z"/><path class="seal-mark" d="M${point(15,outer)} ${point(21,outer)}M${point(8,inner)} ${point(14,inner)}"/></svg>`;}
