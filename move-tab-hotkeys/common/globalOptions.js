var DEBUG = false;

function logOptionChange(changes, storageKey, logEvenIfNotDebug) {
    if(DEBUG || logEvenIfNotDebug) console.log(storageKey + " changed from: " + changes[storageKey].oldValue + " to: " + changes[storageKey].newValue);
}

/* This listener is defined once in each place that the script is invoked. */
BROWSER.storage.onChanged.addListener((changes, area) => {

    var changedItems = Object.keys(changes);
    for (var storageKey of changedItems) {
        switch(storageKey) {
            case "GLOBAL_enable_debug_logging":
                DEBUG = changes[storageKey].newValue;
                logOptionChange(changes, storageKey, true);
                break;
            default:
                // Do nothing
        }
    }

});

// Initialize Global Options
var initRequired = true;
if(initRequired) {
    (function() {
        function setDebugLogging(result) {
            if(result == null || result.GLOBAL_enable_debug_logging == null) {
                DEBUG = false;
            } else {
                DEBUG = result.GLOBAL_enable_debug_logging;
            }
        }

        if(IS_FIREFOX) {
            BROWSER.storage.local.get("GLOBAL_enable_debug_logging").then(setDebugLogging);
        } else if (IS_CHROME) {
            BROWSER.storage.local.get("GLOBAL_enable_debug_logging", setDebugLogging);
        }
    })();

    initRequired = false;
}
