import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';
import { Network } from '../../config/config.js';

const SynthViews = {
  add(synthData) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.setAttribute('class', 'synthesizer');
    synthElem.appendChild(Templates.link(['synthLink'], 'OPEN', `${Network.synthServiceHost}:${Network.synthServicePort}/synths/${synthData.name}`))
    synthElem.appendChild(SynthListController.addVolumeListener(Templates.slider(synthData.name, 'volume', 'Volume', 0, 1, 0.75, 0.001)));
    synthElem.appendChild(SynthListController.addMuteListener(Templates.button(synthData.name, 'muteSynth', 'Mute')));
    synthList.appendChild(synthElem);
  }
};

export {
  SynthViews
}
