import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App';
import { Inject, Eject } from './inject';

let app: App;

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
const originals = Inject({
    addXP(skill, xp) {
        try {
            app.trackObject('skill', skill, xp);
        } catch (err) {
            console.error(err);
        }
        return originals.addXP(skill, xp);
    },
    addItemToBank(itemID, quantity, found, showNotification) {
        try {
            app.trackObject('item', itemID, quantity);
        } catch (err) {
            console.error(err);
        }
        return originals.addItemToBank(itemID, quantity, found, showNotification);
    },
});

// Render application
app = ReactDOM.render(React.createElement(App), statTrackerElm);

// Enable hot reload
if (module.hot) {
    __webpack_public_path__ = 'https://localhost:8080/';

    if (module.hot.data) {
        app.setState(module.hot.data.app);
    }

    module.hot.accept();
    module.hot.dispose((data) => {
        data.app = app.state;
        Eject(originals);
    });
}
