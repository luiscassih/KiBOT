const electron = require("electron")
const {ipcRenderer} = electron

TypingStatus = {
    "IDLE" : 0,
    "TYPING" : 1,
    "PAUSED" : 2
}

$(document).ready(() => {
    var currentStatus = TypingStatus.IDLE
    let data = {
        action: "getStatus"
    }
    var setCircleProgress = true
    var circleHighestMinute = 0

    // Initializations
    $(".is-running").hide()

    // Getting status
    ipcRenderer.send("action", JSON.stringify(data))
    ipcRenderer.on("setStatus", (event, args) => {
        currentStatus = args["status"]
        minutes = args["minutes"]
        console.log("status set to " + currentStatus)

        switch(currentStatus) {
            case TypingStatus.TYPING : {
                if(setCircleProgress) {
                    circleHighestMinute = minutes
                    setCircleProgress = false
                }
                $("#statusBtnStop").prop("disabled", false)
                $("#statusBtnStart").html("PAUSE")
                $("#statusBtnStart").addClass("btn-success")
                $("#statusBtnStart").removeClass("btn-primary")
                updateCircleMinutes(minutes)
                $(".is-idle").slideUp(200, () => {
                    $(".is-running").slideDown(200)
                    
                })
                break
            }
            case TypingStatus.PAUSED : {
                $("#statusBtnStart").html("RESUME")
                $("#statusBtnStart").removeClass("btn-success")
                $("#statusBtnStart").addClass("btn-primary")
                break
            }
            case TypingStatus.IDLE : {
                $("#statusBtnStop").prop("disabled", true)
                $("#statusBtnStart").html("RUN")
                setCircleProgress = true;

                $(".is-running").slideUp(200, () => {
                    $(".is-idle").slideDown(200)
                })
                break
            }
        }
    })

    ipcRenderer.on("updateMinutes", (event, args) => {
        updateCircleMinutes(args)
    })

    $("#statusBtnStart").click(() => {
        minutesToSet = $("input[name=minutesToSet]:checked").val()
        if(isNaN(minutesToSet))
            minutesToSet = -1
        if (minutesToSet == 0) {
            let customMinutes = $("#customMinutesInput").val()
            if (!isNaN)
                customMinutes = -1
            minutesToSet = parseInt(customMinutes)
        }
        let data = {
            action: (currentStatus == TypingStatus.TYPING) ? "pause" : "start",
            minutes: minutesToSet
        }
        ipcRenderer.send("action", JSON.stringify(data))
        $(this).prop("disabled", true)
        $("#statusBtnStop").prop("disabled", false)
    });

    $("#statusBtnStop").click(() => {
        let data = {
            action: "stop"
        }
        ipcRenderer.send("action", JSON.stringify(data))
        $(this).prop("disabled", true)
        $("#statusBtnStart").prop("disabled", false)

    })


    // Minutes inputs
    $("#customMinutesInputContainer").hide()

    $("input[name=minutesToSet]").change(()=> {
        let minutes = $('input[name=minutesToSet]:checked').val()
        if (minutes == 0) {
            $("#customMinutesInputContainer").slideDown(200, () => {
                $("#customMinutesInput").focus()
            })
        } else {
            $("#customMinutesInputContainer").slideUp(200)
        }
    })

    function updateCircleMinutes(minutes) {
        if (!isNaN(minutes)) {
            let circlePercent
            if(minutes > 0) {
                circlePercent= minutes * 100 / circleHighestMinute
                circlePercent = parseInt(circlePercent)
                $("#circleMinutesLeftValue").html(minutes);
            } else if (minutes == -1) {
                circlePercent = 100
                $("#circleMinutesLeftValue").html("&infin;");
            }
            $("#circleProgressPercent").removeClass((index, css) => {
            return (css.match (/\bprogress-\S+/g) || []).join(' ');
            })
            $("#circleProgressPercent").addClass("progress-"+circlePercent)
        
        }
    }
});