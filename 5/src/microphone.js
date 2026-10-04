import captureUrl from './capture-worklet.js?url';
import {LocalMicrophone as Microphone} from './microphone-core.js';
export class LocalMicrophone extends Microphone {
  constructor(options){super({...options,captureUrl});}
}
