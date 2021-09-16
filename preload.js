// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    for (const type of ['chrome', 'node', 'electron']) {
        console.log(process.versions[type]);
    }
});

const path = require('path');
process.env.NODE_PATH = path.join(__dirname, "node_modules", "ddb", "node_modules");
require("module").Module._initPaths();

window.DDB = require('./vendor/ddb');
console.log("DDB Library Version: " + DDB.getVersion());

window.APPINFO = require('./libs/appInfo');
window.MFS = require('./libs/mfs');

require('./vendor/CommonUI/dynamic/electron')(window);