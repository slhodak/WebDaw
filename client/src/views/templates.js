const Templates = {
  link(classList, text, href, blankTarget) {
    let link = document.createElement('a');
    let classes = '';
    classList.forEach((className, index) => {
      classes += className
      if (index !== classList.length - 1) {
        classes += ' '
      }
    });
    link.setAttribute('class', classes);
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
  button(synthName, name, text) {
    let button = document.createElement('div');
    button.setAttribute('class', name);
    button.setAttribute('data-name', synthName);
    button.innerHTML = `<button type="button">${text}</button>`;
    return button;
  }
};

export default Templates;
