const IS_FIREFOX = (typeof browser !== 'undefined');
const IS_CHROME = (typeof chrome !== 'undefined');

const BROWSER = IS_FIREFOX ? browser : IS_CHROME ? chrome : null;
