import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App';
import { Inject, Eject } from './inject';
import { MelvorInjector } from './melvor';

const statTrackerId = 'stat-tracker-container';

// Find or Create stat-tracker container
let statTrackerElm = document.getElementById(statTrackerId);
if (!statTrackerElm) {
    const navMenu = document.getElementById('nav-menu-show');
    if (!navMenu) {
        throw `Unable to find #nav-menu-show. Cannot create ${statTrackerId}`;
    }

    statTrackerElm = document.createElement('div');
    statTrackerElm.id = statTrackerId;
    navMenu.prepend(statTrackerElm);
}

// Inject into the global functions of MelvorIdle
const melvorInjector = new MelvorInjector();
Inject(melvorInjector);

// Render application
const app = melvorInjector.app = ReactDOM.render(React.createElement(App), statTrackerElm);

// Print package name + version
declare var __npm_package_name__: string;
console.log(`Loaded ${__npm_package_name__}.`);

// Enable hot reload
if (module.hot) {
    __webpack_public_path__ = 'https://localhost:8080/';

    if (module.hot.data) {
        app.setState(module.hot.data.app);
    }

    module.hot.accept();
    module.hot.dispose((data) => {
        data.app = app.state;
        Eject(melvorInjector);
    });
}
