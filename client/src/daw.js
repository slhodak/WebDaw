import { SynthViews } from './views/views.js';

//  Browser-Based DAW
//  Brings synths and sequencer together (and other tools)

const Manager = {
  daw: null,
  createDAWIfNoneExists() {
    Manager.daw = new DAW();
  },
  darkMode: false
};

const DAW = function() {
  this.synthesizers = [];
  this.pianoRoll = null;
};

DAW.prototype.addSynthesizer = function(synth) {
  this.synthesizers.push(synth);
  SynthViews.add(synth);
};

export default Manager;
