/**
* These are browser-wide constants. There are actually multiple instances of
* each: one in the background script, and one in the options page. Changing a
* value at runtime will not pass information between those two areas.
*/

const IS_FIREFOX = (typeof browser !== 'undefined');
const IS_CHROME = ((typeof browser === 'undefined') && (typeof chrome !== 'undefined'));

const BROWSER = IS_FIREFOX ? browser : IS_CHROME ? chrome : null;
