export function pickVisibleSpine(hits,has){
  for(const hit of hits){
    let object=hit.object,visible=true,id=null;
    while(object){visible&&=object.visible;if(object.userData.spineId)id=object.userData.spineId;object=object.parent;}
    if(!visible)continue;
    if(id){if(has(id))return id;continue;}
    if(hit.object.isMesh)return null;
  }
  return null;
}
