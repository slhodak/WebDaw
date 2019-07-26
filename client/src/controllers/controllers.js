import { Network } from '../../config/config.js';
import DawManager from '../daw.js';
import SynthSaveLoad from '../lib/synthSaveLoad.js';
import { SynthViews, DawViews } from '../views/views.js';

//  General Controls

const Controls = {
  83: () => {
    DawManager.daw.addSynthesizer();
  }
};

window.onload = (event) => {
  // TODO: Enable Save/Load Projects
  // DawFormController.initializeSaveProjectModule();
  SynthFormController.initializeAddSynthModule();
  DawFormController.enableDarkModeButton();
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

//  Save and Load Synth Buttons
const SynthFormController = {
  initializeAddSynthModule() {
    SynthFormController.enableNewSynthButton();
    SynthViews.populateSynthPresetSelector();
    SynthFormController.enableLoadSynthButton();
  },
  enableLoadSynthButton() {
    document.getElementsByClassName('loadSynthButton')[0].addEventListener('mousedown', (e) => {
      SynthSaveLoad.getOneSynth(document.getElementsByClassName('synthPresetSelector')[0].value);
    });
  },
  enableNewSynthButton() {
    document.getElementsByClassName('newSynth')[0].addEventListener('mousedown', (e) => {
      DawManager.createDAWIfNoneExists();
      DawManager.daw.addSynthesizer();
    });
  }
}

const DawFormController = {
  initializeSaveProjectModule() {
    DawFormController.enableSaveButton();
    DawFormController.enableOverwriteButton();
  },
  enableDarkModeButton() {
    document.getElementsByClassName('darkMode')[0].addEventListener('mousedown', (e) => {
      DawViews.toggleDarkMode();
    });
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
              FormController.populateSynthPresetSelector();
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
  enableOverwriteButton() {
    let overwrite = document.getElementsByClassName('overwrite')[0];
    overwrite.addEventListener('mousedown', (e) => {
      if (DawManager.overwrite === false) {
        overwrite.classList.replace('false', 'true');
      } else {
        overwrite.classList.replace('true', 'false');
      }
      DawManager.overwrite = !DawManager.overwrite;
    });
  },
};

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
