var script = document.createElement('script');
script.type = 'text/javascript';
script.src = chrome.extension.getURL('app.bundle.js');
document.head.appendChild(script);