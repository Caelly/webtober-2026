// Areoles follow the three stems. No hidden needles behind the drawing.
const rows=(xs,ys,region)=>ys.flatMap((y,row)=>xs.map((x,column)=>({x:x+(row%2?3:-2),y:y+(column%2?5:0),region})));
export const spines=Object.freeze([
  ...rows([335,371,408],[132,180,228,276,324,372,420,468,516],'tronc'),
  ...rows([195,226],[284,326,365],'bras gauche'),
  ...rows([271],[379,407],'bras gauche'),
  ...rows([513,544],[210,254,298],'bras droit'),
  ...rows([467,493],[343],'bras droit'),
].map((pin,index)=>Object.freeze({...pin,id:`spine-${index+1}`,angle:-70+(index*137.508)%140,length:19+(index%4)*2})));

export function createCactusGame(){
  const removed=new Set(),history=[],valid=new Set(spines.map(pin=>pin.id));
  return {
    get total(){return valid.size;},
    get remaining(){return valid.size-removed.size;},
    get completed(){return removed.size===valid.size;},
    get canUndo(){return history.length>0;},
    has(id){return valid.has(id)&&!removed.has(id);},
    pluck(id){if(!valid.has(id)||removed.has(id))return false;removed.add(id);history.push(id);return true;},
    undo(){const id=history.pop();if(!id)return null;removed.delete(id);return id;},
    reset(){removed.clear();history.length=0;},
  };
}
