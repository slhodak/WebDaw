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
  this.masterGain = this.context.createGain();
  this.synthesizers = {};
  this.pianoRoll = null;
};

DAW.prototype.addSynthesizer = function(synthData) {
  //  use synthData of type which is saved by WebSynth
  SynthSaveLoad.load(this, synthData);
  this.synthesizers[synthData.name] = SynthManager.synthesizer;
  SynthManager.synthesizer.output.connect(this.masterGain); 
  SynthViews.add(synth);
  SynthManager.synthesizer = null;
};

export default DawManager;
