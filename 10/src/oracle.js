import {assessQuestion} from './question-safety.js';
export const answers=Object.freeze([
 'Oui, sans l’ombre d’un doute.', 'Non. Les astres sont formels.',
 'Le moment est presque venu.', 'Un joli oui se dessine.',
 'Patience. Tout vient à point.', 'Ce serait une excellente idée.',
 'Pas cette fois-ci.', 'Une surprise vous attend.',
 'La réponse est déjà en vous.', 'Osez. Le reste suivra.',
 'Mieux vaut laisser passer la nuit.', 'Les signes sont favorables.',
 'Absolument. Foncez.', 'Il manque encore une petite pièce.',
 'L’univers vous fait un clin d’œil.', 'Un détour pourrait tout changer.',
 'Ne comptez pas trop dessus.', 'Oui, mais pas comme vous l’imaginez.',
 'Quelque chose de beau se prépare.', 'Écoutez votre première intuition.',
 'Les astres ont besoin d’un café.', 'Le destin dit oui. Avec panache.',
 'C’est un non plutôt convaincant.', 'Vous pourriez bien avoir raison.',
 'Le hasard est de votre côté.', 'Demain y verra plus clair.',
 'La boule hésite. Vous aussi ?', 'La chance aime les audacieux.',
 'Un grand oui. Un tout petit mais.', 'Ce n’est pas le bon chemin.',
 'Vous avez déjà fait le plus dur.', 'Une rencontre changera la donne.',
 'Le doute mérite encore un instant.', 'Votre prochain pas sera le bon.',
 'N’insistez pas. Essayez autrement.', 'Les étoiles gardent le mystère.',
]);
export function createOracle(random=Math.random){
 let phase='idle',question='',answer=null,last=-1,refusal=null,sensitiveContext=false;
 const snapshot=()=>Object.freeze({phase,question,answer,refusal});
 return {
  snapshot,
  ask(value){
   if(phase==='waiting'||typeof value!=='string')return false;
   const clean=value.trim();if(!clean||clean.length>240){phase='idle';question='';answer=null;refusal=null;return false;}
   const assessment=assessQuestion(clean,{sensitiveContext});
   if(!assessment.allowed){phase='blocked';question='';answer=null;refusal=assessment;sensitiveContext=true;return false;}
   question=clean;answer=null;refusal=null;sensitiveContext=false;phase='waiting';return true;
  },
  reveal(){
   if(phase!=='waiting')return null;
   // Skip the last reply so consecutive consultations feel distinct.
   const count=answers.length-(last>=0?1:0),roll=random();
   let index=Math.floor(Math.max(0,Math.min(.999999999,Number.isFinite(roll)?roll:0))*count);
   if(last>=0&&index>=last)index++;
   last=index;answer=answers[index];phase='answered';return snapshot();
  },
  clear(){phase='idle';question='';answer=null;refusal=null;return snapshot();}
 };
}
