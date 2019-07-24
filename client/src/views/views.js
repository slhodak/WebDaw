import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';

const SynthViews = {
  add(synthData) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.innerHTML = `
      <div class="synthesizer">
      <a class="synthLink" href="${`${Network.synthServiceHost}:${Network.synthServicePort}/synthData.name`}">OPEN</a>
      ${SynthListController.addVolumeListener(Templates.slider(synthData.name, 'volume', 'Volume', 0, 1, 0.75, 0.001))}
      ${SynthListController.addMuteListener(Templates.button(synthData.name, 'muteSynth', 'Mute'))}
      </div>`;
    synthList.appendChild(synthElem);
  }
};

export {
  SynthViews
}
