import { Network } from '../config/config.js';
import DawManager from './daw.js';
import { SynthView } from './views/views.js';

const socket = new WebSocket(`${Network.synthWSHost}:${Network.synthWSPort}`, 'daw');

socket.onopen = (open) => {
  console.log("Opened connection to WebSynth");
};

socket.onmessage = (message) => {
  let data = JSON.parse(message.data);
  if (data.rename) {
    DawManager.renameSynth(data.rename[0], data.rename[1]);
    SynthView.updateSynthName(data.rename[0], data.rename[1]);
    SynthView.populateSynthPresetSelector();
  }
};
