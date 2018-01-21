var express = require("express");
var app = express();
var url = require("url");
var path = require("path");
const electron = require('electron');
const pug = require("pug");
const locals = {
    version: "0.2.0"
};
const electronPug = require("electron-pug")({pretty: true, locals});
const BrowserWindow = electron.BrowserWindow;
//var robot = require("robotjs");



// App config
var webServerPort = 3000;
process.argv.forEach((argv, i ) => {
    if (argv == "--port" && !isNaN(process.argv[i+1])) {
        webServerPort =  process.argv[i+1];
    }
});
app.set("port", webServerPort);
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



// Starting Electron
let win;
function createWindow() {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, "electron/index.pug"),
        protocol: "file:",
        slashes: true
    }));
}
electron.app.on("ready", createWindow);