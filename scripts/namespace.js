// namespace.js

// this file sets up an enclosure for our application so we don't
// pollute the global scope
var app = app || {};
window['app'] = app;

// namespaces
app.assets = app.assets || {};
app.util = app.util || {};
app.entity = app.entity || {};
app.game = app.game || {};