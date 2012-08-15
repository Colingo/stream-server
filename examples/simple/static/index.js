var StreamServer = require("../../../browser")
    , boot = require("boot")
    , SERVER_NAME = "foobar"

var mdm = boot("/boot")

window.listen = listen
window.connect = connect

function listen() {
    StreamServer(mdm, function (stream) {
        console.log("writing to stream")
        stream.on("data", function (data) {
            console.log("[SERVER]", data)
        })
        stream.write("from server")
        stream.on("end", function () {
            console.log("[SERVER] end")
        })
    }).listen(SERVER_NAME)
}

function connect() {
    console.log("reading from stream")
    var stream = StreamServer(mdm).connect(SERVER_NAME)
    stream.on("data", function (data) {
        console.log("[CLIENT]", data)
        stream.end()
    })
    stream.write("from client")
}