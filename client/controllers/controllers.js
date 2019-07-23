
//  Save, Load, and DarkMode Buttons
const FormController = {
  initializeSavePresetModule() {
    FormController.initializeSaveButton();
    FormController.initializeOverwriteButton();
  },
  initializeSaveButton() {
    document.getElementsByClassName('savePreset')[0].addEventListener('submit', (e) => {
      e.preventDefault();
      if (Manager.synthesizer) {
        fetch(`${Network.host}/preset?overwrite=${Manager.overwrite}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(Preset.save(Manager.synthesizer, e.srcElement[0].value))
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
      if (Manager.overwrite === false) {
        overwrite.classList.replace('false', 'true');
      } else {
        overwrite.classList.replace('true', 'false');
      }
      Manager.overwrite = !Manager.overwrite;
    });
  },
  initializeLoadPresetModule() {
    FormController.populatePresetSelector();
    FormController.initializeLoadPresetButton();
  },
  populatePresetSelector() {
    let presetSelector = document.getElementsByClassName('presetSelector')[0];
    fetch(`http://${Network.host}:${Network.httpPort}/presetNames`)
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
  initializeDarkModeButton() {
    document.getElementsByClassName('darkMode')[0].addEventListener('mousedown', (e) => {
      let newMode, oldMode;
      if (Manager.darkMode === true) {
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
      Manager.darkMode = !Manager.darkMode;
    });
  }
}

FormController.initializeLoadPresetModule();
FormController.initializeSavePresetModule();
FormController.initializeDarkModeButton();
