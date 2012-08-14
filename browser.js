var hat = require("hat")
    , rack = hat.rack(128, 16, 16)
    , through = require("through")
    , PauseStream = require("pause-stream")
    , duplex = require("duplexer")

module.exports = createServer

function createServer(mdm, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {}
    }

    options = options || {}
    var prefix = options.prefix || "/stream-server"

    return {
        listen: listen
        , connect: connect
    }

    function connect(name) {
        var writable = PauseStream().pause()
            , buffer = []
            , readable = through()
            , proxy = duplex(writable, readable)
            , tryAgain = 4
            , connected = false

        openStream()

        readable.once("data", isOpen)

        return proxy

        function openStream() {
            // connect to a client directly
            var stream = mdm.createStream(prefix + "/client/" + name +
                "/" + rack())

            writable.pipe(stream).pipe(readable)

            stream.once("error", handleError)

            function handleError(err) {
                var parts = err.message.split(":")
                    , code = parts[0]
                    , message = parts[1]

                if (code === "404" && message === " server does not exist") {
                    tryAgain--
                    if (tryAgain === 0) {
                        return proxy.emit("error", err)
                    }

                    stream.end()
                    stream.destroy()
                    setTimeout(openStream, 500)
                } else {
                    proxy.emit("error", err)
                }
            }
        }

        function isOpen() {
            writable.resume()
        }
    }
    
    function listen(name) {
        // open a server stream
        var stream = mdm.createStream(prefix + "/server/" + name)

        stream.on("data", openServerConnection)

        return stream

        function openServerConnection(clientName) {
            // for each client message that comes up open the client stream
            // and return it into the callback
            var clientStream = mdm.createStream(prefix + "/server/" + name +
                "/client/" + clientName)

            callback(clientStream)
        }
    }
}