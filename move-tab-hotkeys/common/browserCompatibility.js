/**
* These are browser-wide constants. There are actually multiple instances of
* each: one in the background script, and one in the options page. Changing a
* value at runtime will not pass information between those two areas.
*/

const IS_FIREFOX = (typeof browser !== 'undefined');
const IS_CHROME = ((typeof browser === 'undefined') && (typeof chrome !== 'undefined'));

const BROWSER = IS_FIREFOX ? browser : IS_CHROME ? chrome : null;

let OS = null;
let IS_OS_MAC = false;

function initPlatformInfo(platformInfo) {
    OS = platformInfo.os;
    IS_OS_MAC = (OS == 'mac');
}

if(IS_FIREFOX) {
    BROWSER.runtime.getPlatformInfo().then(initPlatformInfo);
} else if(IS_CHROME) {
    BROWSER.runtime.getPlatformInfo(initPlatformInfo);
} else {
    console.log('Unhandled browser, not getting platform info');
}
