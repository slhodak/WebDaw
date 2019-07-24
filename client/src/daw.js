import { SynthViews } from './views/views.js';
import SynthSaveLoad from './lib/synthSaveLoad.js';
import { SynthManager } from './synthesizer.js';

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
  this.synthesizers = { size: 0 };
  this.pianoRoll = null;
};

DAW.prototype.addSynthesizer = function(synthData) {
  if (synthData) {
    SynthSaveLoad.load(this, synthData);
    this.synthesizers[synthData.name] = SynthManager.synthesizer;
  } else {
    SynthManager.createSynthesizer(this);
    this.synthesizers[this.synthesizers.size] = SynthManager.synthesizer;
  }
  SynthManager.synthesizer.output.connect(this.masterGain);
  this.synthesizers.size += 1;
  SynthViews.add(synth);
  SynthManager.synthesizer = null;
};


export default DawManager;
