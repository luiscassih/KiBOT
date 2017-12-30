var express = require("express");
var app = express();

//var robot = require("robotjs");



// App config
app.set("port", process.argv[2] || 3000);
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static("public"));


// Loading API controllers
var controllers = require("./route");
controllers.loadControllers(app);


// Starting server
app.listen(app.get("port"), function(){
    console.log("Server listen on port " + app.get("port"));
});