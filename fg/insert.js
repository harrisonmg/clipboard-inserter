(() => {
    const processMessage = msg => {
        switch (msg.action) {
            case "insert":
                const elem = document.createElement(msg.options.elemName);
                elem.textContent = msg.text;
                if (msg.options.prependInstead) {
                    document.querySelector(msg.options.containerSelector).prepend(elem);
                } else {
                    document.querySelector(msg.options.containerSelector).appendChild(elem);
                }
                break;
            case "uninject":
                chrome.runtime.onMessage.removeListener(processMessage);
                break;
        }
    };

    chrome.runtime.onMessage.addListener(processMessage);
})();
