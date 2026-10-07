// Keep the acting fighter centered until their animation has finished.
// A boss move is visible only while Ogrest actually occupies the turn.
export function presentTurn(state,active,busy=false){
  const focus=busy&&state.lastEvent?state.lastEvent.actor:active;
  return {focus,bossMove:focus==='ogrest'?(busy?state.lastEvent?.intent:state.intent):null};
}
