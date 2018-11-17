
function onChangeOption(e) {
    e.preventDefault();

    var optionName = e.currentTarget.id;
    var val = {};
    val[optionName] = e.currentTarget.checked;
    BROWSER.storage.local.set(val);
}

function initOptionsFields() {

    function setOptionValue(result) {
        if (result != null) {
            Object.keys(result).forEach( key => {
                var optionField = document.querySelector('#' + key);
                if(optionField != null) {
                    optionField.checked = result[key];
                    if(DEBUG) console.log(`set ${key} to ${result[key]}`);
                }
            });
        }
    }

    function onError(error) { console.log(`Error: ${error}`); }

   // use storage.local.get(null) below to get _all_ options
    if (IS_FIREFOX) {
        BROWSER.storage.local.get(null).then(setOptionValue, onError);
    } else if (IS_CHROME) {
        BROWSER.storage.local.get(null, setOptionValue);
    } // Else: Not handled

}

document.addEventListener("DOMContentLoaded", initOptionsFields);

/**
 * Define a prototype method to add an eventListener to each node in a NodeList.
 * This is used below to handle changes to elements of class autoChangeOption.
 */
NodeList.prototype.addEventListener = function(event, func) {
    this.forEach(function(content, item) {
       content.addEventListener(event, func);
    });
}

// Add option change listener to all elements of class autoChangeOption:
document.querySelectorAll('form#optionsForm .autoChangeOption').addEventListener("change", onChangeOption);


/* ============================================================
 * For Firefox, code for doing command shortcut customization
 * ============================================================ */
