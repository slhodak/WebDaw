import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';
//  add view object
//  add controls
//  event emitter

const SynthViews = {
  add(synth) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.innerHTML = `
      <div class="synthesizer">
      <a class="synthLink" href="${synth.link}">OPEN</a>
      ${SynthListController.addVolumeListener(Templates.slider(synth.id, 'volume', 'Volume', 0, 1, 0.75, 0.001))}
      ${SynthListController.addMuteListener(Templates.button(synth.id, 'muteSynth', 'Mute'))}
      </div>`;
    synthList.appendChild(synthElem);
  }
};

export {
  SynthViews
}
