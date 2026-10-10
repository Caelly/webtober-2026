// A local lexical guard for this entertainment-only oracle, not a clinical classifier.
const normalise=value=>value.normalize('NFKD').replace(/[\p{M}\p{Cf}]/gu,'').toLowerCase()
 .replace(/[013457]/g,char=>({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t'}[char]))
 .replace(/[^a-z]+/g,' ').trim().replace(/ +/g,' ');
const selfHarm=/\b(?:suicid[a-z]*|automutil[a-z]*|scarifi[a-z]*|overdos[a-z]*|kms|unalive|self harm)\b|\b(?:me|se|te) (?:tuer|pendre|taillader|mutiler|faire du mal|couper les veines|trancher les veines)\b|\b(?:en finir|mettre fin|finir) (?:avec |a )?(?:ma|sa|ta|la) vie\b|\b(?:je veux|je voudrais|j ai envie de|dois je|devrais je) (?:en finir|disparaitre|mourir)\b|\b(?:ne (?:[a-z]+ )*(?:plus|pas)|jamais) (?:me )?reveiller\b|\b(?:kill|hurt|hang|cut) (?:myself|yourself)\b|\b(?:end|take) my (?:own )?life\b|\b(?:want|wish) to die\b/;
const despair=/\b(?:je n ai plus|j ai plus|je ne veux plus) (?:envie de )?vivre\b|\b(?:arreter|cesser) de vivre\b|\b(?:ma|la) vie ne vaut (?:plus|pas) (?:rien|la peine)\b/;
const dangerousAction=/\b(?:sauter|me jeter|se jeter) (?:[a-z]+ ){0,5}(?:pont|fenetre|balcon|toit|falaise|train)\b|\b(?:boire|avaler|ingerer) (?:[a-z]+ ){0,4}(?:javel|poison|produit toxique)\b/;
const spacedDeath=/mourir|deces|decede|euthanasie/;
const death=/\b(?:mort(?:e|es|s|el[a-z]*|alit[a-z]*|uaire[a-z]*)?|mour(?:ir|ant[a-z]*|rai[a-z]*|ra|ras|rons|rez|ront)|meurs|meurt|deces|decede[a-z]*|defunt[a-z]*|funer[a-z]*|enterrement[a-z]*|cadavre[a-z]*|cremation|euthanas[a-z]*|tuer[a-z]*|tuera[a-z]*|tuant|assassin[a-z]*|meurtr[a-z]*|poison[a-z]*|empoison[a-z]*|dead|death|die|dying|kill[a-z]*)\b/;
const health=/\b(?:medic[a-z]*|medicine[a-z]*|medical[a-z]*|remede[a-z]*|hopital|hospital[a-z]*|cardiaque|diabete[a-z]*|meds|medoc[a-z]*|pilule[a-z]*|comprime[a-z]*|cachet[a-z]*|gelule[a-z]*|posolog[a-z]*|dosage[a-z]*|dose[a-z]*|ordonnance[a-z]*|prescri[a-z]*|pharma[a-z]*|traitement[a-z]*|therapie[a-z]*|therapeu[a-z]*|malad(?:e|es|ie[a-z]*)|sante|diagnosti[a-z]*|symptom[a-z]*|cancer[a-z]*|tumeur[a-z]*|infection[a-z]*|vaccin[a-z]*|douleur[a-z]*|gueri[a-z]*|gueris[a-z]*|soign[a-z]*|operation[a-z]*|chirurg[a-z]*|depress[a-z]*|anxiol[a-z]*|antidepres[a-z]*|antibiot[a-z]*|antidouleur[a-z]*|antalg[a-z]*|somnif[a-z]*|sedati[a-z]*|benzodiazep[a-z]*|insuline|morphine|opio[a-z]*|drogue[a-z]*|stup[a-z]*|cocaine|fentanyl|heroine|paracetamol|doliprane|dafalgan|efferalgan|ibuprofen(?:e)?|acetaminophen|advil|nurofen|aspirine|tramadol|codeine|xanax|lexomil|valium|prozac|sertraline|fluoxetine|zopiclone|zolpidem|alprazolam|diazepam|ritaline|amoxicilline|drug[a-z]*|pill[a-z]*|tablet[a-z]*|cure|illness|disease|painkiller[a-z]*)\b/;
const spacedSelfHarm=/suicide|suicider|automutil|selfharm|killmyself|overdose/;
const spacedHealth=/medicament|medication|somnifere|antidepresseur|paracetamol|doliprane|ibuprofene|tramadol|fentanyl/;
const indirect=/^(?:oui ou non|alors|et maintenant|et donc|je devrais|dois je|devrais je|vas y|dis oui|reponds oui)\s*$|\b(?:le faire|en prendre|la prendre|les prendre|cette dose|ce traitement|cette decision|c est une bonne idee)\b/;
const messages=Object.freeze({
 selfHarm:'Votre sécurité mérite une vraie écoute, pas une réponse au hasard. Parlez à une personne de confiance ou à un professionnel. En cas de danger immédiat, contactez les urgences locales.',
 death:'La boule ne répond pas aux questions liées à la mort ou à la violence. Posez-lui une question plus légère.',
 health:'La boule ne peut pas guider une décision de santé ou de médicament. Pour ces questions, adressez-vous à un médecin ou à un pharmacien.',
 context:'Cette question peut encore concerner le sujet sensible précédent. La boule ne peut pas y répondre au hasard. Posez une nouvelle question sur un autre sujet.'
});
export function assessQuestion(value,{sensitiveContext=false}={}){
 const text=normalise(typeof value==='string'?value:''),compact=text.replace(/ /g,'');
 let category=null;
 if(selfHarm.test(text)||spacedSelfHarm.test(compact)||dangerousAction.test(text)||despair.test(text))category='selfHarm';
 else if(death.test(text)||spacedDeath.test(compact)||/\bm o r t(?: s| e| e s)?\b/.test(text))category='death';
 else if(health.test(text)||spacedHealth.test(compact))category='health';
 else if(sensitiveContext&&indirect.test(text))category='context';
 return Object.freeze({allowed:category===null,category,message:category?messages[category]:''});
}
