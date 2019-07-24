import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';

const SynthViews = {
  add(synth) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.innerHTML = `
      <div class="synthesizer">
      <a class="synthLink" href="${synth.link}">OPEN</a>
      ${SynthListController.addVolumeListener(Templates.slider(synth.name, 'volume', 'Volume', 0, 1, 0.75, 0.001))}
      ${SynthListController.addMuteListener(Templates.button(synth.name, 'muteSynth', 'Mute'))}
      </div>`;
    synthList.appendChild(synthElem);
  }
};

export {
  SynthViews
}
