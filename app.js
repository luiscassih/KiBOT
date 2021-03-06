var express = require("express");
var app = express();
var url = require("url");
var path = require("path");
var fs = require("fs")
const electron = require('electron');
const {ipcMain} = require('electron');
const pug = require("pug");
// var robot = require("robotjs");

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

// Initialize custom titles savefile
var customTitlesPath = '/tmp/kibot-customtitles.txt';
var customTitles = ["UserManager.java | IntelliJ"]
fs.exists(customTitlesPath, (exists) => {
    if (exists)
        customTitles = JSON.parse(fs.readFileSync(customTitlesPath).toString().split("\n"))
    else {
        saveTitlesToFile(customTitles)
        console.log("Successfully initialized /tmp/customtitles.txt ")   
    }
})

function saveTitlesToFile(titles) {
    fs.writeFile(customTitlesPath, JSON.stringify(titles) , { flag: "w"}, (err) => {
        if (err) throw err         
    })
}

// Loading API controllers
var apiCore = require("./api/apiCore");
var that = {
    sendMinutesLeft: sendMinutesLeft,
    sendStatusStopped: sendStatusStopped
}
var api = new apiCore(that);

var apiRest = require("./api/apiRest");
var index = require("./controllers/index");
apiRest.controller(app, api);
index.controller(app);


// Starting server - Disabled for the moment
// app.listen(app.get("port"), function(){
//     console.log("Server listen on port " + app.get("port"));
// });



// Starting Electron
var win 
electron.app.on("ready", function() {
    let windowOptions = {
        width: 840,
        minWidth: 480,
        height: 730,
        center: true
        // titleBarStyle: "hidden"
    }
    win = new BrowserWindow(windowOptions);
    win.loadURL(url.format({
        pathname: path.join(__dirname, "electron/index.pug"),
        protocol: "file:",
        slashes: true
    }));
    // win.webContents.openDevTools();
});

electron.app.on('window-all-closed', () => {
    electron.app.quit()
})

// ipc listeners
ipcMain.on("action", (event, data) => {
    switch(data["action"]) {
        case "start" : {
            if (api.getCurrentStatus() != api.TypingStatus.TYPING) {
                let minutes = data["minutes"]
                let key = data["keyToPress"]
                customTitles = data["titles"]
                saveTitlesToFile(customTitles)
                // So let's begin
                api.start(minutes, key, true)
                setTimeout(() => {
                    api.setAutoClickEnabled(data["autoclick"])
                }, 1000)

                event.sender.send("setStatus", {status: api.getCurrentStatus(), minutes: api.getMinutesLeft()})
            } else console.log("Already started")
            break
        }
        case "pause" : {
            if (api.getCurrentStatus() == api.TypingStatus.TYPING) {
                console.log("Paused")
                api.setCurrentStatus(api.TypingStatus.PAUSED)
                event.sender.send("setStatus", {status: api.getCurrentStatus(), minutes: api.getMinutesLeft()})
            } else console.log("Needs to be running to pause")
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
        case "getCustomTitles" : {
            let data = {
                titles: customTitles
            }
            event.sender.send("setCustomTitles", data)
            break
        }

        case "setAutoClickEnabled" : {
            api.setAutoClickEnabled(data["autoclick"])
            break
        }
    }
})

function sendMinutesLeft(minutes) {
    win.webContents.send("updateMinutes", minutes)
}

function sendStatusStopped() {
    win.webContents.send("setStatus", {status: api.TypingStatus.IDLE})
}

function setWindowTitle(title) {
    win.setTitle(title)
}