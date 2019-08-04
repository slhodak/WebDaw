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
      SynthSaveLoad.saveToPresets(e.srcElement[0]);
    });
  },
  enableOverwriteButton() {
    let overwrite = document.getElementsByClassName('overwrite')[0];
    overwrite.addEventListener('mousedown', (e) => {
      DawViews.toggleOverwrite();
      DawManager.overwrite = !DawManager.overwrite;
    });
  },
};

const SynthListController = {
  addVolumeListener(slider) {
    slider.addEventListener('change', (event) => {
      DawManager.daw.synthesizers[event.currentTarget.dataset.name].setVolume(event.target.value);
    });
    return slider;
  },
  addMuteListener(button) {
    button.addEventListener('mousedown', (event) => {
      DawManager.daw.synthesizers[event.currentTarget.dataset.name].toggleMute();
      SynthViews.toggleMute(event.target, DawManager.daw.synthesizers[event.currentTarget.dataset.name].globals.mute);
    });
    return button;
  }
};

export { 
  SynthListController
}
