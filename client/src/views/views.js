import Templates from './templates.js';
import { SynthListController } from '../controllers/controllers.js';
import { Network } from '../../config/config.js';
import SynthSaveLoad from '../lib/synthSaveLoad.js';
import DawManager from '../daw.js';

const DawView = {
  toggleDarkMode(button) {
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
      button.innerText = `${oldMode} mode`;
      DawManager.darkMode = !DawManager.darkMode;
  },
  toggleOverwrite() {
    if (DawManager.overwrite === false) {
      overwrite.classList.replace('false', 'true');
    } else {
      overwrite.classList.replace('true', 'false');
    }
  }
};

const SynthView = {
  add(synthesizer) {
    const synthList = document.getElementsByClassName('synthList')[0];    
    let synthElem = document.createElement('div');
    synthElem.setAttribute('class', 'synthesizer');
    synthElem.appendChild(Templates.link(synthesizer.name, 'synthLink', 'Open', `${Network.synthServiceHost}:${Network.synthServicePort}/?name=${synthesizer.name}`, true))
    synthElem.appendChild(SynthListController.addVolumeListener(Templates.slider(synthesizer.name, 'volume', 'Volume', 0, 1, 0.75, 0.001)));
    synthElem.appendChild(SynthListController.addMuteListener(Templates.button(synthesizer.name, 'muteSynth', 'Mute')));
    synthList.appendChild(synthElem);
  },
  populateSynthPresetSelector() {
    let presetSelector = document.getElementsByClassName('synthPresetSelector')[0];
    SynthSaveLoad.getSynthPresetNames((err, data) => {
      if (err) {
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
  },
  toggleMute(button, muted) {
    button.setAttribute('class', muted ? 'muteSynth muted' : 'muteSynth' );
  },
  updateVolume(value) {
    let volumeDisplay = document.getElementsByClassName('volumeDisplay')[0];
    volumeDisplay.innerText = value;
  },
  updateDataName(oldName, newName) {
    let synthElems = document.getElementsByClassName('synthesizer');
    for (let i = 0; i < synthElems.length; i++) {
      if (synthElems[i].children[1].dataset.name === oldName) {
        Array.from(synthElems[i].children).forEach(child => {
          if (child.nodeName === 'A') {
            child.setAttribute('href', `${Network.synthServiceHost}:${Network.synthServicePort}/?name=${newName}`);
          }
          child.setAttribute('data-name', newName);
        });
        return;
      }
    }
  }
};

export {
  DawView,
  SynthView
}
