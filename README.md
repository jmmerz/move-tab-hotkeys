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

### Multi-selected tabs
If multiple tabs are selected, they can be moved together.
* If the tabs are not adjacent, they are made adjacent upon first move per the behavior of dragging
  multiple non-adjacent tabs in Firefox. This is a simpler behavior with fewer unexpected results
  than what happens in Chrome for that situation.
* This can be turned off by checking the "Don't move multi-selected tabs together" checkbox in the
  options.
* If a group of selected tabs includes both pinned and un-pinned tabs, the tabs will not be moved at
  all.
* On Firefox 63 and later, multiple-selection of tabs is not enabled by default. You must enable the
  `browser.tabs.multiselect` property in `about:config`.

## Installation:
* [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/move-tab-hotkeys/)
* [Install for Chrome](https://chrome.google.com/webstore/detail/move-tab-hotkeys/paafmjjgeiociknojggclhkbkaffjgoe)
    * [Install for Chrome - Extra addon for using number pad](https://chrome.google.com/webstore/detail/omhajbebapbleblliebjpmddcmalofgp)

## Version History:

#### [2.3.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v2.3.0):
* Update to Manifest V3

#### [2.2.1](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v2.2.1):
* Add a new 128x128 icon to satisfy Chrome Web Store requirements

#### [2.2.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v2.2.0):
* Add ability to move multiple tabs at once if multiple are selected. (#13)
* Firefox: Update validation of shortcut keys to support newly allowed combinations starting with
  Firefox 63.0. (#12)
* Improvements to keyboard shortcut options alignment and positioning.

#### [2.0.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v2.0.0):
* Firefox: Add ability to customize shortcuts.
* Chrome: Fix logic to correctly disable tab wrapping for the first tab in the bar.

#### [1.3.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.3.0):
* Add logic for skipping over hidden tabs in Firefox. Avoids situation where the tab must be moved left/right multiple times to pass hidden tabs.

#### [1.2.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.2.0):
* Fix use of Alt+Shift+0/9 using the numeric keypad.
* Add variant of the Chrome version to allow use of number pad and work around Chrome's limitation of 4 keyboard commands per extension.

#### [1.1.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.1.0):
* Add option to disable tab wrapping at start/end of tab bar.

#### [1.0.0](https://github.com/jmmerz/move-tab-hotkeys/releases/tag/v1.0.0):
* Initial release.

