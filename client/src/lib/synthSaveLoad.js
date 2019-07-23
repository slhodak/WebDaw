import { SynthManager } from '../synthesizer.js';

const SynthSaveLoad = {
  save(synthesizer, name, overwrite) {
    let synthData = {
      overwrite,
      name,
      synthesizer: {
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
    synthData.synthesizer.settings.globals.volume = synthesizer.masterGain.gain.value;
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
        wave: osc.wave
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
  load(daw, synthData) {
    SynthManager.createSynthesizer(daw, {
      porta: synthData.synthesizer.settings.globals.porta,
      attack: synthData.synthesizer.settings.globals.attack,
      release: synthData.synthesizer.settings.globals.release,
      poly: synthData.synthesizer.settings.poly
    });

    SynthManager.synthesizer.oscillators = [];
    synthData.synthesizer.oscillators.forEach(osc => {
      SynthManager.synthesizer.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        wave: osc.wave
      });
    });
    
    SynthManager.synthesizer.filters = [];
    synthData.synthesizer.filters.forEach(filt => {
      SynthManager.synthesizer.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthData.synthesizer.router) {
      let destination;
      if (synthData.synthesizer.router[route] === 'main out') {
        destination = SynthManager.synthesizer.masterGain;
      } else {
        destination = SynthManager.synthesizer.router.table[synthData.synthesizer.router[route]].node;
      }

      SynthManager.synthesizer.router.setRoute(
        SynthManager.synthesizer.router.table[route].node,
        destination
      );
    }
  }
};

export default SynthSaveLoad;
