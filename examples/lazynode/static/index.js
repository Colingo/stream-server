var CreateServer = require("../../../browser")
    , boot = require("boot")
    , lazynode = require("lazynode")
    , SERVER_NAME = "foobar"

var mdm = boot("/boot")
    , create = document.getElementById("create-server")
    , join = document.getElementById("join-server")

create.addEventListener("click", createServer)
join.addEventListener("click", joinServer)

var methods = {
    time: function (cb) {
        cb(new Date().toString())
    }
}

function createServer() {
    var server = CreateServer(mdm, streamHandler)
    server.listen(SERVER_NAME)

    function streamHandler(stream) {
        var up = lazynode(methods)
        up.pipe(stream).pipe(up)
    }
}

function joinServer() {
    var client = CreateServer(mdm)
        , remote = lazynode.connect({
            createStream: createStream
            , methods: ["time"]
        })

    setInterval(function () {
        remote.time(function (time) {
            console.log("time = ", time)
        })
    }, 1000)

    function createStream() {
        return client.connect(SERVER_NAME)
    }
}