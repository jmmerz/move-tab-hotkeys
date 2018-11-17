// Configurable options:
var disableTabWrap = false;
var disableTabMultiselect = false;

var DIRECTION_LEFT = -1;
var DIRECTION_RIGHT = 1;

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
        } else {
            break;
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
 * Determine the last valid index that <tab> could be moved to within tablist
 * <tabs> in direction <direction>.
 *
 * tabs: The list of tabs
 * tab: The current tab
 * direction: Either DIRECTION_LEFT or DIRECTION_RIGHT
 */
function getIndexLimitInDirection(tabs, tab, direction) {
    var indexLimit;
    if(tab.pinned) {
        if(direction < 0) {
            indexLimit = getFirstPinnedTabIndex(tabs);
        } else {
            indexLimit = getLastPinnedTabIndex(tabs);
        }
    } else {
        if(direction < 0) {
            indexLimit = getFirstUnpinnedTabIndex(tabs);
        } else {
            indexLimit = getLastUnpinnedTabIndex(tabs);
        }
    }
    return indexLimit;
}

/**
 * Get the next usable tab index in the specified direction from the current
 * tab. A "usable tab index" takes into account hiddin tabs in Firefox and if
 * use of highlighted/multi-selected tabs is enabled, takes that into account as well.
 *
 * tabs: The list of tabs
 * tab: The current tab
 * direction: Either DIRECTION_LEFT or DIRECTION_RIGHT
 * indexLimit: index limit as determined by getIndexLimitInDirection
 */
function getNextUsableTabIndex(tabs, tab, direction, indexLimit) {
    var candidateIndex;
    for(candidateIndex = tab.index + direction; candidateIndex != (indexLimit+direction); candidateIndex += direction) {
        if(isHidden(tabs[candidateIndex])
            || (!disableTabMultiselect && tabs[candidateIndex].highlighted)) {
            continue;
        }
        break;
    }
    return candidateIndex;
}

/**
 * For unpinned tabs, moves the specified tab(s) left one position, rotating to the end if already
 * at the first unpinned position (or first tab if no tabs are pinned). For pinned tabs, does the
 * same thing, but with first/last limited to the group of pinned tabs.
 *
 * If multi-selected/highlighted tab handling is enabled, and a non-contiguous group of tabs is
 * selected, the group will be made contiguous, lining up with the left-most tab. This behaves like
 * Firefox's tab dragging behavior and has fewer edge cases/oddities  than trying to maintain same
 * separation of non-contiguously selected tabs.
 */
function moveTabsLeft(tabs, tabsToMove) {
    var indexLimit = getIndexLimitInDirection(tabs, tabsToMove[0], DIRECTION_LEFT);
    var newIndex = getNextUsableTabIndex(tabs, tabsToMove[0], DIRECTION_LEFT, indexLimit);
    if(!disableTabWrap) {
        if(tabsToMove[0].pinned) {
            if(newIndex < indexLimit) {
                newIndex = getLastPinnedTabIndex(tabs);
            }
        } else if(newIndex < indexLimit) {
            newIndex = getLastUnpinnedTabIndex(tabs);
        }
    } else {
        // Tab wrapping is disabled. Firefox interprets tab index of -1 as 0,
        // but Chrome as begun interpretting it to move to other end of tabs,
        // so we need to limit that here.
        if(newIndex < indexLimit) {
            // Can't move further left.
            newIndex = indexLimit;
        }
    }

    moveTabsToIndex(tabsToMove, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab(s) right one position, rotating to the start if
 * already at the last unpinned position (or last tab if no tabs are pinned). For pinned tabs, does
 * the same thing, but with first/last limited to the group of pinned tabs.
 *
 * If multi-selected/highlighted tab handling is enabled, and a non-contiguous group of tabs is
 * selected, the group will be made contiguous, lining up with the left-most tab. This behaves like
 * Firefox's tab dragging behavior and has fewer edge cases/oddities  than trying to maintain same
 * separation of non-contiguously selected tabs.
 */
function moveTabsRight(tabs, tabsToMove) {
    var lastTab = tabsToMove[tabsToMove.length-1];
    var indexLimit = getIndexLimitInDirection(tabs, lastTab, DIRECTION_RIGHT);
    var newIndex = getNextUsableTabIndex(tabs, lastTab, DIRECTION_RIGHT, indexLimit);
    if(tabsToMove[0].pinned) {
        if(!disableTabWrap && newIndex > indexLimit) {
            newIndex = getFirstPinnedTabIndex(tabs);
        }
    } else if(!disableTabWrap && newIndex > indexLimit) {
        newIndex = getFirstUnpinnedTabIndex(tabs);
    }

    moveTabsToIndex(tabsToMove, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab(s) to the first unpinned position.  For pinned tabs,
 * does the same thing, but with first/last limited to the group of pinned tabs.
 *
 * If multi-selected/highlighted tab handling is enabled, and a non-contiguous group of tabs is
 * selected, the group will be made contiguous at the left-most tab position. This behaves like
 * Firefox's tab dragging behavior and has fewer edge cases/oddities  than trying to maintain same
 * separation of non-contiguously selected tabs.
 */
function moveTabsFirst(tabs, tabsToMove) {
    var newIndex = 0;

    // For Chrome, index 0 always works as first index in group for both pinned and un-pinned tabs.
    // Firefox needs special treatment
    if(IS_FIREFOX) {
        if(tabsToMove[0].pinned) {
            newIndex = getFirstPinnedTabIndex(tabs);
        } else {
            newIndex = getFirstUnpinnedTabIndex(tabs);
        }
    }

    moveTabsToIndex(tabsToMove, newIndex);
}

/**
 * For unpinned tabs, moves the specified tab(s) to the last unpinned position.  For pinned tabs,
 * does the same thing, but with first/last limited to the group of pinned tabs.
 *
 * If multi-selected/highlighted tab handling is enabled, and a non-contiguous group of tabs is
 * selected, the group will be made contiguous at the right-most tab position. This behaves like
 * Firefox's tab dragging behavior and has fewer edge cases/oddities  than trying to maintain same
 * separation of non-contiguously selected tabs.
 */
function moveTabsLast(tabs, tabsToMove) {
    var newIndex = -1;

    // For Chrome, index -1 always works as last index in group for both pinned and un-pinned tabs.
    // Firefox needs special treatment
    if(IS_FIREFOX) {
        var newIndex = (tabs.length-1);
        if(tabsToMove[0].pinned) {
            newIndex = getLastPinnedTabIndex(tabs);
        }
    }

    moveTabsToIndex(tabsToMove, newIndex);
}

/**
 * When multiple tabs are moved via browser.tabs.move(tabIds[]) in Firefox, if they are not adjacent to eachother, they are all
 * moved into a single block of adjacent tabs. Chrome does not reliably do that and some unusual
 * things can happen with the tab ordering.
 */
function moveTabsForChrome(tabsToMove, newIndex) {
    // If we're moving the tab(s) left and/or already at far left and moving to start,
    // reverse the order to handle the way Chrome moves tabs
    if(newIndex <= tabsToMove[0].index && newIndex != -1) {
        tabsToMove = tabsToMove.reverse();
    }
    // Move the tabs one-by-one
    for(var tab of tabsToMove) {
        if(DEBUG) console.log(`moving tab#${tab.id} from ${tab.index} to ${newIndex}`);
        BROWSER.tabs.move(tab.id, { index: newIndex });
    }
}

function moveTabsToIndex(tabsToMove, newIndex) {
    if(DEBUG) console.log(`moving tabs#[${tabsToMove.map(getTabId)}] from [${tabsToMove.map(getTabIndex)}] to ${newIndex}`);
    if(tabsToMove.length > 1 && IS_CHROME) {
        moveTabsForChrome(tabsToMove, newIndex);
    } else {
        BROWSER.tabs.move(tabsToMove.map(getTabId), { index: newIndex });
    }
}

function runOnSelectedTabs(callback) {
    getCurrentWindowTabs((tabs) => {
        logTabListData(tabs);
        var tabsToMove = [];
        var pinnedTabsSelected = false;
        var unpinnedTabsSelected = false;
        for(var tab of tabs) {
            if(tab.active || (!disableTabMultiselect && tab.highlighted)) {
                tabsToMove.push(tab);

                if(tab.pinned) {
                    pinnedTabsSelected = true;
                } else {
                    unpinnedTabsSelected = true;
                }
            }
        }
        if(pinnedTabsSelected && unpinnedTabsSelected) {
            // There's not an obvious movement strategy to use when both pinned
            // and unpinned tabs are selected. Don't move anything in this
            // case.
            if(DEBUG) console.log("Not moving tabs because there are both pinned and non-pinned tabs selected.");
            return;
        }
        callback(tabs, tabsToMove);
    });
}

function getCurrentWindowTabs(callback) {
    var queryInfo = {
      currentWindow: true
    };

    if(IS_FIREFOX) {
        BROWSER.tabs.query(queryInfo).then(callback);
    } else if(IS_CHROME) {
        BROWSER.tabs.query(queryInfo, callback);
    }
}

function isHidden(tab) {
    if(IS_FIREFOX) {
        return (typeof tab.hidden !== 'undefined') && tab.hidden;
    }
    // Chrome does not support tab hiding, so tab _can't_ be hidden
    return false;
}

function getTabId(tab, index) {
    return tab.id;
}

function getTabIndex(tab, index) {
    return tab.index;
}

function logTabListData(tabs) {
    if(DEBUG) {
        console.log('tabs.length: ' + tabs.length);
        console.log('lastTabIndex: ' + getLastUnpinnedTabIndex(tabs));
    }
}


/*
 *  Notes on command keys:
 *      Chrome has a limit of 4 commands per extension. Because of this, we only
 *      support number pad keys with NumLock on for Chrome.
 */
BROWSER.commands.onCommand.addListener((command) => {
    if(DEBUG) console.log("onCommand event received for message: " + command);

    switch(command) {
      case "move-tab-left":
          runOnSelectedTabs(moveTabsLeft);
          break;
      case "move-tab-right":
          runOnSelectedTabs(moveTabsRight);
          break;
      case "move-tab-first-numbers-row":
      case "move-tab-first-numpad-numlock-on":
      case "move-tab-first-numpad-numlock-off":
          runOnSelectedTabs(moveTabsFirst);
          break;
      case "move-tab-last-numbers-row":
      case "move-tab-last-numpad-numlock-on":
      case "move-tab-last-numpad-numlock-off":
          runOnSelectedTabs(moveTabsLast);
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
            case "disable_tab_multiselect":
                disableTabMultiselect = changes[storageKey].newValue;
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
            if(result == null) {
                disableTabWrap = false;
                disableTabMultiselect = false;
            } else {
                if(result.disable_tab_wrap == null) {
                    disableTabWrap = false;
                } else {
                    disableTabWrap = result.disable_tab_wrap;
                }

                if(result.disable_tab_multiselect == null) {
                    disableTabMultiselect = false;
                } else {
                    disableTabMultiselect = result.disable_tab_multiselect;
                }
            }
        }

        var storageKeys = ["disable_tab_wrap", "disable_tab_multiselect"];
        if(IS_FIREFOX) {
            BROWSER.storage.local.get(storageKeys).then(setDebugLogging);
        } else if (IS_CHROME) {
            BROWSER.storage.local.get(storageKeys, setDebugLogging);
        }
    })();

    initRequired = false;
}
