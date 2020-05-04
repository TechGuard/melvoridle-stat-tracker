const storageAPI = window.storage || chrome.storage;
storageAPI.local.get(['experimental', 'developer'], function (data) {

    let src = null;

    if (data.developer) {
        src = 'https://localhost:8080/app.bundle.js';
    } else if (data.experimental) {
        src = 'https://techguard.github.io/melvoridle-stat-tracker/app/dev/app.bundle.js';
    } else {
        src = 'https://techguard.github.io/melvoridle-stat-tracker/app/dist/app.bundle.js';
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.head.appendChild(script);
});
