import { SynthView } from './views/views.js';
import SynthSaveLoad from './lib/synthSaveLoad.js';
import { SynthManager } from './synthesizer.js';
import newSynth from './lib/newSynth.js';

const DawManager = {
  daw: null,
  createDAWIfNoneExists() {
    if (DawManager.daw === null) {
      DawManager.daw = new DAW();
    }
  },
  renameSynth(oldName, newName) {
    DawManager.daw.synthesizers[newName] = DawManager.daw.synthesizers[oldName];
    DawManager.daw.synthesizers[newName].name = newName;
    delete DawManager.daw.synthesizers[oldName];
  },
  darkMode: false,
  lastVisible: Date.now(),
  MIDIOn: true
};

const DAW = function() {
  this.context = new AudioContext();
  this.masterGain = this.context.createGain();
  this.masterGain.connect(this.context.destination);
  this.synthesizers = { size: 0 };
  this.pianoRoll = null;
};

DAW.prototype.handleMIDI = function(message) {
  for (let synth in this.synthesizers) {
    if (synth !== 'size') {
      if (message.data[0] === 144) {
        this.synthesizers[synth].playNote(message);
      } else if (message.data[0] === 128) {
        this.synthesizers[synth].endNote(message);
      }
    }
  }
};

DAW.prototype.addSynthesizer = function(synthData) {
  if (synthData) {
    SynthSaveLoad.load(this, synthData);
  } else {
    newSynth.name = this.synthesizers.size;
    SynthSaveLoad.load(this, newSynth);
  }
  this.synthesizers[SynthManager.synthesizer.name] = SynthManager.synthesizer;
  SynthManager.synthesizer.output.connect(this.masterGain);
  this.synthesizers.size += 1;
  SynthView.add(SynthManager.synthesizer);
  SynthSaveLoad.saveToActives(SynthManager.synthesizer);
  SynthManager.synthesizer = null;
};


export default DawManager;
