import Helpers from './lib/helpers.js';

/*  _  _   __  ____  ____  __    ____ 
*  ( \/ ) /  \(    \(  __)(  )  / ___)
*  / \/ \(  O )) D ( ) _) / (_/\\___ \
*  \_)(_/ \__/(____/(____)\____/(____/
*/

let SynthManager = {
  createSynthesizerIfNoneExists() {
    if (!Manager.synthesizer) {
      Manager.synthesizer = new Synthesizer();
      document.getElementsByClassName('globalControls')[0].removeEventListener('mousedown', Manager.createSynthesizerIfNoneExists);
    }
  },
  synthesizer: null,
  sequencerSocket: null,
  overwrite: false,
  darkMode: false
};

//  - Synthesizer
class Synthesizer {
  constructor(options = {}) {
    this.context = new AudioContext();
    this.router = new Router(this);
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.globals = {
      demoTone: false,
      porta: options.porta || 0.05,
      attack: options.attack || 0.01,
      release: options.release || 0.1,
      wave: 'sine'
    };
    this.mono = {
      note: null,
      notesList: [],
      notesObj: {},
      voices: {}
    };
    this.poly = options.poly || true;
    this.oscillators = [];
    this.filters = [];
    this.addOscillator = this.addOscillator.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.playNote = this.playNote.bind(this);
    this.endNote = this.endNote.bind(this);
    this.findNextNote = this.findNextNote.bind(this);
    this.findFrequencyFromNote = this.findFrequencyFromNote.bind(this);
    this.togglePoly = this.togglePoly.bind(this);
    this.setAttack = this.setAttack.bind(this);
    this.setRelease = this.setRelease.bind(this);
    this.setGain = this.setGain.bind(this);
    this.setPorta = this.setPorta.bind(this);
  }

  playNote(midiMessage) {
    if (this.poly) {
      this.oscillators.forEach(osc => {
        osc.addVoice(midiMessage);
      });
    } else {
      if (!this.mono.note) {
        this.oscillators.forEach(osc => {
          this.mono.voices[midiMessage.data[1]] = new Voice(
            synthesizer.context, 
            {
              frequency: synthesizer.findFrequencyFromNote(midiMessage.data[1]),
              type: osc.type,
              detune: osc.fineDetune
            }, 
            osc);
          });
        this.mono.notesObj[midiMessage.data[1]] = true;
        this.mono.notesList.push(midiMessage.data[1]);
        this.mono.note = midiMessage.data[1];
      } else {
        for (let voice in this.mono.voices) {
          this.mono.voices[voice].setFrequency(midiMessage.data[1]);
          this.mono.notesObj[midiMessage.data[1]] = true;
          this.mono.notesList.push(midiMessage.data[1]);
          this.mono.note = midiMessage.data[1];
        }
      }
    }
  }

  addOscillator(options = {}) {
    let newOsc = new Oscillator(this, options);
    if (this.oscillators[0]) {
      for (let voice in this.oscillators[0].voices) {
        newOsc.addVoice({ data: [null, Number(voice), null] });
      }
    }
    this.oscillators.push(newOsc);
    this.router.updateRouter();
  }

  addFilter(options = {}) {
    this.filters.push(new Filter(this, options));
    this.router.updateRouter();
  }

  endNote(midiMessage) {
    if (this.poly) {
      this.oscillators.forEach(osc => {
        osc.removeVoice(midiMessage);
      });
    } else {
      delete this.mono.notesObj[midiMessage.data[1]];
      this.findNextNote();
    }
  }

  findNextNote() {
    if (this.mono.notesList.length) {
      if (this.mono.notesObj[this.mono.notesList[this.mono.notesList.length - 1]]) {
        this.mono.note = this.mono.notesList[this.mono.notesList.length - 1];
        for (let voice in this.mono.voices) {
          this.mono.voices[voice].setFrequency(this.mono.note);
        }
      } else {
        this.mono.notesList.pop();
        this.findNextNote();
      }
    } else {
      for (let voice in this.mono.voices) {
        this.mono.voices[voice].off();
      }
      this.mono.note = null;
    }
  }

