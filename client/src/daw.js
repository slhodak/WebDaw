import { SynthViews } from './views/views.js';
import { SynthSaveLoad } from './lib/synthSaveLoad.js';

//  Browser-Based DAW
//  Brings synths and sequencer together (and other tools)

const DawManager = {
  daw: null,
  createDAWIfNoneExists() {
    if (!DawManager.daw) {
      DawManager.daw = new DAW();
    }
  },
  darkMode: false
};

const DAW = function() {
  this.context = new AudioContext();
  this.synthesizers = {};
  this.pianoRoll = null;
};

DAW.prototype.addSynthesizer = function(synthData) {
  //  synths must arrive with a unique name property
  //  either from saved preset or unique number
  this.synthesizers[synthData.name] = SynthSaveLoad.load(synthData);
  SynthManager.synthesizer = null;
  SynthViews.add(synth);
};

export default DawManager;
