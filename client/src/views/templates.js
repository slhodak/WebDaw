const Templates = {
  link(synthName, classList, text, href, blankTarget) {
    let link = document.createElement('a');
    link.dataset.name = synthName;
    link.setAttribute('class', classList);
    link.setAttribute('href', href);
    blankTarget ? link.setAttribute('target', '_blank') : null;
    link.innerText = text;
    return link;
  },
  slider(synthName, name, title, min, max, value, step) {
    let slider = document.createElement('div');
    slider.setAttribute('class', 'slider row');
    slider.setAttribute('data-name', synthName);
    slider.innerHTML = 
      `<label for="${name}">${title}: </label>
      <input class="${name}" name="${title}" type="range" min="${min}" max="${max}" value="${value}" step="${step}">
      <div class="${name}Display">${value}</div>`
    return slider;
  },
  button(synthName, classList, text) {
    let button = document.createElement('button');
    button.setAttribute('class', classList);
    button.setAttribute('data-name', synthName);
    button.setAttribute('type', "button");
    button.innerText = text;
    return button;
  }
};

export default Templates;
