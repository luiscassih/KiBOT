const electron = require("electron")
const {ipcRenderer} = electron

TypingStatus = {
    "IDLE" : 0,
    "TYPING" : 1,
    "PAUSED" : 2
}

$(document).ready(() => {
    var currentStatus = TypingStatus.IDLE
    var setCircleProgress = true
    var circleHighestMinute = 0
    var customTitles = []
    var currentTitle = "KiBOTXD"
    var autoClickEnabled = false

    // Initializations
    $(".is-running").hide()
    $("#customMinutesInputContainer").hide()
    $("#stringToPress").hide()
    $("#appVersion").html(" ver " + electron.remote.app.getVersion())
    randomizeTitles()
    

    // Getting status
    ipcRenderer.send("action", {action: "getStatus"})
    ipcRenderer.send("action", {action: "getCustomTitles"})
    ipcRenderer.on("setCustomTitles", (event, args) => {
        customTitles = args["titles"]
        console.log("Setting up custom titles: " + customTitles)
        document.title = customTitles[0]
        fillCustomTitles(customTitles)
    })

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
                $("#statusBtnStart").addClass("btn-success")
                $("#statusBtnStart").removeClass("btn-primary")
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

        // Getting minutes to set
        minutesToSet = $("input[name=minutesToSet]:checked").val()
        if(isNaN(minutesToSet))
            minutesToSet = -1
        if (minutesToSet == 0) {
            let customMinutes = $("#customMinutesInput").val()
            if (!isNaN)
                customMinutes = -1
            minutesToSet = parseInt(customMinutes)
        }

        // Getting key to press
        key = $("#keyToPress").val()
        if (key == "custom") {
            key = $("#stringToPress").val()
            if (key == "")
                key = "a"
        }

        let data = {
            action: (currentStatus == TypingStatus.TYPING) ? "pause" : "start",
            minutes: minutesToSet,
            keyToPress: key,
            titles: customTitles,
            autoclick: autoClickEnabled
        }
        ipcRenderer.send("action", data)
        $(this).prop("disabled", true)
        $("#statusBtnStop").prop("disabled", false)
    })

    $("#statusBtnStop").click(() => {
        let data = {
            action: "stop"
        }
        ipcRenderer.send("action", data)
        $(this).prop("disabled", true)
        $("#statusBtnStart").prop("disabled", false)

    })

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

    $("select#keyToPress").change(() => {
        let keyToPress = $("select#keyToPress").val()
        console.log("key: " + keyToPress)
        if (keyToPress == "custom") {
            $("#stringToPress").slideDown(200, () => {
                $("#stringToPress").focus()
            })
        } else {
            $("#stringToPress").slideUp(200)
        }
    })

    $("input[name=enableAutoClick]").change(()=> {
        let enabled = $('input[name=enableAutoClick]:checked').val()
        autoClickEnabled = (enabled == "1") ? true : false
        ipcRenderer.send("action", {action: "setAutoClickEnabled", autoclick: autoClickEnabled})
    })

    $("#addCustomTitleToList").click(() => {
        let t = $("#customTitleToList").val()
        $("#customTitleToList").val("").focus()
        if (t != "") {
            customTitles.push(t)
            addCustomTitleToList(t)
        }
    })

    $("#customTitles").on("click", ".customTitleRemove", (ev) => {
        removeCustomTitleFromList(ev.currentTarget)
        let title = $(ev.currentTarget).parent().parent().find(".eachTitle").html()
        let i = customTitles.indexOf(title)
        if (i != -1)
            customTitles.splice(i, 1)
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


    function fillCustomTitles(customTitles) {
        $("#customTitles").html("")
        customTitles.forEach(t => addCustomTitleToList(t))
    }

    function addCustomTitleToList(title) {
        $("#customTitles").append('<div class="row eachTitleContainer"><div class="col eachTitle">' + title + '</div><div class="col"><button class="btn btn-danger customTitleRemove">REMOVE</button></div></div>')
    }

    function removeCustomTitleFromList(that) {
        let el = $(that).parent().parent()
        el.fadeOut(200, () => {
            $(el).remove()
        })
    }

    function randomizeTitles(){
        let size = customTitles.length
        if (size > 0) {
            if (size == 1)
                document.title = customTitles[0]
            else {
                let newTitle = customTitles[Math.floor(Math.random() * size)]
                while (newTitle == document.title)
                    newTitle = customTitles[Math.floor(Math.random() * size)]
                document.title = newTitle
            }
        }
        setTimeout(randomizeTitles, 3 * 60 * 1000)
    }
});