var apiType = require("./api/type");
var robot = require("robotjs");
var index = require("./controllers/index");

module.exports.loadControllers = function(app) {
    apiType.controller(app);
    index.controller(app);
}