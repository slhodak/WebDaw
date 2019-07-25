import { SynthViews } from './views/views.js';
import SynthSaveLoad from './lib/synthSaveLoad.js';
import { SynthManager } from './synthesizer.js';

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
  SynthViews.add(synthData);
  SynthManager.synthesizer = null;
};


export default DawManager;
