import { SynthManager } from '../synthesizer.js';
import { Network } from '../../config/config.js';
import DawManager from '../daw.js';

const SynthSaveLoad = {
  save(synthesizer) {
    let synthData = {
      synthesizer: {
        name: synthesizer.name,
        router: {},
        settings: {
          globals: {}
        },
        oscillators: [],
        filters: []
      }
    };
    for (let route in synthesizer.router.table) {
      synthData.synthesizer.router[route] = synthesizer.router.table[route].node.dest.id || 'main out';
    }
    synthData.synthesizer.settings.globals.volume = synthesizer.output.gain.value;
    synthData.synthesizer.settings.poly = synthesizer.poly;
    synthData.synthesizer.settings.globals.porta = synthesizer.globals.porta;
    synthData.synthesizer.settings.globals.attack = synthesizer.globals.attack;
    synthData.synthesizer.settings.globals.release = synthesizer.globals.release;
    synthesizer.oscillators.forEach((osc, index) => {
      synthData.synthesizer.oscillators[index] = {
        id: osc.id,
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      }
    });
    synthesizer.filters.forEach((filt, index) => {
      synthData.synthesizer.filters[index] = {
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
      porta: synthesizer.settings.globals.porta,
      attack: synthesizer.settings.globals.attack,
      release: synthesizer.settings.globals.release,
      poly: synthesizer.settings.poly
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
          synthsToUpdate.forEach(synthName => {
            if (DawManager.daw.synthesizers[synthName]) {
              //  replace that synth's model with the new one...
              console.log(synthName);
            }
          });
        } else {
          console.log(data.message);
        }
      })
      .catch(err => console.error(`Error fetching actives: ${err}`));
  }
};

export default SynthSaveLoad;
