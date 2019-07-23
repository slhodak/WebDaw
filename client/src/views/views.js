import Templates from './templates.js';

const SynthViews = {
  createSynth(synth) {
    let synthList = document.getElementsByClassName('synthList')[0];
    synthList.appendChild(Templates.createSynth(synth));
  }
};

export {
  SynthViews
}
