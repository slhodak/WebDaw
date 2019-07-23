const host = 'http://localhost:9000';

const scripts = [
  '/client/src/daw.js',
  '/client/src/controllers/controllers.js',
  '/client/config/config.js'
];

let reference = document.getElementsByClassName('scripts')[0];

function addScripts(scripts, reference) {
  scripts.forEach(title => {
    let script = document.createElement('script');
    script.src = host + title;
    script.type = "module"
    document.body.insertBefore(script, reference);
  });
}

addScripts(scripts, reference);
