import { Network } from '../../config/config.js';
import DawManager from '../daw.js';
import SynthSaveLoad from '../lib/synthSaveLoad.js';

//  General Controls

const Controls = {
  83: () => {
    DawManager.daw.addSynthesizer();
  }
};

window.addEventListener('keydown', (e) => {
  if (e.target.type !== 'text') {
    DawManager.createDAWIfNoneExists();
    if (Controls[e.keyCode]) {
      Controls[e.keyCode]();
    }
  }
});

window.addEventListener('visibilitychange', (e) => {
  if (document.hidden) {
    DawManager.lastVisible = Date.now();
  } else {
    SynthSaveLoad.updateActives();
  }
});

//  Save, Load, and DarkMode Buttons
const SynthFormController = {
  initializeSavePresetModule() {
    SynthFormController.enableSaveButton();
    SynthFormController.enableOverwriteButton();
  },
  enableSaveButton() {
    document.getElementsByClassName('savePreset')[0].addEventListener('submit', (e) => {
      e.preventDefault();
      if (DawManager.synthesizer) {
        fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/preset?overwrite=${DawManager.overwrite}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(Preset.save(DawManager.synthesizer, e.srcElement[0].value))
        })
          .then(response => response.json())
          .then(body => {
            if (body.error === 'exists') {
              window.alert('A preset already exists with that name.\nPlease choose another name or select the "overwrite" option.');
            } else {
              FormController.populatePresetSelector();
              document.getElementsByClassName('save')[0].setAttribute('class', 'module save confirmation');
              setTimeout(() => {
                document.getElementsByClassName('save')[0].setAttribute('class', 'module save');
              }, 1000);
            }
          })
          .catch(err => {
            console.error(err);
          });
      }
    });
  },
  populateSynthPresetSelector() {
    let presetSelector = document.getElementsByClassName('synthPresetSelector')[0];
    fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/presetNames`)
      .then(response => response.json())
      .then(data => {
        presetSelector.innerHTML = '';
        let option = document.createElement('option');
        option.innerText = '-- Synth Name --';
        presetSelector.append(option);
        data.names.forEach(name => {
          option = document.createElement('option');
          option.innerText = name;
          presetSelector.append(option);
        });
      })
      .catch(err => console.error(err));
  },
  enableLoadSynthButton() {
    document.getElementsByClassName('loadSynthButton')[0].addEventListener('mousedown', (e) => {
      fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/preset/?name=${document.getElementsByClassName('synthPresetSelector')[0].value}`)
        .then(response => response.json())
        .then(synthData => {
          DawManager.createDAWIfNoneExists();
          DawManager.daw.addSynthesizer(synthData);
          console.log(DawManager.daw.synthesizers);
        })
        .catch(err => console.error(err));
    });
  },
  initializeAddSynthModule() {
    SynthFormController.enableNewSynthButton();
    SynthFormController.populateSynthPresetSelector();
    SynthFormController.enableLoadSynthButton();
  },
  enableNewSynthButton() {
    document.getElementsByClassName('newSynth')[0].addEventListener('mousedown', (e) => {
      DawManager.createDAWIfNoneExists();
      DawManager.daw.addSynthesizer();
    });
  },
  enableDarkModeButton() {
    document.getElementsByClassName('darkMode')[0].addEventListener('mousedown', (e) => {
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
    });
  }
}

// TODO: Enable Save/Load Projects
// FormController.initializeSavePresetModule();
SynthFormController.initializeAddSynthModule();
SynthFormController.enableDarkModeButton();


const SynthListController = {
  addVolumeListener(slider) {
    slider.addEventListener('change', (event) => {
      DawManager.daw.synth[event.currentTarget.dataset.name].setGain(event.target.value);
    });
    return slider;
  },
  addMuteListener(button) {
    button.addEventListener('mousedown', (event) => {
      DawManager.daw.synth[event.currentTarget.dataset.name].toggleMute();
    });
    return button;
  }
};

export { 
  SynthListController
}
