document.addEventListener("DOMContentLoaded", () => {
    const elemName = document.querySelector("#elem-name"),
        containerSelector = document.querySelector("#container-selector"),
        urlContins = document.querySelector("#url-contains"),
        prependInstead = document.querySelector("#prepend-instead"),
        monitorInterval = document.querySelector("#monitor-interval");

    const storage = chrome.storage.local;

    storage.get(defaultOptions, o => {
        elemName.value = o.elemName;
        containerSelector.value = o.containerSelector;
        monitorInterval.value = o.monitorInterval;
        prependInstead.checked = o.prependInstead;
        urlContins.value = o.urlContins;
    });
    elemName.onchange = () => storage.set({
        elemName: elemName.value
    });
    prependInstead.onchange = () => storage.set({
        prependInstead: prependInstead.checked
    });
    urlContins.onchange = () => storage.set({
        urlContins: urlContins.value
    });
    containerSelector.onchange = () => storage.set({
        containerSelector: containerSelector.value
    });
    monitorInterval.onchange = () => {
        const newVal = monitorInterval.value;
        if (newVal >= 100) {
            storage.set({
                monitorInterval: monitorInterval.value
            });
        }
    };
});
