module.exports = function(that) {
    var robot = require("robotjs");
    this.TypingStatus = {
        "IDLE" : 0,
        "TYPING" : 1,
        "PAUSED" : 2
    }
    var currentStatus = this.TypingStatus.IDLE
    var minutesLeft = 0
    var feedback = false
    var keyToPress = "a"
    var autoClickEnabled = false

    this.start = async (minutes, key,  feedback) => {
        console.log("started typing for " + minutes + " minutes with key: " + key.toLowerCase());

        if (!isNaN(minutes)) {
            if(minutes == -1) 
                minutesLeft = -1
            else if(minutes !=0)
                minutesLeft = ++minutes
        }
        keyToPress = key

        currentStatus = this.TypingStatus.TYPING;
        while (currentStatus == this.TypingStatus.TYPING) {
            if (minutesLeft != -1) {
                minutesLeft--
            } 

            // Send the minutes left to update the progress circle
            if (that != undefined && that.sendMinutesLeft != undefined && minutesLeft != -1)
                that.sendMinutesLeft(minutesLeft)

            var keysThisMinute = Math.floor( Math.random() * (40 - 10) + 10 );
            var clickedThisMinute = 0
            console.log("typing " + keysThisMinute + " this minute");
            for (var j = 0; j<keysThisMinute; j++) {
                if (currentStatus != this.TypingStatus.TYPING || minutesLeft == 0) {
                    if(currentStatus == this.TypingStatus.PAUSED && minutesLeft != 0)
                        minutesLeft++
                    break;
                }

                this.pressKey()
                if (autoClickEnabled &&  Math.floor(Math.random() * 2) == 1) {
                    clickedThisMinute++
                    robot.mouseClick()
                }

                /* We still have a bug with this sleep, if the user pause and resume several times
                in a really short lapse of time while this is sleeping it will cause to re-write the
                status and have multiple instances of typing, so it will type really fast
                */
                await this.sleep(60000/keysThisMinute);
            }
            console.log("clicked " + clickedThisMinute + " this minute")
            if (minutesLeft == 0) {
                currentStatus = this.TypingStatus.IDLE;
                that.sendStatusStopped()
            }
        }
        console.log("stopped typing");
    }

    this.pressKey = () => {
        switch (keyToPress) {
            case "control":
            case "command":
            case "alt":
                robot.keyTap(keyToPress)
                break
            default:
                robot.typeString(keyToPress)
        }
    }

    this.sleep = (ms) => {
        return new Promise(r => {
            setTimeout(r, ms)
        })
    }

    this.getCurrentStatus = () => {
        return currentStatus
    }

    this.setCurrentStatus = (status) => {
        currentStatus = status
    }

    this.getMinutesLeft = () => {
        return minutesLeft
    }

    this.setAutoClickEnabled = (enabled) => {
        autoClickEnabled = enabled
        console.log("Autoclick enabled: " + autoClickEnabled)
    }
}