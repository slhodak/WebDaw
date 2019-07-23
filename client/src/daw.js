//  Browser-Based DAW
//  Brings synths and sequencer together (and other tools)

//  require subcomponents accessible via network?
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

export default Manager;
