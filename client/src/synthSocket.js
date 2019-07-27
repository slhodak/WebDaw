import { Network } from '../config/config.js';

const socket = new WebSocket(`${Network.synthWSHost}:${Network.synthWSPort}`, 'synth');

socket.onopen = (open) => {
  console.log(open);
};

socket.onmessage = (message) => {

};
