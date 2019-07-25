import { Network } from '../../config/config.js';
import DawManager from '../daw.js';

//  General Controls

const Controls = {
  83: () => {
    DawManager.daw.addSynthesizer();
  },
  // 70: () => {
  //   Manager.synthesizer.addFilter();
  // },
  // 32: () => {
  //   if (Manager.synthesizer.globals.demoTone === false) {
  //     Manager.synthesizer.playNote({ data: [127, 44, 65] });
  //   } else {
  //     Manager.synthesizer.endNote({ data: [127, 44, 65] })
  //   }
  //   Manager.synthesizer.globals.demoTone = !Manager.synthesizer.globals.demoTone;
  // }
};

window.addEventListener('keydown', (e) => {
  console.log(e.keyCode);
  if (e.target.type !== 'text') {
    DawManager.createDAWIfNoneExists();
    if (Controls[e.keyCode]) {
      Controls[e.keyCode]();
    }
  }
});

//  Save, Load, and DarkMode Buttons
const FormController = {
  initializeSavePresetModule() {
    FormController.initializeSaveButton();
    FormController.initializeOverwriteButton();
  },
  initializeSaveButton() {
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
            console.log(err);
          });
      }
    });
  },
  initializeOverwriteButton() {
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
  populatePresetSelector() {
    let presetSelector = document.getElementsByClassName('presetSelector')[0];
    fetch(`http://${Network.synthServiceHost}:${Network.synthServicePort}/presetNames`)
      .then(response => response.json())
      .then(data => {
        presetSelector.innerHTML = '';
        let option = document.createElement('option');
        option.innerText = '-- Preset Name --';
        presetSelector.append(option);
        data.names.forEach(name => {
          option = document.createElement('option');
          option.innerText = name;
          presetSelector.append(option);
        });
      })
      .catch(err => console.log(err));
  },
  initializeLoadPresetButton() {
    document.getElementsByClassName('loadButton')[0].addEventListener('mousedown', (e) => {
      fetch(`http://${Network.host}:${Network.httpPort}/preset/?name=${document.getElementsByClassName('presetSelector')[0].value}`)
        .then(response => response.json())
        .then(data => {
          Preset.load(data);
        })
        .catch(err => console.log(err));
    });
  },
  //  //
  initializeAddSynthModule() {
    FormController.initializeNewSynthButton();
    // FormController.populatePresetSelector();
    // FormController.initializeLoadPresetButton();
  },
  initializeNewSynthButton() {
    document.getElementsByClassName('newSynth')[0].addEventListener('mousedown', (e) => {
      DawManager.createDAWIfNoneExists();
      DawManager.daw.addSynthesizer();
    });
  },
  initializeDarkModeButton() {
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
// FormController.initializeLoadPresetModule();
// FormController.initializeSavePresetModule();
FormController.initializeAddSynthModule();
FormController.initializeDarkModeButton();


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
