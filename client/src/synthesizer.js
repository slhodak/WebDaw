import Helpers from './lib/helpers.js';

/*  _  _   __  ____  ____  __    ____ 
*  ( \/ ) /  \(    \(  __)(  )  / ___)
*  / \/ \(  O )) D ( ) _) / (_/\\___ \
*  \_)(_/ \__/(____/(____)\____/(____/
*/

let SynthManager = {
  createSynthesizer(daw, options) {
    SynthManager.synthesizer = new Synthesizer(daw, options);
  },
  synthesizer: null,
  sequencerSocket: null,
  overwrite: false,
  darkMode: false
};

//  - Synthesizer
class Synthesizer {
  constructor(daw, options = {}) {
    this.name = options.name;
    this.daw = daw;
    this.router = new Router(this);
    this.output = daw.context.createGain();
    this.output.connect(daw.masterGain);
    this.globals = {
      poly: options.poly,
      porta: options.porta,
      attack: options.attack,
      release: options.release,
      type: options.type,
      mute: options.mute,
      volume: options.volume
    };
    this.mono = {
      note: null,
      notesList: [],
      notesObj: {},
      voices: {}
    };
    this.oscillators = [];
    this.filters = [];
    this.addOscillator = this.addOscillator.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
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

  update(synthesizer) {
    this.name = synthesizer.name;
    this.porta = synthesizer.globals.porta;
    this.attack = synthesizer.globals.attack;
    this.release = synthesizer.globals.release;
    this.globals.poly = synthesizer.globals.poly;

    this.oscillators = [];
    synthesizer.oscillators.forEach(osc => {
      this.addOscillator({
        semitoneOffset: osc.semitoneOffset,
        fineDetune: osc.fineDetune,
        volume: osc.volume,
        type: osc.type
      });
    });
    
    this.filters = [];
    synthesizer.filters.forEach(filt => {
      this.addFilter({
        type: filt.type,
        frequency: filt.frequency,
        gain: filt.gain,
        Q: filt.Q
      });
    });

    for (let route in synthesizer.router) {
      let destination;
      if (synthesizer.router[route] === 'main out') {
        destination = this.output;
      } else {
        destination = this.router.table[synthesizer.router[route]].node;
      }

      this.router.setRoute(
        this.router.table[route].node,
        destination
      );
    }
  }

  toggleMute() {
    if (this.globals.mute) {
      this.setGain(this.globals.volume);
    } else {
      this.output.gain.setTargetAtTime(0, this.daw.context.currentTime, 0);
    }
    this.globals.mute = !this.globals.mute;
  }

  playNote(midiMessage) {
    if (this.globals.poly) {
      this.oscillators.forEach(osc => {
        osc.addVoice(midiMessage);
      });
    } else {
      if (!this.mono.note) {
        this.oscillators.forEach(osc => {
          this.mono.voices[midiMessage.data[1]] = new Voice(
            this.daw.context, 
            {
              frequency: this.findFrequencyFromNote(midiMessage.data[1]),
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

  endNote(midiMessage) {
    if (this.globals.poly) {
      this.oscillators.forEach(osc => {
        osc.removeVoice(midiMessage);
      });
    } else {
      delete this.mono.notesObj[midiMessage.data[1]];
      this.findNextNote();
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
    this.globals.poly = !this.globals.poly;
  }

  setGain(value) {
    this.globals.volume = value;
    console.log(this.output.gain.value);
    this.output.gain.setTargetAtTime(value, this.daw.context.currentTime, 0);
    console.log(this.output.gain.value);
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
  }

  setRoute(source, destination) {
    source.setDestination(destination);
    this.table[source.id].dest = destination;
    this.updateRouter();
  }
}

//  - Voice
class Voice extends OscillatorNode {
  constructor(context, options, parent) {
    super(context, options);

    this.next = null;

    this.parent = parent;
    this.gainNode = this.parent.synthesizer.daw.context.createGain();
    this.gainNode.gain.value = 0;
    this.connect(this.gainNode);
    this.gainNode.connect(parent.output);
    this.start();
    this.gainNode.gain.setTargetAtTime(parent.volume, this.parent.synthesizer.daw.context.currentTime, parent.attack);
    this.setFrequency = this.setFrequency.bind(this);
    this.off = this.off.bind(this);
  }

  setFrequency(note) {
    this.frequency.setTargetAtTime(this.parent.synthesizer.findFrequencyFromNote(note), this.parent.synthesizer.daw.context.currentTime, this.parent.porta);
  }

  off() {
    this.gainNode.gain.setTargetAtTime(0, this.parent.synthesizer.daw.context.currentTime, this.parent.release / 10);
    this.stop(this.parent.synthesizer.daw.context.currentTime + this.parent.release);
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
    this.type = options.type || 'sine';
    this.porta = this.synthesizer.globals.porta;
    this.attack = this.synthesizer.globals.attack;
    this.release = this.synthesizer.globals.release;

    this.output = this.synthesizer.daw.context.createGain();
    this.output.gain.value = this.volume;
    this.output.connect(synthesizer.output);
    this.dest = synthesizer.output;

    this.setDestination = this.setDestination.bind(this);

    this.setGain = this.setGain.bind(this);
    this.setPorta = this.setPorta.bind(this);
    this.setType = this.setType.bind(this);
    this.setSemitoneOffset = this.setSemitoneOffset.bind(this);
    this.setFineDetune = this.setFineDetune.bind(this);
  }

  addVoice(midiMessage) {
    let voice = new Voice(this.synthesizer.daw.context, {
      frequency: this.synthesizer.findFrequencyFromNote(midiMessage.data[1] + this.semitoneOffset, this.synthesizer.daw.context.currentTime, 0),
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
    voice.gainNode.gain.setTargetAtTime(0, this.synthesizer.daw.context.currentTime, this.release / 10);
    voice.stop(this.synthesizer.daw.context.currentTime + this.release);
  }

  setDestination(destination) {
    this.output.disconnect();
    this.output.connect(destination);
    this.dest = destination;
  }

  setGain(volume) {
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
        node.frequency.setTargetAtTime(this.synthesizer.findFrequencyFromNote(Number(voice) + this.semitoneOffset), this.synthesizer.daw.context.currentTime, 0);
      });
    }
  }

  setFineDetune(detune) {
    this.fineDetune = detune;
    for (let voice in this.voices) {
      Helpers.LL.changeAllNodes(this.voices[voice], (node) => {
        node.detune.setTargetAtTime(detune, this.synthesizer.daw.context.currentTime, 0);
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
    super(synthesizer.daw.context);

    this.synthesizer = synthesizer;
    this.id = 2000 + this.synthesizer.filters.length;

    this.type = options.type || 'lowpass';
    this.frequency.setTargetAtTime(options.frequency || 20000, this.synthesizer.daw.context.currentTime, 0);
    this.gain.setTargetAtTime(options.gain || 0, this.synthesizer.daw.context.currentTime, 0);
    this.Q.setTargetAtTime(options.Q || 0, this.synthesizer.daw.context.currentTime, 0);
    this.connect(this.synthesizer.output);
    this.dest = this.synthesizer.output;

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
    this.frequency.setTargetAtTime(freq, this.synthesizer.daw.context.currentTime, 0);
  }

  setGain(gain) {
    this.gain.setTargetAtTime(gain, this.synthesizer.daw.context.currentTime, 0);
  }

  setQ(q) {
    this.Q.setTargetAtTime(q, this.synthesizer.daw.context.currentTime, 0);
  }
}

export {
  SynthManager
}
