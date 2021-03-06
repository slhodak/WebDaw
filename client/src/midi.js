import DawManager from './daw.js';

let MIDIKeyboard = {
  connect() {
    window.navigator.requestMIDIAccess()
      .then(midiAccess => {
        MIDIKeyboard.create(midiAccess);
      })
      .catch(error => {
        console.error(error);
      });
  },
  create(midiAccess) {
    MIDIKeyboard.midiAccess = midiAccess;
    console.log('connected to midi');
    midiAccess.inputs.forEach(port => {
      port.onmidimessage = (message) => {
        if (DawManager.daw) {
          DawManager.daw.handleMIDI(message);
        }
      }
    });
  }
};

MIDIKeyboard.connect();
