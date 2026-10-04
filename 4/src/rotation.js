import {Vector3,Quaternion,Euler} from 'three';
export function trackballPoint(x,y,width,height){
  const radius=Math.min(width,height)*.42,px=(x-width/2)/radius,py=(height/2-y)/radius,d=px*px+py*py;
  return new Vector3(px,py,d<=.5?Math.sqrt(1-d):.5/Math.sqrt(d)).normalize();
}
export function dragRotation(from,to,start){return new Quaternion().setFromUnitVectors(from,to).multiply(start).normalize();}
export function turnAxis(quaternion,axis,angle){const v={x:new Vector3(1,0,0),y:new Vector3(0,1,0),z:new Vector3(0,0,1)}[axis];if(!v)return quaternion.clone();return new Quaternion().setFromAxisAngle(v,angle).multiply(quaternion).normalize();}
export function facingRotation(normal){return new Quaternion().setFromEuler(new Euler(Math.atan2(normal.y,Math.hypot(normal.x,normal.z)),-Math.atan2(normal.x,normal.z),0));}
export function framingSpan(points,rotation,aspect){return points.reduce((span,point)=>{const p=point.clone().applyQuaternion(rotation);return Math.max(span,Math.abs(p.y),Math.abs(p.x)/aspect);},.1)*1.065;}
