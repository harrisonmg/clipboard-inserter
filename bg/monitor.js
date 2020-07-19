console.log("I'm alive");

let previousContent = "";
let listeningTabs = [];
let timer = null;
let options = defaultOptions;

chrome.storage.local.get(defaultOptions,
    o => options = o);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        const optionKeys = Object.keys(options);
        for (var key of Object.keys(changes)) {
            if (optionKeys.indexOf(key) >= 0) {
                options[key] = changes[key].newValue;
            }
        }
        updateTimer();
    }
});


const pattern1 = "*://*/*" + options.urlContains + "*";
const pattern2 = "file:///*/*" + options.urlContains + "*";

const filter = {
    urls: [pattern1, pattern2]
};

function handleUpdated(tabId, changeInfo, tabInfo) {
    //toggle tab if it is detected by the filter
    // console.log(`Updated tab: ${tabId}`);
    // console.log("Changed attributes: ", changeInfo);
    // console.log("New tab Info: ", tabInfo);
    if (changeInfo.status == "loading" && changeInfo.url != null) {
        const index = listeningTabs.indexOf(tabId);
        if (index >= 0) {
            // console.log("REMOVETAB: ", uninject);
            toggleTab(tabId, 1);
        }
    } else {
        if (changeInfo.status == "complete") {
            // console.log("INJECT: ", uninject);
            toggleTab(tabId, 0);
        }
    }
}

browser.tabs.onUpdated.addListener(handleUpdated, filter);


chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query({
            active: true,
            currentWindow: true
        },
        ([t]) => toggleTab(t.id, 0));
});

window.onload = () => {
    document.querySelector("#paste-target").addEventListener("paste", e => {
        if (e.clipboardData.getData("text/plain") === "") {
            e.preventDefault(); // prevent anything that is not representable as plain text from being pasted
        }
    });
};

function uninject(id) {
    chrome.tabs.sendMessage(id, {
        action: "uninject"
    });
}

function toggleTab(id, removetab) {
    const index = listeningTabs.indexOf(id);
    if (removetab) {
        // console.log("toggleTab -> NEWuninject");
        listeningTabs.splice(index, 1);
        updateTimer();
        chrome.browserAction.setBadgeText({
            text: "",
            tabId: id
		});
		return;
    }
    if (index >= 0) {
        uninject(id);
        // console.log("toggleTab -> uninject");
        listeningTabs.splice(index, 1);
        updateTimer();
        chrome.browserAction.setBadgeText({
            text: "",
            tabId: id
        });
    } else {
        chrome.tabs.executeScript({
            file: "/fg/insert.js"
        });
        listeningTabs.push(id);
        // console.log("toggleTab -> push");
        updateTimer();
        chrome.browserAction.setBadgeBackgroundColor({
            color: "green",
            tabId: id
        });
        chrome.browserAction.setBadgeText({
            text: "ON",
            tabId: id
        });
    }
}

function notifyForeground(id, text) {
    chrome.tabs.sendMessage(id, {
        action: "insert",
        text,
        options
    });
}


function checkClipboard() {
    const pasteTarget = document.querySelector("#paste-target");
    pasteTarget.innerText = "";
    pasteTarget.focus();
    document.execCommand("paste");
    const content = pasteTarget.innerText;
    if (content.trim() !== previousContent.trim() && content != "") {
        listeningTabs.forEach(id => notifyForeground(id, content));
        previousContent = content;
    }
}

function updateTimer() {
    function stop() {
        clearInterval(timer.id);
        timer = null;
    }

    function start() {
        const id = setInterval(checkClipboard, options.monitorInterval);
        timer = {
            id,
            interval: options.monitorInterval
        };
    }
    if (listeningTabs.length > 0) {
        if (timer === null) {
            start();
        } else if (timer.interval !== options.monitorInterval) {
            stop();
            start();
        }
    } else {
        stop();
    }
}
