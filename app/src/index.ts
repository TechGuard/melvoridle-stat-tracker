import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App';
import { Inject, Eject } from './inject';
import { MelvorInjector } from './melvor';

declare var __npm_package_name__: string;
declare var __npm_package_version__: string;
declare var __gtag_tracking_id__: string;

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
const app = (melvorInjector.app = ReactDOM.render(React.createElement(App), statTrackerElm));

// Print package name
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

// Enable google analytics if available
declare var gtag: any;
if (__gtag_tracking_id__ && gtag) {
    gtag('config', __gtag_tracking_id__, {
        packageName: __npm_package_name__,
        packageVersion: __npm_package_version__,
    });
}
