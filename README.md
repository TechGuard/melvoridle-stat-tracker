# ![Icon](/extension/src/icon16.png) MelvorIdle - StatTracker

**Note: This is not an official [melvoridle.com](https://melvoridle.com/) project.**

![Screenshot](/extension/screenshot1.png)

This extension adds statistic tracking for skills and items to the navigation menu.

* Skills: exp/hr and time until next level.
* Items: items/hr and gold/hr.

# How to install

You can install this extension (with automatic updates) on [Chrome](https://chrome.google.com/webstore/detail/melvoridle-stattracker/ejhffeagphghbmdaakobmfpobjijaogg) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/melvoridle-stattracker/).

# How to build locally

If you just want the distribution file:

```
cd app
npm run build
```

If you want to develop and test the extension:

```
cd app
npm run serve
```

This will start a local dev server with hot reloading enabled. If you have the extension installed you can enable "developer mode" in the options page. If not, you have to inject the script yourself: [https://localhost:8080/app.bundle.js](https://localhost:8080/app.bundle.js).

**Note:** You might need to accept the self-signed certificate first, otherwise the browser might block the script. This can be done easily by opening the url above, Click > "Advanced" > "Proceed anyway".