  findFrequencyFromNote(note) {
    return Math.pow(2, (note - 49)/12) * 440;
  }

  togglePoly() {
    this.poly = !this.poly;
    FormViews.updatePolyButton(this.poly);
  }

  setGain(value) {
    this.masterGain.gain.setTargetAtTime(value, this.context.currentTime, 0);
  }

  setAttack(value) {
    this.globals.attack = value;
    this.oscillators.forEach(osc => {
      osc.setAttack(value);
    });
  }

  setRelease(value) {
    this.globals.release = value;
    this.oscillators.forEach(osc => {
      osc.setRelease(value);
    });
  }

  setPorta(value) {
    this.globals.porta = value;
    Manager.synthesizer.oscillators.forEach(osc => {
      osc.setPorta(value);
    });
  }
}

//  - Router
class Router {
  constructor(synthesizer) {
    this.synthesizer = synthesizer;
    this.table = {};
    this.updateRouter = this.updateRouter.bind(this);
    this.setRoute = this.setRoute.bind(this);
  }

  updateRouter() {
    this.synthesizer.oscillators.concat(this.synthesizer.filters).forEach(node => {
      let eligibleDestinations = this.synthesizer.filters.filter(dest => !Helpers.isNodeLoop(node, dest));
      this.table[node.id] = {
        node,
        eligibleDestinations
      };
    });
    RouterViews.updateTable(this.table);
  }

  setRoute(source, destination) {
    source.setDestination(destination);
    this.table[source.id].dest = destination;
    this.updateRouter();
    RouterViews.updateTable(this.table);
  }
}

//  - Voice
class Voice extends OscillatorNode {
  constructor(context, options, parent) {
    super(context, options);

    this.next = null;

    this.parent = parent;
    this.gainNode = this.parent.synthesizer.context.createGain();
    this.gainNode.gain.value = 0;
    this.connect(this.gainNode);
    this.gainNode.connect(parent.output);
    this.start();
    this.gainNode.gain.setTargetAtTime(parent.volume, this.parent.synthesizer.context.currentTime, parent.attack);

    this.setFrequency = this.setFrequency.bind(this);
    this.off = this.off.bind(this);
  }

  setFrequency(note) {
    this.frequency.setTargetAtTime(this.parent.synthesizer.findFrequencyFromNote(note), this.parent.synthesizer.context.currentTime, this.parent.porta);
  }

  off() {
    this.gainNode.gain.setTargetAtTime(0, this.parent.synthesizer.context.currentTime, this.parent.release / 10);
    this.stop(this.parent.synthesizer.context.currentTime + this.parent.release);
  }
}

//  - Oscillator abstraction controlling multiple voiced oscillator nodes
class Oscillator {
  constructor(synthesizer, options = {}) {
    this.synthesizer = synthesizer;
    this.voices = {};
    this.addVoice = this.addVoice.bind(this);
    this.removeVoice = this.removeVoice.bind(this);

    this.id = 1000 + this.synthesizer.oscillators.length;
    this.semitoneOffset = options.semitoneOffset || 0;
    this.fineDetune = options.fineDetune || 0;
    this.volume = options.volume || 0.75;
    this.wave = options.wave || 'sine';
    this.porta = this.synthesizer.globals.porta;
    this.attack = this.synthesizer.globals.attack;
    this.release = this.synthesizer.globals.release;

    this.output = this.synthesizer.context.createGain();
    this.output.gain.value = this.volume;
    this.output.connect(synthesizer.masterGain);
    this.dest = synthesizer.masterGain;

    this.setDestination = this.setDestination.bind(this);

    this.setVolume = this.setVolume.bind(this);
    this.setPorta = this.setPorta.bind(this);
    this.setType = this.setType.bind(this);
    this.setSemitoneOffset = this.setSemitoneOffset.bind(this);
    this.setFineDetune = this.setFineDetune.bind(this);
  }

