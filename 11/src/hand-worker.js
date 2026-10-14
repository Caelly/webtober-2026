import {HandLandmarker,FilesetResolver} from '@mediapipe/tasks-vision';
let detector;
self.onmessage=async({data})=>{
 try{
  if(data.type==='init'){
   const files=await FilesetResolver.forVisionTasks(data.base+'sauvetage/wasm',true);
   detector=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:data.base+'sauvetage/hand_landmarker.task',delegate:'CPU'},canvas:new OffscreenCanvas(480,360),runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.55,minHandPresenceConfidence:.55,minTrackingConfidence:.5});
   self.postMessage({type:'ready'});
  }else if(data.type==='frame'&&detector){
   try{const result=detector.detectForVideo(data.bitmap,data.capturedAt);self.postMessage({type:'result',result:{landmarks:result.landmarks,worldLandmarks:result.worldLandmarks,aspect:data.aspect},capturedAt:data.capturedAt});}finally{data.bitmap.close();}
  }
 }catch(error){self.postMessage({type:'error',message:String(error.message||error)});}
};
