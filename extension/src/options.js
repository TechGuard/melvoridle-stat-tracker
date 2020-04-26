const storageLoaded = [];
const storageAPI = window.storage || chrome.storage;

const createElement = function (tagName, className) {
    const el = document.createElement(tagName);
    el.classList.add(className);
    return el;
}

document.querySelectorAll('[data-toggle]').forEach(function (toggle) {
    const storageKey = toggle.dataset.toggle;
    const storageType = toggle.dataset.storage || "sync";

    if (storageKey && storageType) {
        toggle.appendChild(createElement('span', 'bar'));
        toggle.appendChild(createElement('span', 'knob'));
        toggle.classList.add('toggle');

        const updateClass = function (checked) {
            if (checked === true) {
                toggle.classList.add('checked');
            } else {
                toggle.classList.remove('checked');
            }
        }

        storageLoaded.push(new Promise(function (resolve) {
            storageAPI[storageType].get(storageKey, function (data) {
                updateClass(data[storageKey]);
                resolve();
            });
        }));

        storageAPI.onChanged.addListener(function (changes) {
            for (const key in changes) {
                if (key === storageKey) {
                    updateClass(changes[key].newValue);
                }
            }
        });

        toggle.onclick = function () {
            storageAPI[storageType].set({
                [storageKey]: !toggle.classList.contains('checked')
            });
        };
    }
});

// Show page when all storage keys are loaded
Promise.all(storageLoaded).then(function () {
    document.body.classList.add('loaded');
});