import { SynthViews } from './views/views.js';

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
  this.synthesizers = {};
  this.pianoRoll = null;
};

DAW.prototype.addSynthesizer = function(synth) {
  //  synths must arrive with a unique name property
  //  either from saved preset or unique number
  this.synthesizers[synth.name] = synth;
  SynthViews.add(synth);
};

export default DawManager;