if(IS_FIREFOX) {

    // Shortcut options should only be displayed in Firefox.
    document.getElementById('shortcutOptions').classList.add('browser-firefox');

    /**
     * Shortcut key validation:
     * See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#Key_combinations
     *
     * These regexes are derived from the error message previously logged (pre-FF 63) to the console
     * as a result of sending an invalid key to commands.update():
     * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *     Error: Type error for parameter detail (
     *         Error processing shortcut: Value "Alt+Shift+<"
     *         must either:
     *             match the pattern /^\s*(Alt|Ctrl|Command|MacCtrl)\s*\+\s*(Shift\s*\+\s*)?([A-Z0-9]|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right)\s*$/,
     *             match the pattern /^\s*((Alt|Ctrl|Command|MacCtrl)\s*\+\s*)?(Shift\s*\+\s*)?(F[1-9]|F1[0-2])\s*$/,
     *             or match the pattern /^(MediaNextTrack|MediaPlayPause|MediaPrevTrack|MediaStop)$/
     *     ) for commands.update.
     * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
     *
     * Starting with FF 63, shortcut keys were updated to allow unused primary modifier keys as
     * secondary modifiers in addition to 'Shift'
     *      See: https://bugzilla.mozilla.org/show_bug.cgi?id=1416348
     *
     * The patterns ending with _FF63_PLUS are adapted from the originals above to accept the updated
     * patterns. They _do_not_ validate that the same modifier is not used as primary /and/ secondary.
     * That is done by the pattern INVALID_SHORTCUT_PATTERN defined below. It will be considered
     * _always_ incorrect to have the same modifier key appear twice for both the primaryModifier and
     * secondaryModifier.
     *
     * NOTE: This comment also applies to the definition of isValidCommandShortcut().
     */
    var VALID_SHORTCUT_PATTERN_1 =           /^\s*(Alt|Ctrl|Command|MacCtrl)\s*\+\s*(Shift\s*\+\s*)?([A-Z0-9]|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right)\s*$/;
    var VALID_SHORTCUT_PATTERN_1_FF63_PLUS = /^\s*(Alt|Ctrl|Command|MacCtrl)\s*\+\s*((Alt|Ctrl|Command|MacCtrl|Shift)\s*\+\s*)?([A-Z0-9]|Comma|Period|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right)\s*$/;
    var VALID_SHORTCUT_PATTERN_2 =           /^\s*((Alt|Ctrl|Command|MacCtrl)\s*\+\s*)?(Shift\s*\+\s*)?(F[1-9]|F1[0-2])\s*$/;
    var VALID_SHORTCUT_PATTERN_2_FF63_PLUS = /^\s*((Alt|Ctrl|Command|MacCtrl)\s*\+\s*)?((Alt|Ctrl|Command|MacCtrl|Shift)\s*\+\s*)?(F[1-9]|F1[0-2])\s*$/;
    var VALID_SHORTCUT_PATTERN_3 = /^(MediaNextTrack|MediaPlayPause|MediaPrevTrack|MediaStop)$/;
    var VALID_SHORTCUT_PATTERNS = [VALID_SHORTCUT_PATTERN_1,
                                   VALID_SHORTCUT_PATTERN_2,
                                   VALID_SHORTCUT_PATTERN_3
                                  ];
    var VALID_SHORTCUT_PATTERNS_FF_63_PLUS = [VALID_SHORTCUT_PATTERN_1_FF63_PLUS,
                                              VALID_SHORTCUT_PATTERN_2_FF63_PLUS,
                                              VALID_SHORTCUT_PATTERN_3
                                             ];
    var CONTROL_KEY_PATTERN = /^.*(Alt|Ctrl|Control|Command|MacCtrl|Shift|OS.*).*/;
    var INVALID_SHORTCUT_PATTERN = /.*(Alt|Ctrl|Control|Command|MacCtrl|Shift).*\1/ig;

    // Map with desired order of the hotkeys in Options page
    var commandName2OrderIndex = new Map();
    // Standard keys
    commandName2OrderIndex.set('move-tab-left', 1);
    commandName2OrderIndex.set('move-tab-right', 2);
    commandName2OrderIndex.set('move-tab-first-numbers-row', 3);
    commandName2OrderIndex.set('move-tab-last-numbers-row', 4);
    var MAX_PRIMARY_SHORTCUT_INDEX = 4;
    // Extra keys for alternates
    commandName2OrderIndex.set('move-tab-first-numpad-numlock-on', 5);
    commandName2OrderIndex.set('move-tab-first-numpad-numlock-off', 6);
    commandName2OrderIndex.set('move-tab-last-numpad-numlock-on', 7);
    commandName2OrderIndex.set('move-tab-last-numpad-numlock-off', 8);

    /**
     * Classes used for shortcuts.
     */
    const CLASS_OPTIONS_ROW = "options-row";
    const CLASS_OPTIONS_LEFT = 'options-left';
    const CLASS_OPTIONS_RIGHT = 'options-right';
    const CLASS_SHORTCUT_KEY = 'shortcutKey';
    const CLASS_SHORTCUT_UNSET = 'unset';
    const CLASS_SHORTCUT_VALID = 'valid';
    const CLASS_SHORTCUT_INVALID = 'invalid';
    const CLASS_EXAMPLE_TEXT = 'example-text';
    const CLASS_TOOLTIP_TEXT = 'tooltip-text';
    const CLASS_TOOLTIP_TOP = 'tooltip-top';
    const CLASS_HAS_TOOLTIP = 'has-tooltip';

    /**
     * Utility method to sort commands according to the commandName2OrderIndex defined above.
     */
    function sortCommands(allCommands) {
        allCommands.sort(function(a, b) {
            return commandName2OrderIndex.get(a.name)-commandName2OrderIndex.get(b.name);
        });
    }

    /**
     * Create and populate the fields for each shortcut in the command.
     */
    async function initCustomShortcutFields() {

        let primaryCustomShortcutsDiv = document.getElementById('custom_shortcuts_primary');
        let secondaryCustomShortcutsDiv = document.getElementById('custom_shortcuts_secondary');

        let allCommands = await BROWSER.commands.getAll();
        sortCommands(allCommands);

        for(var command of allCommands) {
            let commandFieldId = command.name + '_input';
            let isPrimarySet = (commandName2OrderIndex.get(command.name) <= MAX_PRIMARY_SHORTCUT_INDEX);

            let commandDiv = document.createElement('div');
            commandDiv.id = command.name + '_form';
            commandDiv.classList.add(CLASS_OPTIONS_ROW);

            // Create label
            let optionsLeftDiv = document.createElement('div');
            optionsLeftDiv.classList.add(CLASS_OPTIONS_LEFT);
            let label = document.createElement('label');
            label.setAttribute('for', commandFieldId);
            let commandDescription = command.description;
            let commandExampleText = null;
            if(!isPrimarySet) {
                commandExampleText = commandDescription.match(/.*( \(.*\)$)/)[1].trim();
                // Strip the leading and trailing parenthesis from the example text
                commandExampleText = commandExampleText.substring(1,commandExampleText.length-1);
                commandDescription = commandDescription.match(/(.*) \(.*\)$/)[1];
            }
            label.appendChild(document.createTextNode(commandDescription + ':'));
            optionsLeftDiv.appendChild(label);

            // Create <input>
            let optionsRightDiv = document.createElement('div');
            optionsRightDiv.classList.add(CLASS_OPTIONS_RIGHT);

            let inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = commandFieldId;
            inputField.classList.add(CLASS_SHORTCUT_KEY, CLASS_SHORTCUT_UNSET);
            inputField.commandName = command.name;
            inputField.undoStack = new Array();
            inputField.currentKeyValue = command.shortcut;
            setInputFieldValue(inputField, command.shortcut);
            optionsRightDiv.appendChild(inputField);

            // Circle to indicate validity of specified keyboard shortcut
            let inputValidationStatusDivUnset = document.createElement('div');
            inputValidationStatusDivUnset.classList.add('input-validation-status');
            optionsRightDiv.appendChild(inputValidationStatusDivUnset);

            // Create update button
            let updateShortcutButton = document.createElement('button');
            updateShortcutButton.id = command.name + '_update';
            updateShortcutButton.appendChild(document.createTextNode('Update'));
            updateShortcutButton.inputFieldId = commandFieldId;
            updateShortcutButton.addEventListener('click', handleUpdateButtonClick);
            optionsRightDiv.appendChild(updateShortcutButton);

            // Create undo button (revert to pre-edit state)
            let undoShortcutButton = document.createElement('button');
            undoShortcutButton.id = command.name + '_undo';
            undoShortcutButton.appendChild(document.createTextNode('Undo'));
            undoShortcutButton.inputFieldId = commandFieldId;
            undoShortcutButton.addEventListener('click', handleUndoButtonClick);
            optionsRightDiv.appendChild(undoShortcutButton);

            // Create reset button (revert to addon defaults)
            let resetShortcutButton = document.createElement('button');
            resetShortcutButton.id = command.name + '_reset';
            resetShortcutButton.appendChild(document.createTextNode('Restore Default'));
            resetShortcutButton.inputFieldId = commandFieldId;
            resetShortcutButton.addEventListener('click', handleRestoreDefaultButtonClick);
            optionsRightDiv.appendChild(resetShortcutButton);

            // Add example text if present
            if(commandExampleText) {
                let toolTipText = document.createElement('span');
                toolTipText.classList.add(CLASS_EXAMPLE_TEXT);
                toolTipText.classList.add(CLASS_TOOLTIP_TEXT);
                toolTipText.classList.add(CLASS_TOOLTIP_TOP);
                toolTipText.appendChild(document.createTextNode(commandExampleText));
                label.classList.add(CLASS_HAS_TOOLTIP);
                label.appendChild(toolTipText);
            }

            commandDiv.appendChild(optionsLeftDiv);
            commandDiv.appendChild(optionsRightDiv);

            let customShortcutsDiv = isPrimarySet
                                        ? primaryCustomShortcutsDiv
                                        : secondaryCustomShortcutsDiv;
            customShortcutsDiv.appendChild(commandDiv);

            inputField.addEventListener('keydown', keydownShortcutField);
            inputField.addEventListener('keyup', keyupShortcutField);
        }
    }

    /**
     * Set the value of the inputField, adding it to the undoStack if it's a valid command shortcut,
     * and updating the class of the field to unset, valid or invalid depending on the status of the
     * key.
     */
    function setInputFieldValue(inputField, keyString) {
        inputField.value = keyString;
        if(inputField.currentKeyValue == keyString) {
            setShortcutKeyInputFieldUnset(inputField);
            addKeyToUndoStack(inputField, keyString);
        } else if(isValidCommandShortcut(keyString)) {
            setShortcutKeyInputFieldValid(inputField);
            addKeyToUndoStack(inputField, keyString);
        } else {
            setShortcutKeyInputFieldInvalid(inputField);
            // Don't add invalid commands to undoStack
        }
    }

    function setShortcutKeyInputFieldUnset(shortcutInputField) {
        shortcutInputField.classList.replace(CLASS_SHORTCUT_VALID, CLASS_SHORTCUT_UNSET);
        shortcutInputField.classList.replace(CLASS_SHORTCUT_INVALID, CLASS_SHORTCUT_UNSET);
    }

    function setShortcutKeyInputFieldValid(shortcutInputField) {
        shortcutInputField.classList.replace(CLASS_SHORTCUT_INVALID, CLASS_SHORTCUT_VALID);
        shortcutInputField.classList.replace(CLASS_SHORTCUT_UNSET, CLASS_SHORTCUT_VALID);
    }

    function setShortcutKeyInputFieldInvalid(shortcutInputField) {
        shortcutInputField.classList.replace(CLASS_SHORTCUT_UNSET, CLASS_SHORTCUT_INVALID);
        shortcutInputField.classList.replace(CLASS_SHORTCUT_VALID, CLASS_SHORTCUT_INVALID);
    }

    /**
     * Add a key to the undoStack, preventing the same key to be added twice in a row, but allowing
     * duplicates otherwise.
     */
    function addKeyToUndoStack(inputField, keyString) {
        if(inputField.undoStack.length == 0 || inputField.undoStack[inputField.undoStack.length-1] != keyString) {
            inputField.undoStack.push(keyString);
            if(DEBUG) console.log('Updated undoStack: ' + undoStackToString(inputField.undoStack));
        } else {
            if(DEBUG) console.log('Key "' + keyString + '" is already on top of undoStack. Not changing: ' + undoStackToString(inputField.undoStack));
        }
    }

    /**
     * Handler for a keydown event on a shortcut input field.
     *
     * Builds the key combination string in realtime, placing it into the field for the user to see.
     */
    function keydownShortcutField(event) {

        event.preventDefault();

        // Don't re-process repeated events
        if(event.repeat) return;

        if(DEBUG) console.log(event);
        let primaryModifier = '';
        let secondaryModifier = '';
        let key = ''
        let keyString = '';

        // Build the key combination in correct order to match one of the following:
        //    * PrimaryModifier+Key
        //    * PrimaryModifier+SecondaryModifier+Key
        //    * Function Key
        //    * Media Key

        if(event.ctrlKey) {
            // For Mac OS, interpret "Control" as "MacCtrl"
            keyString += IS_OS_MAC ? 'MacCtrl' : 'Ctrl';
        }
        if(event.altKey) {
            if(keyString.length > 0) keyString += '+';
            keyString += 'Alt';
        }
        if(event.metaKey && IS_OS_MAC) {
            // For Mac OS interpret the Meta key (OSLeft/OSRight) as "Command"
            if(keyString.length > 0) keyString += '+';
            keyString += 'Command';
        }

        // secondary modifier (optional). If supplied, this must be either "Shift" or (for Firefox = 63) any one of "Ctrl", "Alt", "Command" and "MacCtrl", which has not been used as the main modifier.
        if(event.shiftKey) {
            if(keyString.length > 0) keyString += '+';
            keyString += 'Shift';
        }

        if(!CONTROL_KEY_PATTERN.test(event.code)) {
            if(keyString.length > 0) keyString += '+';
            keyString += getKeyNameFromKeyEvent(event);
            event.target.hasTerminalKey = true;
        } else {
            event.target.hasTerminalKey = false;
        }

        setInputFieldValue(event.target, keyString);
        event.target.valueIsValid = isValidCommandShortcut(keyString);
        if(DEBUG) console.log('keydown: isValid? ' + event.target.valueIsValid);
    }

    /**
     * Handler for a keyup event on a shortcut input field.
     *
     * If there is no terminal key, reverts to the last entered key combination.
     */
    function keyupShortcutField(event) {
        event.preventDefault();
        if(!event.target.hasTerminalKey) {
            // Revert to last good value, but don't pop it since this is a key failure, not an undo
            // Also don't add it to the stack
            setInputFieldValue(event.target, event.target.undoStack.pop());
        }
    }

    /**
     * See comment above starting with "Shortcut key validation:".
     */
    function isValidCommandShortcut(keyString) {
        let validShortcutPatterns = IS_FF_63_PLUS ? VALID_SHORTCUT_PATTERNS_FF_63_PLUS : VALID_SHORTCUT_PATTERNS;
        // INVALID_SHORTCUT_PATTERN checks for double-instances of control keys that are only
        // allowed once. The way we build the keyString should prevent this, but this is a
        // double-check.
        if(!INVALID_SHORTCUT_PATTERN.test(keyString)) {
            for(let regex of validShortcutPatterns) {
                if(regex.test(keyString)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Translates a keyEvent to a keyName compatible with command shortcut key combinations.
     */
    function getKeyNameFromKeyEvent(keyEvent) {
        let keyCode = keyEvent.code;
        if(keyCode.length == 1) {
            return keyCode.toUpperCase();
        }
        if(keyCode.startsWith('Arrow')) {
            return keyCode.substring(5);
        }
        if(keyCode.startsWith('Key')) {
            return keyCode.substring(3);
        }
        if(keyCode.startsWith('Digit')) {
            return keyCode.substring(5);
        }
        if(keyCode.startsWith('Numpad')) {
            return keyCode.substring(6);
        }
        return keyCode;
    }

    /**
     * Handler for a click on the Update button.
     *
     * Attempts to update the shortcut to use the key combination currently in the input field.
     * Logs to console on failure.
     */
    function handleUpdateButtonClick(event) {
        event.preventDefault();

        let inputField = document.getElementById(event.target.inputFieldId);
        if(DEBUG) console.log('Update: command "' + event.target.inputFieldId + '" to key combo: "' + inputField.value + '"');

        BROWSER.commands.update({
            name: inputField.commandName,
            shortcut: inputField.value
        }).then(function() {
            setShortcutKeyInputFieldUnset(inputField);
            inputField.currentKeyValue = inputField.value;
        }).catch(function(error) {
            setShortcutKeyInputFieldInvalid(inputField);
            console.log(error);
        });
    }

    /**
     * Handler for a click on the Undo button.
     *
     * Resets the input field to the most recently entered value on the undoStack.
     */
    function handleUndoButtonClick(event) {
        event.preventDefault();

        let inputField = document.getElementById(event.target.inputFieldId);
        if(DEBUG) console.log('Undo: command ' + event.target.inputFieldId + ' ' + undoStackToString(inputField.undoStack));

        let origValue = inputField.value;
        let poppedValue = null;
        if(inputField.undoStack.length > 0) {
            poppedValue = inputField.undoStack.pop();
            // Pop the stack, and don't re-add it
            while(poppedValue == origValue && inputField.undoStack.length > 0) {
                poppedValue = inputField.undoStack.pop();
            }
            setInputFieldValue(inputField, poppedValue);
        }
    }

    function undoStackToString(undoStack) {
        return 'stack=(size: ' + undoStack.length + ', contents=[' + undoStack + '])'
    }

    /**
     * Handler for the 'Reset to Default' button.
     *
     * Resets the command to it's default value and resets the input field to hold that value.
     */
    function handleRestoreDefaultButtonClick(event) {
        event.preventDefault();

        if(DEBUG) console.log('Restore default: ' + event.target.inputFieldId);

        let inputField = document.getElementById(event.target.inputFieldId);
        BROWSER.commands.reset(inputField.commandName).then(function() {
            BROWSER.commands.getAll().then(function(allCommands) {
                for(var command of allCommands) {
                    if(command.name == inputField.commandName) {
                        inputField.currentKeyValue = command.shortcut;
                        setInputFieldValue(inputField, command.shortcut);
                    }
                }
            })
        });
    }

    /**
     * Sets up handlers to show and hide the Shortcut Help Text.
     */
    function initShortcutHelpTextHandlers() {
        /**
         * Listener to toggle the visibility of the shortcut help text when clicking the question
         * mark icon.
         */
        document.getElementById('shortcutHelpTextToggle').addEventListener('click', function(event) {
            let helpText = document.getElementById('shortcutHelpTextDiv');
            helpText.classList.toggle('shortcutHelpContainerVisible');
        });

        /**
         * Listener to dismiss the shortcut help text when <Escape> is pressed on the keyboard.
         */
        document.addEventListener('keydown', function(event) {
            if(event.code == 'Escape') {
                let helpText = document.getElementById('shortcutHelpTextDiv');
                helpText.classList.remove('shortcutHelpContainerVisible');
            }
        });

        /**
         * Listener to dismiss the shortcut help text when a click occurs outside of the shortcut
         * help text.
         */
        document.addEventListener('click', function(event) {
            // Don't do this if we are in div.shortcutHelpTextDiv or one of it's descendants
            if(!event.target.closest('#shortcutHelpTextDiv') && !event.target.closest('#shortcutHelpTextToggle')) {
                let helpText = document.getElementById('shortcutHelpTextDiv');
                helpText.classList.remove('shortcutHelpContainerVisible');
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initCustomShortcutFields);
    document.addEventListener("DOMContentLoaded", initShortcutHelpTextHandlers);
}
