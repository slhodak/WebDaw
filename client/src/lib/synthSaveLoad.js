import DawManager from '../daw.js';
import { Network } from '../../config/config.js';
import { SynthManager } from '../synthesizer.js';
import { SynthViews } from '../views/views.js';

const SynthSaveLoad = {
  save(synthesizer) {
    let synthData = {
      name: synthesizer.name,
      router: {},
      globals: {},
      oscillators: [],
      filters: []
    };
    for (let route in synthesizer.router.table) {
      synthData.router[route] = synthesizer.router.table[route].node.dest.id || 'main out';
    }
    synthData.globals.volume = synthesizer.output.gain.value;
    synthData.globals.poly = synthesizer.globals.poly;
    synthData.globals.porta = synthesizer.globals.porta;
    synthData.globals.attack = synthesizer.globals.attack;
    synthData.globals.release = synthesizer.globals.release;
    synthesizer.oscillators.forEach((osc, index) => {
      synthData.oscillators[index] = {
        id: osc.id,
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      }
    });
    synthesizer.filters.forEach((filt, index) => {
      synthData.filters[index] = {
        id: filt.id,
        type: filt.type,
        frequency: filt.frequency.value,
        gain: filt.gain.value,
        q: filt.Q.value
      }
    });
    return synthData;
  },
  load(daw, synthesizer) {
    SynthManager.createSynthesizer(daw, {
      name: synthesizer.name,
      poly: synthesizer.poly,
      porta: synthesizer.globals.porta,
      attack: synthesizer.globals.attack,
      release: synthesizer.globals.release,
      type: synthesizer.globals.type,
      mute: synthesizer.globals.mute,
      volume: synthesizer.globals.volume
    });

    SynthManager.synthesizer.oscillators = [];
    synthesizer.oscillators.forEach(osc => {
      SynthManager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });
    
    SynthManager.synthesizer.filters = [];
    synthesizer.filters.forEach(filt => {
      SynthManager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthesizer.router) {
      let destination;
      if (synthesizer.router[route] === 'main out') {
        destination = SynthManager.synthesizer.output;
      } else {
        destination = SynthManager.synthesizer.router.table[synthesizer.router[route]].node;
      }

      SynthManager.synthesizer.router.setRoute(
        SynthManager.synthesizer.router.table[route].node,
        destination
      );
    }
  },
  saveToPresets() {
    if (DawManager.synthesizer) {
      fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/preset?overwrite=${DawManager.overwrite}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(SynthSaveLoad.save(DawManager.synthesizer))
      })
        .then(response => response.json())
        .then(body => {
          if (body.error === 'exists') {
            window.alert('A preset already exists with that name.\nPlease choose another name or select the "overwrite" option.');
          } else {
            SynthViews.populateSynthPresetSelector();
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
  },
  saveToActives(synthesizer) {
    fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/synths/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(SynthSaveLoad.save(synthesizer))
    })
      .catch(error => {
        console.error(`Fetch error: ${error}`);
      });
  },
  updateActives() {
    fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/synths?dawLastVisible=${DawManager.lastVisible}`)
      .then(response => response.json())
      .then(data => {
        if (!data.message) {
          const { synthsToUpdate } = data;
          synthsToUpdate.forEach(synthesizer => {
            if (DawManager.daw.synthesizers[synthesizer.name]) {
              DawManager.daw.synthesizers[synthesizer.name].update(synthesizer);
            }
          });
        } else {
          console.log(data.message);
        }
      })
      .catch(err => console.error(`Error fetching actives: ${err}`));
  },
  getOneSynth(name) {
    fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/preset/?name=${name}`)
      .then(response => response.json())
      .then(synthData => {
        DawManager.createDAWIfNoneExists();
        DawManager.daw.addSynthesizer(synthData);
      })
      .catch(err => console.error(err));
  },
  getSynthPresetNames(callback) {
    fetch(`${Network.synthServiceHost}:${Network.synthServicePort}/presetNames`)
      .then(response => response.json())
      .then(data => {
        callback(null, data);
      })
      .catch(err => callback(err));
  }
};

export default SynthSaveLoad;
