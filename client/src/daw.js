import { SynthViews } from './views/views.js';
import SynthSaveLoad from './lib/synthSaveLoad.js';
import { SynthManager } from './synthesizer.js';

//  Browser-Based DAW
//  Brings synths and sequencer together (and other tools)

const DawManager = {
  daw: null,
  createDAWIfNoneExists() {
    if (DawManager.daw === null) {
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
  } else {
    SynthManager.createSynthesizer(this);
    synthData = { name: this.synthesizers.size };
  }
  this.synthesizers[synthData.name] = SynthManager.synthesizer;
  SynthManager.synthesizer.output.connect(this.masterGain);
  this.synthesizers.size += 1;
  //  synth link is 3000/name, synth service to use this endpoint to query DAW for details
  SynthViews.add(synthData);
  console.log(this.synthesizers);
  SynthManager.synthesizer = null;
};


export default DawManager;
