const storageAPI = window.storage || chrome.storage;
storageAPI.local.get('developer', function (data) {

    let src = 'https://techguard.github.io/melvoridle-stat-tracker/app/dist/app.bundle.js';

    if (data.developer) {
        src = 'https://localhost:8080/app.bundle.js';
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.head.appendChild(script);
});
