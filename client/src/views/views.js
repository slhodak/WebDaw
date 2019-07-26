import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';
import { Network } from '../../config/config.js';
import SynthSaveLoad from '../lib/synthSaveLoad.js';

const DawViews = {
  toggleDarkMode() {
    let newMode, oldMode;
      if (DawManager.darkMode === true) {
        oldMode = 'dark';
        newMode = 'light';
      } else {
        oldMode = 'light';
        newMode = 'dark';
      }
      Array.from(document.getElementsByClassName(oldMode)).forEach(element => {
        let classes = Array.from(element.classList).filter(name => name !== oldMode);
        classes.push(newMode);
        element.setAttribute('class', classes.join(' '));
      });
      document.body.setAttribute('class', `${newMode}Body`);
      document.getElementsByClassName('title')[0].setAttribute('class', `title module row ${newMode}Title`);
      e.target.innerText = `${oldMode} mode`;
      DawManager.darkMode = !DawManager.darkMode;
  }
};

const SynthViews = {
  add(synthData) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.setAttribute('class', 'synthesizer');
    synthElem.appendChild(Templates.link(['synthLink'], 'OPEN', `${Network.synthServiceHost}:${Network.synthServicePort}/?name=${synthData.name}`, true))
    synthElem.appendChild(SynthListController.addVolumeListener(Templates.slider(synthData.name, 'volume', 'Volume', 0, 1, 0.75, 0.001)));
    synthElem.appendChild(SynthListController.addMuteListener(Templates.button(synthData.name, 'muteSynth', 'Mute')));
    synthList.appendChild(synthElem);
  },
  populateSynthPresetSelector() {
    let presetSelector = document.getElementsByClassName('synthPresetSelector')[0];
    SynthSaveLoad.getSynthPresetNames((err, data) => {
      if (err) {
        console.error(err);
      } else {
        presetSelector.innerHTML = '';
        let option = document.createElement('option');
        option.innerText = '-- Synth Name --';
        presetSelector.append(option);
        data.names.forEach(name => {
          option = document.createElement('option');
          option.innerText = name;
          presetSelector.append(option);
        });
      }
    });
  }
};

export {
  DawViews,
  SynthViews
}
