import DawManager from '../daw.js';
import SynthSaveLoad from '../lib/synthSaveLoad.js';
import { SynthView, DawView } from '../views/views.js';

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
  DawManager.MIDIOn = !DawManager.MIDIOn;
});

//  Save and Load Synth Buttons
const SynthFormController = {
  initializeAddSynthModule() {
    SynthFormController.enableNewSynthButton();
    SynthView.populateSynthPresetSelector();
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
      DawView.toggleDarkMode();
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
      DawView.toggleOverwrite();
      DawManager.overwrite = !DawManager.overwrite;
    });
  },
};

const SynthListController = {
  addVolumeListener(slider) {
    slider.addEventListener('input', (event) => {
      DawManager.daw.synthesizers[event.currentTarget.dataset.name].setGain(event.target.value);
      SynthView.updateVolume(event.target.value);
    });
    return slider;
  },
  addMuteListener(button) {
    button.addEventListener('mousedown', (event) => {
      DawManager.daw.synthesizers[event.currentTarget.dataset.name].toggleMute();
      SynthView.toggleMute(event.target, DawManager.daw.synthesizers[event.currentTarget.dataset.name].globals.mute);
    });
    return button;
  }
};

export {
  SynthListController
}
