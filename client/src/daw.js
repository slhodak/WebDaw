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
  renameSynth(oldName, newName) {
    DawManager.daw.synthesizers[newName] = DawManager.daw.synthesizers[oldName];
    DawManager.daw.synthesizers[newName].name = newName;
    delete DawManager.daw.synthesizers[oldName];
  },
  darkMode: false,
  lastVisible: Date.now()
};

const DAW = function() {
  this.context = new AudioContext();
  this.masterGain = this.context.createGain();
  this.masterGain.connect(this.context.destination);
  this.synthesizers = { size: 0 };
  this.pianoRoll = null;
};

DAW.prototype.handleMIDI = function(message) {
  if (message.data[0] === 144) {
    console.log('note on!');
    this.notesOn(message);
  } else if (message.data[0] === 128) {
    console.log('note off!');
    this.notesOff(message);
  }
};

DAW.prototype.notesOn = function(midiMessage) {
  for (let synth in this.synthesizers) {
    if (synth !== 'size') {
      this.synthesizers[synth].playNote(midiMessage);
    }
  }
};

DAW.prototype.notesOff = function(midiMessage) {
  for (let synth in this.synthesizers) {
    if (synth != 'size') {
      this.synthesizers[synth].endNote(midiMessage);
    }
  }
};

DAW.prototype.addSynthesizer = function(synthData) {
  if (synthData) {
    SynthSaveLoad.load(this, synthData);
  } else {
    SynthManager.createSynthesizer(this, { name: this.synthesizers.size });
  }
  this.synthesizers[SynthManager.synthesizer.name] = SynthManager.synthesizer;
  SynthManager.synthesizer.output.connect(this.masterGain);
  this.synthesizers.size += 1;
  SynthViews.add(SynthManager.synthesizer);
  SynthSaveLoad.saveToActives(SynthManager.synthesizer);
  SynthManager.synthesizer = null;
};


export default DawManager;
