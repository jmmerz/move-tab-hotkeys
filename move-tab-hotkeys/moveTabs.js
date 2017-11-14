// Configurable options:
var disableTabWrap = false;

/**
 * Finds the index of the first pinned tab in a list of tabs.
 */
function getFirstPinnedTabIndex(tabs) {
    for (var tab of tabs) {
        if (tab.pinned) {
            return tab.index;
        }
    }
}

/**
 * Finds the index of the last pinned tab in a list of tabs.
 */
function getLastPinnedTabIndex(tabs) {
    var lastPinnedTabIndex = -1;
    for (var tab of tabs) {
        if (tab.pinned) {
            lastPinnedTabIndex = tab.index;
        }
    }
    return lastPinnedTabIndex;
}

/**
 * Finds the index of the first unpinned tab in a list of tabs.
 */
function getFirstUnpinnedTabIndex(tabs) {
    for (var tab of tabs) {
        if (!tab.pinned) {
            return tab.index;
        }
    }
}

/**
 * Finds the index of the last unpinned tab in a list of tabs.
 */
function getLastUnpinnedTabIndex(tabs) {
    return tabs[tabs.length-1].index;
}


/**
 * For unpinned tabs, moves the specified tab left one position, rotating to
 * the end if it is already the first unpinned tab (or first tab if no tabs are
 * pinned). For pinned tabs, does the same thing, but with first/last limited to
 * the group of pinned tabs.
 */
function moveTabLeft(tabs, tab) {
    var newIndex = tab.index-1;
    if(tab.pinned) {
        if(!disableTabWrap && newIndex < getFirstPinnedTabIndex(tabs)) {
            newIndex = getLastPinnedTabIndex(tabs);
        }
    } else if(!disableTabWrap && newIndex < getFirstUnpinnedTabIndex(tabs)) {
        newIndex = getLastUnpinnedTabIndex(tabs);
    }

    moveTabToIndex(tab, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab right one position, rotating to
 * the start if it is already the last unpinned tab (or last tab if no tabs are
 * pinned). For pinned tabs, does the same thing, but with first/last limited to
 * the group of pinned tabs.
 */
function moveTabRight(tabs, tab) {
    var newIndex = tab.index+1;
    if(tab.pinned) {
        if(!disableTabWrap && newIndex > getLastPinnedTabIndex(tabs)) {
            newIndex = getFirstPinnedTabIndex(tabs);
        }
    } else if(!disableTabWrap && newIndex > getLastUnpinnedTabIndex(tabs)) {
        newIndex = getFirstUnpinnedTabIndex(tabs);
    }

    moveTabToIndex(tab, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab to the first unpinned position.
 * For pinned tabs, does the same thing, but with first/last limited to the
 * group of pinned tabs.
 */
function moveTabFirst(tabs, tab) {
    var newIndex = 0;
    if(tab.pinned) {
        newIndex = getFirstPinnedTabIndex(tabs);
    } else {
        newIndex = getFirstUnpinnedTabIndex(tabs);
    }

    moveTabToIndex(tab, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab to the last unpinned position.
 * For pinned tabs, does the same thing, but with first/last limited to the
 * group of pinned tabs.
 */
function moveTabLast(tabs, tab) {
    var newIndex = (tabs.length-1);
    if(tab.pinned) {
        newIndex = getLastPinnedTabIndex(tabs);
    }

    moveTabToIndex(tab, newIndex);
}

function moveTabToIndex(tab, newIndex) {
    if(DEBUG) console.log(`moving tab#${tab.id} from ${tab.index} to ${newIndex}`);
    BROWSER.tabs.move([tab.id], { index: newIndex });
}

function runOnSelectedTab(callback) {
    getCurrentWindowTabs((tabs) => {
        logTabListData(tabs);
        for(var tab of tabs) {
            if(tab.active) {
                callback(tabs, tab);
                break;
            }
        }
    });
}

function getCurrentWindowTabs(callback) {
    var queryInfo = {
      //active: true,
      currentWindow: true
    };

    if(IS_FIREFOX) {
        BROWSER.tabs.query(queryInfo).then(callback);
    } else if(IS_CHROME) {
        BROWSER.tabs.query(queryInfo, callback);
    }
}

function logTabListData(tabs) {
    if(DEBUG) {
        console.log('tabs.length: ' + tabs.length);
        console.log('lastTabIndex: ' + getLastUnpinnedTabIndex(tabs));
        //for(var tab of tabs) {
        //    console.log('active: ' + tab.active);
        //    console.log('id: ' + tab.id);
        //    console.log('index: ' + tab.index);
        //}
    }
}



BROWSER.commands.onCommand.addListener((command) => {
    if(DEBUG) console.log("onCommand event received for message: " + command);

    switch(command) {
      case "move-tab-left":
          runOnSelectedTab(moveTabLeft);
          break;
      case "move-tab-right":
          runOnSelectedTab(moveTabRight);
          break;
      case "move-tab-first":
          runOnSelectedTab(moveTabFirst);
          break;
      case "move-tab-last":
          runOnSelectedTab(moveTabLast);
          break;
    }
});

BROWSER.storage.onChanged.addListener((changes, area) => {

    var changedItems = Object.keys(changes);
    for (var storageKey of changedItems) {
        switch(storageKey) {
            case "disable_tab_wrap":
                disableTabWrap = changes[storageKey].newValue;
                logOptionChange(changes, storageKey);
                break;
            default:
                // Do nothing
        }
    }

});

// Initialize Options
var initRequired = true;
if(initRequired) {
    (function() {
        function setDebugLogging(result) {
            if(result == null || result.disable_tab_wrap == null) {
                disableTabWrap = false;
            } else {
                disableTabWrap = result.disable_tab_wrap;
            }
        }

        if(IS_FIREFOX) {
            BROWSER.storage.local.get("disable_tab_wrap").then(setDebugLogging);
        } else if (IS_CHROME) {
            BROWSER.storage.local.get("disable_tab_wrap", setDebugLogging);
        }
    })();

    initRequired = false;
}
