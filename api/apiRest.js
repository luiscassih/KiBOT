module.exports.controller = function(app, api) {
    var robot = require("robotjs");

    app.get("/api/start", (req, res) => {
        res.send("Usage: /api/type/:minutes_to_type");
    });

    app.get("/api/start/:minutes", (req, res) => {
        switch (api.getCurrentStatus()) {
            case api.TypingStatus.TYPING:
                api.setCurrentStatus(api.TypingStatus.IDLE)
                res.send("Stopped.");
                break;    
            case api.TypingStatus.IDLE:
                if (!isNaN(req.params.minutes) && parseInt(req.params.minutes) > 0){
                    // currentStatus = TypingStatus.TYPING;
                    // startTyping(parseInt(req.params.minutes));
                    api.start()
                    // res.send("Ok, setting to " + parseInt(req.params.minutes) + " minutes.");
                    res.send("Started typing.");
                } else {
                    res.send("number??");
                }
                break;
            case api.TypingStatus.PAUSED:
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
        api.setCurrentStatus(TypingStatus.IDLE)
        res.send("Stopped.");
    });

    app.get("/api/pause", (req, res) => {
        api.setCurrentStatus(TypingStatus.PAUSED)
        res.send("Paused. To resume go to /api/resume.");
    });

    app.get("/api/resume", (req, res) => {
        switch (api.getCurrentStatus()) {
            case api.TypingStatus.IDLE:
                res.send("It's already stopped. Go to /api/type to start.");
                break;
            case api.TypingStatus.TYPING:
                res.send("It's already typing. Go to /api/pause or /api/stop.");
                break;
            case api.TypingStatus.PAUSED:
                api.setCurrentStatus(TypingStatus.TYPING)
                res.send("Resumed.");
        }
    });

    app.get("/api/status", function(req, res) {
        var status = {
            status: api.getCurrentStatus(),
            statusName: Object.keys(api.TypingStatus).find(k => api.TypingStatus[k] === api.getCurrentStatus())
        }
        res.set("content-type", "application/json");
        res.send(status);
    });

    
}