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
    $(".is-running").hide()

    // Getting status
    ipcRenderer.send("action", JSON.stringify(data))
    ipcRenderer.on("setStatus", (event, args) => {
        currentStatus = args["status"]
        console.log("status set to " + currentStatus)

        switch(currentStatus) {
            case TypingStatus.TYPING : {
                $("#statusBtnStart").prop("disabled", true)
                $("#statusBtnStop").prop("disabled", false)
                $(".is-idle").slideUp(200, () => {
                    $(".is-running").slideDown(200)
                })
                break
            }
            case TypingStatus.IDLE : {
                $("#statusBtnStart").prop("disabled", false)
                $("#statusBtnStop").prop("disabled", true)

                $(".is-running").slideUp(200, () => {
                    $(".is-idle").slideDown(200)
                })
                break
            }
        }
    })

    $("#statusBtnStart").click(() => {
        let data = {
            action: "start"
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
});