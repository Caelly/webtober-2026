export const stages = [
 ['Les interrupteurs','Arrêtez les quatre interrupteurs dans la zone basse.'],
 ['Le code','Grattez l’étiquette pour découvrir le vrai code.'],
 ['Les symboles','Reproduisez les symboles de gauche à droite.'],
 ['Le cadran','Placez l’aiguille sur la fréquence indiquée.'],
 ['Les connexions','Associez les prises de même forme.'],
 ['Le super Simon','Mémorisez les huit lumières, puis reproduisez-les.'],
 ['La pression','Maintenez, puis relâchez dans la zone verte.'],
 ['L’intrus','Trouvez le symbole différent.'],
 ['La synchronisation','Appuyez lorsque les deux repères se rejoignent.'],
 ['Le dernier verrou','Ouvrez le capot, puis maintenez pendant deux secondes.'],
];
export function shuffle(values,random=Math.random){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export const tuning={switchThreshold:82,switchPeriods:[910,1240,750,1460],pressureMs:10,syncTolerance:.16,memoryLength:8};
export function switchPosition(elapsed,index,phase){return (1+Math.sin(elapsed/tuning.switchPeriods[index]*Math.PI*2+phase))/2*100;}
export function pressureValue(elapsed){return elapsed/tuning.pressureMs;}
export function pressureAccepted(elapsed){const value=pressureValue(elapsed);return value>=65&&value<=90;}
export function syncAccepted(elapsed){return Math.abs(Math.sin(elapsed/650))<tuning.syncTolerance;}
export function createPuzzle(random=Math.random){
 const int=n=>Math.floor(random()*n),shapes=['◆','●','▲','✚'];
 const buttons=shuffle(Array.from({length:100},(_,i)=>i),random),code=String(100+int(900));
 return {switchPhases:Array.from({length:4},()=>random()*Math.PI*2),code,fakeCode:String(100+(Number(code)-100+1+int(899))%900),symbols:buttons.slice(0,3),buttons,dial:25+int(51),connections:shuffle(shapes.slice(0,3),random),memory:Array.from({length:tuning.memoryLength},()=>int(4)),odd:int(9),shape:shapes[int(4)],oddShape:'✦'};
}
export function createGame(now=()=>performance.now()){
 let deadline=0,frozen=0;const state={phase:'ready',step:0,errors:0};
 const game={state,start(){state.phase='playing';state.step=0;state.errors=0;deadline=now()+60000;return game;},remaining(){return state.phase==='ready'?60000:state.phase==='won'?frozen:Math.max(0,deadline-now());},tick(){if(state.phase==='playing'&&game.remaining()<=0)state.phase='lost';return state.phase;},mistake(){game.tick();if(state.phase!=='playing')return false;state.errors++;deadline-=3000;game.tick();return true;},complete(expectedStep=state.step){game.tick();if(state.phase!=='playing'||expectedStep!==state.step)return false;state.step++;if(state.step===stages.length){frozen=game.remaining();state.phase='won';}return true;}};return game;
}
