module.exports = function() {
    this.TypingStatus = {
        "IDLE" : 0,
        "TYPING" : 1,
        "PAUSED" : 2
    }
    var currentStatus = this.TypingStatus.IDLE
    this.start = async () => {
        console.log("started typing");
        currentStatus = this.TypingStatus.TYPING;
        // while (currentStatus == TypingStatus.TYPING) {
        //     var clicksThisMinute = Math.floor( Math.random() * (40 - 10) + 10 );
        //     console.log("clicking " + clicksThisMinute + " this minute");
        //     for (var j = 0; j<clicksThisMinute; j++) {
        //         // console.log("Pressing a key, where j: " + ja);
        //         // robot.typeString("a")
        //         // robot.keyTap("control");
        //         if (currentStatus == TypingStatus.IDLE) {
        //             break;
        //         }
        //         robot.typeString("a");
        //         await sleep(60000/clicksThisMinute);
        //     }
        // }
        // currentStatus = TypingStatus.IDLE;
        // console.log("stopped typing");
    }

    this.sleep = (ms) => {
        return new Promise(r => {
            setTimeout(r, ms);
        });
    }

    this.getCurrentStatus = () => {
        return currentStatus;
    }

    this.setCurrentStatus = (status) => {
        currentStatus = status;
    }
}


