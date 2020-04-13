# ![Icon](/extension/dist/icon16.png) MelvorIdle - StatTracker

**Note: This is not an official melvoridle.com project.**

![Screenshot](/extension/screenshot1.png)

This extension adds statistic tracking for skills and items to the navigation menu.

* Skills: exp/hr and time until next level.
* Items: items/hr and gold/hr.

# How to install

You can install this as a chrome extension with automatic updates: https://chrome.google.com/webstore/detail/melvoridle-stattracker/ejhffeagphghbmdaakobmfpobjijaogg

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

This will start a local dev server with hot reloading enabled. Inject the script https://localhost:8080/app.bundle.js into melvoridle.com to start testing. For example, use [Tampermonkey](https://www.tampermonkey.net/) to inject the script.