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

/**
 * Define a prototype method to add an eventListener to each node in a NodeList.
 */
NodeList.prototype.addEventListener = function(event, func) {
    this.forEach(function(content, item) {
       content.addEventListener(event, func);
    });
}

document.addEventListener("DOMContentLoaded", initOptionsFields);
document.querySelectorAll('form#optionsForm .option').addEventListener("change", onChangeOption);
