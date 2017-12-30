module.exports.controller = function(app) {
    var robot = require("robotjs");
    var TypingStatus = {
        "IDLE" : 0,
        "TYPING" : 1,
        "PAUSED" : 2
    }
    var currentStatus = TypingStatus.IDLE;
    console.log("type.js controller loaded");

    app.get("/api/start", (req, res) => {
        res.send("Usage: /api/type/:minutes_to_type");
    });

    app.get("/api/start/:minutes", (req, res) => {
        switch (currentStatus) {
            case TypingStatus.TYPING:
                currentStatus = TypingStatus.IDLE;
                res.send("Stopped.");
                break;    
            case TypingStatus.IDLE:
                if (!isNaN(req.params.minutes) && parseInt(req.params.minutes) > 0){
                    // currentStatus = TypingStatus.TYPING;
                    // startTyping(parseInt(req.params.minutes));
                    startTyping();
                    // res.send("Ok, setting to " + parseInt(req.params.minutes) + " minutes.");
                    res.send("Started typing.");
                } else {
                    res.send("number??");
                }
                break;
            case TypingStatus.PAUSED:
                res.send("It's paused.");
                break;
            default:
                break;
        }
        // test();
        // currentStatus = TypingStatus.IDLE;
        // res.send("Typing done.");
        // robot.keyTap("tab", "command");
        // robot.keyToggle("command", "up");
        // robot.keyTap("enter");
        //robot.keyToggle("command", "up","alt");
        // res.send("tying sent");
    });

    app.get("/api/test", (req, res) => {
        test();
        res.send("ready;");
    });
    
    app.get("/api/stop", (req, res) => {
        currentStatus = TypingStatus.IDLE;
        res.send("Stopped.");
    });

    app.get("/api/pause", (req, res) => {
        currentStatus = TypingStatus.PAUSED;
        res.send("Paused. To resume go to /api/resume.");
    });

    app.get("/api/resume", (req, res) => {
        switch (currentStatus) {
            case TypingStatus.IDLE:
                res.send("It's already stopped. Go to /api/type to start.");
                break;
            case TypingStatus.TYPING:
                res.send("It's already typing. Go to /api/pause or /api/stop.");
                break;
            case TypingStatus.PAUSED:
                currentStatus = TypingStatus.TYPING;
                res.send("Resumed.");
        }
    });

    app.get("/api/status", function(req, res) {
        var status = {
            status: currentStatus,
            statusName: Object.keys(TypingStatus).find(k => TypingStatus[k] === currentStatus)
        }
        res.set("content-type", "application/json");
        res.send(status);
    });

    async function startTyping() {
        console.log("started typing");
        currentStatus = TypingStatus.TYPING;
        while (currentStatus == TypingStatus.TYPING) {
            var clicksThisMinute = Math.floor( Math.random() * (40 - 10) + 10 );
            console.log("clicking " + clicksThisMinute + " this minute");
            for (var j = 0; j<clicksThisMinute; j++) {
                // console.log("Pressing a key, where j: " + ja);
                // robot.typeString("a")
                // robot.keyTap("control");
                if (currentStatus == TypingStatus.IDLE) {
                    break;
                }
                robot.typeString("a");
                await sleep(60000/clicksThisMinute);
            }
        }
        currentStatus = TypingStatus.IDLE;
        console.log("stopped typing");
    }

    function sleep(ms) {
        return new Promise(r => {
            setTimeout(r, ms);
        });
    }
}