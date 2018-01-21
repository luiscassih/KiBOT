var express = require("express");
var app = express();
var url = require("url");
var path = require("path");
const electron = require('electron');
const {ipcMain} = require('electron');
const pug = require("pug");
var robot = require("robotjs");

const locals = {
    version: "0.2.0"
};
const electronPug = require("electron-pug")({pretty: true, locals});
const BrowserWindow = electron.BrowserWindow;



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
var apiCore = require("./api/apiCore");
var api = new apiCore();
var apiRest = require("./api/apiRest");
var index = require("./controllers/index");
apiRest.controller(app, api);
index.controller(app);


// Starting server
app.listen(app.get("port"), function(){
    console.log("Server listen on port " + app.get("port"));
});



// Starting Electron
let win;
function createWindow() {
    var windowOptions = {
        width: 840,
        minWidth: 480,
        height: 730,
        title: "KiBOT"
      }
    win = new BrowserWindow(windowOptions);
    win.loadURL(url.format({
        pathname: path.join(__dirname, "electron/index.pug"),
        protocol: "file:",
        slashes: true
    }));
}
electron.app.on("ready", createWindow);

// ipc listeners
ipcMain.on("action", (event, args) => {
    var data = JSON.parse(args)
    switch(data["action"]) {
        case "start" : {
            if (api.getCurrentStatus() != api.TypingStatus.TYPING) {
                api.start()
                event.sender.send("setStatus", {status: api.getCurrentStatus()})
            }  else console.log("Already started")
            break
        }
        case "stop" : { 
            api.setCurrentStatus(api.TypingStatus.IDLE)
            event.sender.send("setStatus", {status: api.getCurrentStatus()})
            break
        }
        case "getStatus" : {
            let data = {
                status: api.getCurrentStatus()
            }
            event.sender.send("setStatus", data)
            break
        }
    }
})