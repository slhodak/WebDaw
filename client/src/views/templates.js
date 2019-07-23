const Templates = {
  synthesizer(synth) {
    //  use synth model (containing http link) to create device button
    return `<div class="synthesizer row">
    <a href="${synth.link}">Open</a>
    ${Templates.slider('volume', 'Volume', 0, 1, 0.75, 0.001)}
    </div>`;
  },
  slider(name, title, min, max, value, step) {
    return (
      `<div class="slider row">
        <label for="${name}">${title}: </label>
        <input class="${name}" name="${title}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">
        <div class="${name}Display">${value}</div>
      </div>`
    );
  },
};

export default Templates;
