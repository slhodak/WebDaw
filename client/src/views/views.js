import Templates from './templates.js';

const SynthViews = {
  add(synth) {
    let synthList = document.getElementsByClassName('synthList')[0];
    let synthElem = document.createElement('div');
    synthElem.innerHTML = Templates.synthesizer(synth);
    synthList.appendChild(synthElem);
  }
};

export {
  SynthViews
}
