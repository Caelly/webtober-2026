import {shuffleWords} from './words.js';
export function readingDuration(word){return Math.min(2400,Math.max(1500,850+word.length*40));}
export function createBattle(source,random=Math.random){
  let queue=[],index=0,phase='idle',since=0,roundSince=0,heard=false;
  return {
    get phase(){return phase;},get score(){return index;},get total(){return source.length;},
    get word(){return queue[index]??'';},get duration(){return readingDuration(queue[index]??'');},
    start(now){queue=shuffleWords(source,random);index=0;since=roundSince=now;heard=false;phase='playing';},
    hear({laugh=false,speech=0},now){
      if(phase!=='playing'||now<roundSince)return null;
      if(laugh){phase='lost';return 'lost';}
      // A fresh 975 ms audio window prevents the preceding word from counting again.
      if(now-since>=975&&speech>=.45)heard=true;
      return null;
    },
    tick(now){
      if(phase!=='playing'||!heard||now-since<readingDuration(queue[index]))return null;
      index++;since=now;heard=false;
      if(index===queue.length){phase='won';return 'won';}
      return 'next';
    },
    progress(now){return Math.min(1,Math.max(0,(now-since)/readingDuration(queue[index]??'')));},
    get heard(){return heard;},
    stop(){phase='idle';heard=false;},
  };
}

export function createLaughGate(){
  const recent=[];
  return {sample(categories){
    const laughs=[];let speech=0,otherVocalization=0;
    for(const category of categories){
      const name=category.displayName||category.categoryName||'';
      if(/^(Laughter|Baby laughter|Giggle|Snicker|Belly laugh|Chuckle, chortle)$/i.test(name))laughs.push(category.score);
      if(/^(Speech|Conversation|Narration, monologue|Speech synthesizer)$/i.test(name))speech=Math.max(speech,category.score);
      if(/^(Cough|Throat clearing|Sneeze|Crying, sobbing|Baby cry, infant cry)$/i.test(name))otherVocalization=Math.max(otherVocalization,category.score);
    }
    laughs.sort((a,b)=>b-a);const laughter=laughs[0]??0,support=laughs[1]??0;
    // YAMNet's overlapping labels are independent scores, not a probability sum.
    // Agreement between laugh labels catches quiet chuckles, even during speech.
    const evidence=laughter+support*.6,conflicting=otherVocalization>=.2&&otherVocalization>evidence*2;
    const plausible=!conflicting&&laughter>=.075&&(support>=.02||laughter>=.22);
    recent.push(plausible);if(recent.length>3)recent.shift();
    const strong=!conflicting&&(laughter>=.3||(laughter>=.1&&support>=.035&&evidence>=.14));
    return {laugh:strong||recent.filter(Boolean).length>=2,laughter,speech};
  },reset(){recent.length=0;}};
}
