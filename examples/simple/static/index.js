var CreateServer = require("../../../browser")
    , boot = require("boot")
    , SERVER_NAME = "foobar"

var mdm = boot("/boot")

window.listen = listen
window.connect = connect

function listen() {
    CreateServer(mdm, function (stream) {
        stream.on("data", function (data) {
            console.log("[SERVER]", data)
        })
        stream.write("from server")
    }).listen(SERVER_NAME)
}

function connect() {
    var stream = CreateServer(mdm).connect(SERVER_NAME)
    stream.on("data", function (data) {
        console.log("[CLIENT]", data)
    })
    stream.write("from client")
}