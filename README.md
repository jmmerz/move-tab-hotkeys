# Move Tab Hotkeys

### This extension provides hotkeys for the following actions:

|Key|Action|Description|
|---|------|-----------|
|<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>Left</kbd>|Move tab left|Moves the current tab one spot to the left.<br/>If it is at the start of the tab bar, it wraps to the end.|
|<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>Right</kbd>|Move tab right|Moves the current tab one spot to the right.<br/>If it is at the end of the tab bar, it wraps to the start.|
|<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd>|Move tab to start|Moves the current tab to the start of the tab bar.|
|<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>9</kbd>|Move tab to end|Moves the current tab to the end of the tab bar.|

### Pinned and un-pinned tabs:
For all of the above, pinned and un-pinned tabs are treated separately.

Pinned tabs are kept in one block at the start of the tab bar, and un-pinned tabs are in a second block to the right. Whenever a tab is moved left/right or to start/end, that move happens within the part of the tab bar corresponding to it's pinned status.

## Installation:
* [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/move-tab-hotkeys/)
* [Install for Chrome](https://chrome.google.com/webstore/detail/move-tab-hotkeys/paafmjjgeiociknojggclhkbkaffjgoe)
    * [Install Number Chrome - Extra addon for using number pad](https://chrome.google.com/webstore/detail/omhajbebapbleblliebjpmddcmalofgp)

## Version History:

#### [1.2.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.2.0):
* Fix use of Alt+Shift+0/9 using the numeric keypad.

#### [1.1.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.1.0):
* Add option to disable tab wrapping at start/end of tab bar.

#### [1.0.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.0.0):
* Initial release.
