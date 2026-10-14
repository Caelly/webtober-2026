const clamp=n=>Math.max(0,Math.min(1,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
function angle(a,b,c){const ab=distance(a,b),bc=distance(b,c),ac=distance(a,c);return Math.acos(Math.max(-1,Math.min(1,(ab*ab+bc*bc-ac*ac)/(2*ab*bc||1))))*180/Math.PI;}
export function classifyHand(image,world,aspect=4/3){
 if(!Array.isArray(image)||image.length!==21||image.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
 const points=world?.length===21&&world.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z))?world:image.map(p=>({x:p.x*aspect,y:p.y,z:(p.z||0)*aspect}));
 const scale=Math.max(distance(points[0],points[9]),distance(points[5],points[17])*.8);if(scale<.00001)return null;
 const projected=image.map(p=>({x:p.x*aspect,y:p.y,z:0}));
 const imageScale=Math.max(distance(projected[0],projected[9]),distance(projected[5],projected[17])*.8,.00001);
 // Contact is clearer in the image than in the estimated depth when fingertips overlap.
 const gap=Math.min(distance(points[4],points[8])/scale,distance(projected[4],projected[8])/imageScale);
 const relaxedFinger=([base,pip,tip])=>angle(points[base],points[pip],points[tip])>110&&distance(points[base],points[tip])>scale*.4;
 const supported=[[9,10,12],[13,14,16],[17,18,20]].some(relaxedFinger)||distance(points[0],points[8])>scale*.9;
 const circle=gap<.48&&supported,circleHold=gap<.7&&supported;
 return {circle,circleHold,pinchRatio:gap,aim:{x:clamp((1-image[8].x-.04)/.92),y:Math.max(.06,Math.min(.82,(image[8].y-.04)/.82))},wrist:{x:1-image[0].x,y:image[0].y},landmarks:image};
}
export function createGestureTracker(){
 let tracks={},circleSince=null,bothSince=null,circleLatch=false,releasedAt=null,lastCircleSeen=null,lastBothSeen=null,lastUpdate=null;
 function reset(){tracks={};circleSince=null;bothSince=null;circleLatch=false;releasedAt=null;lastCircleSeen=null;lastBothSeen=null;lastUpdate=null;}
 function update(result,now){
  const interval=lastUpdate===null?0:now-lastUpdate,continuityGap=Math.max(180,Math.min(500,interval*1.6));
  if(lastUpdate!==null&&interval>650){circleSince=null;bothSince=null;lastCircleSeen=null;lastBothSeen=null;}lastUpdate=now;
  const hands=(result.landmarks||[]).map((points,i)=>classifyHand(points,result.worldLandmarks?.[i],result.aspect||4/3)).filter(Boolean).slice(0,2);
  const previous=Object.entries(tracks).filter(([,track])=>now-track.seen<650),assigned=[];
  // Keep identities through crossing hands; initial assignment follows the mirrored view.
  if(hands.length===2&&previous.length===2){
   const direct=distance(hands[0].wrist,previous[0][1].wrist)+distance(hands[1].wrist,previous[1][1].wrist);
   const crossed=distance(hands[1].wrist,previous[0][1].wrist)+distance(hands[0].wrist,previous[1][1].wrist);
   assigned.push([previous[0][0],hands[direct<=crossed?0:1]],[previous[1][0],hands[direct<=crossed?1:0]]);
  }else for(const hand of [...hands].sort((a,b)=>a.wrist.x-b.wrist.x)){
   const candidates=previous.filter(([id])=>!assigned.some(([used])=>used===id)).sort((a,b)=>distance(a[1].wrist,hand.wrist)-distance(b[1].wrist,hand.wrist));
   let id=candidates[0]&&distance(candidates[0][1].wrist,hand.wrist)<.32?candidates[0][0]:hand.wrist.x<.5?'left':'right';
   if(assigned.some(([used])=>used===id))id=id==='left'?'right':'left';assigned.push([id,hand]);
  }
  const events=[],output=[];
  for(const [id,hand] of assigned){
   let track=tracks[id];if(!track||now-track.seen>650){track={aim:hand.aim,circle:false,lastCircle:-Infinity,evidence:0};tracks[id]=track;}
   const previousAim=track.seen!==undefined&&now-track.seen<=200?{...track.aim}:null;
   const smoothing=.65;track.aim={x:track.aim.x+(hand.aim.x-track.aim.x)*smoothing,y:track.aim.y+(hand.aim.y-track.aim.y)*smoothing};
   if(hand.circle||track.circle&&hand.circleHold){if(!track.circle)track.evidence=0;track.circle=true;track.lastCircle=now;track.evidence++;}
   else if(hand.pinchRatio>.9||now-track.lastCircle>180){track.circle=false;track.evidence=0;}
   track.seen=now;track.wrist=hand.wrist;
   output.push({...hand,id,circle:track.circle,circleConfirmed:track.evidence>=2,aim:{...track.aim},previousAim});
  }
  const circles=output.filter(hand=>hand.circle);
  if(circles.length){
   releasedAt=null;
   if(circleSince===null||lastCircleSeen!==null&&now-lastCircleSeen>continuityGap)circleSince=now;
   lastCircleSeen=Math.max(...circles.map(hand=>tracks[hand.id].lastCircle));
   if(circles.length===2){
    if(bothSince===null||lastBothSeen!==null&&now-lastBothSeen>continuityGap)bothSince=now;
    lastBothSeen=now;
   }else if(lastBothSeen!==null&&now-lastBothSeen>180)bothSince=null;
   const double=circles.length===2&&bothSince!==null&&now-bothSince>=160;
   const single=circles.length===1&&bothSince===null&&now-circleSince>=500;
   if(!circleLatch&&circles.every(hand=>hand.circleConfirmed)&&(double||single)){
    const aim={x:circles.reduce((sum,h)=>sum+h.aim.x,0)/circles.length,y:circles.reduce((sum,h)=>sum+h.aim.y,0)/circles.length};
    events.push({type:'laser',kind:double?'double':'single',hand:circles[0].id,aim});circleLatch=true;
   }
  }else if(lastCircleSeen===null||now-lastCircleSeen>180){
   circleSince=null;bothSince=null;lastBothSeen=null;
   if(releasedAt===null)releasedAt=now;if(now-releasedAt>=220)circleLatch=false;
  }
  const circleProgress=!circles.length?0:circleLatch?1:circles.length===2?Math.min(1,(now-bothSince)/160):Math.min(1,(now-circleSince)/500);
  output.forEach(hand=>{hand.circleProgress=hand.circle?circleProgress:0;hand.doubleCircle=circles.length===2;});
  for(const [id,track] of Object.entries(tracks))if(now-track.seen>650)delete tracks[id];
  return {hands:output,events,circleProgress};
 }
 return {update,reset};
}