  addVoice(midiMessage) {
    let voice = new Voice(this.synthesizer.context, {
      frequency: this.synthesizer.findFrequencyFromNote(midiMessage.data[1] + this.semitoneOffset, this.synthesizer.context.currentTime, 0),
      type: this.type,
      detune: this.fineDetune
    }, this);
    voice.onended = (e) => {
      voice.disconnect();
      voice.gainNode.disconnect();
      
    };
    if (!this.voices[midiMessage.data[1]]) {
      this.voices[midiMessage.data[1]] = {};
    }
    Helpers.LL.addToTail(this.voices[midiMessage.data[1]], voice);
    return voice;
  }

  removeVoice(midiMessage) {
    const voice = this.voices[midiMessage.data[1]].head;
    let head = Helpers.LL.removeHead(this.voices[midiMessage.data[1]]);
    if (head === null || head === undefined) {
      delete this.voices[midiMessage.data[1]];
    }
    voice.gainNode.gain.setTargetAtTime(0, this.synthesizer.context.currentTime, this.release / 10);
    voice.stop(this.synthesizer.context.currentTime + this.release);
  }

  setDestination(destination) {
    this.output.disconnect();
    this.output.connect(destination);
    this.dest = destination;
  }

  setVolume(volume) {
    this.volume = volume;
    for (let voice in this.voices) {
      Helpers.LL.changeAllNodes(this.voices[voice], (node) => {
        node.gainNode.value = volume;
      });
    }
  }

  setType(type) {
    this.type = type;
    for (let voice in this.voices) {
      Helpers.LL.changeAllNodes(this.voices[voice], (node) => {
        node.type = type;
      });
    }
  }

  setSemitoneOffset(semitoneOffset) {
    this.semitoneOffset = Number(semitoneOffset);
    for (let voice in this.voices) {
      Helpers.LL.changeAllNodes(this.voices[voice], (node) => {
        node.frequency.setTargetAtTime(this.synthesizer.findFrequencyFromNote(Number(voice) + this.semitoneOffset), this.synthesizer.context.currentTime, 0);
      });
    }
  }

  setFineDetune(detune) {
    this.fineDetune = detune;
    for (let voice in this.voices) {
      Helpers.LL.changeAllNodes(this.voices[voice], (node) => {
        node.detune.setTargetAtTime(detune, this.synthesizer.context.currentTime, 0);
      });
    }
  }

  setPorta(porta) {
    this.porta = porta;
  }

  setAttack(attack) {
    this.attack = attack;
  }
  
  setRelease(release) {
    this.release = release;
  }
}

//  - Filters
class Filter extends BiquadFilterNode {
  constructor(synthesizer, options = {}) {
    super(synthesizer.context);

    this.synthesizer = synthesizer;
    this.id = 2000 + this.synthesizer.filters.length;

    this.type = options.type || 'lowpass';
    this.frequency.setTargetAtTime(options.frequency || 20000, this.context.currentTime, 0);
    this.gain.setTargetAtTime(options.gain || 0, this.context.currentTime, 0);
    this.Q.setTargetAtTime(options.Q || 0, this.context.currentTime, 0);
    this.connect(this.synthesizer.masterGain);
    this.dest = this.synthesizer.masterGain;

    this.setType = this.setType.bind(this);
    this.setFrequency = this.setFrequency.bind(this);
    this.setGain = this.setGain.bind(this);
  }

  setDestination(destination) {
    this.disconnect();
    this.connect(destination);
    this.dest = destination;
  }

  setType(type) {
    this.type = type;
  }

  setFrequency(freq) {
    this.frequency.setTargetAtTime(freq, this.context.currentTime, 0);
  }

  setGain(gain) {
    this.gain.setTargetAtTime(gain, this.context.currentTime, 0);
  }

  setQ(q) {
    this.Q.setTargetAtTime(q, this.context.currentTime, 0);
  }
}

export {
  SynthManager
}
