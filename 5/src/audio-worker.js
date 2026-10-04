import {AudioClassifier,FilesetResolver} from '@mediapipe/tasks-audio';
let classifier;
self.onmessage=async ({data})=>{
  try {
    if(data.type==='init'){
      const files=await FilesetResolver.forAudioTasks(data.base+'gifle/wasm',true);
      classifier=await AudioClassifier.createFromOptions(files,{baseOptions:{modelAssetPath:data.base+'gifle/yamnet.tflite',delegate:'CPU'},maxResults:-1});
      self.postMessage({type:'ready'});
    } else if(data.type==='frame'&&classifier){
      const results=classifier.classify(data.samples,data.rate);
      const categories=results.flatMap(result=>result.classifications.flatMap(head=>head.categories));
      self.postMessage({type:'result',categories,capturedAt:data.capturedAt});
    }
  } catch(error){self.postMessage({type:'error',message:error.message});}
};
