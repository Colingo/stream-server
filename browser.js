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
        // Return a proxy stream
        var readable = through(catchFirstMessage)
            // catch first message from server that stream is open
            , writable = PauseStream().pause()
            , proxy = duplex(writable, readable)
            , tryAgain = 4
            , connected = false

        // try to open the stream
        openStream()

        return proxy

        function openStream() {
            // connect to a server directly
            var id = rack()
                , stream = mdm.createStream(prefix + "/client/" + name +
                    "/" + id)

            console.log("opening", id)

            writable.pipe(stream).pipe(readable)

            stream.once("ended", function () {
                console.log("client-stream did not end")
                stream.end()
            })

            // handle server does not exist yet and try to reconnect 4 times
            stream.once("error", handleError)

            function handleError(err) {
                var code = err.code
                    , message = err.message

                if (code === "404" && message === "server does not exist") {
                    tryAgain--
                    console.log('server does not exist', tryAgain)
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

        function catchFirstMessage(data) {
            // the open message is from the proxy server
            if (connected === false && data === "[stream-server]:open") {
                connected = true
                writable.resume()
            } else {
                this.emit("data", data)
            }
        }
    }
    
    function listen(name) {
        // open a server stream
        var stream = mdm.createStream(prefix + "/server/" + name)

        stream.on("data", openServerConnection)

        return stream

        function openServerConnection(clientName) {
            console.log("request to open", clientName)

            // for each client message that comes up create a proxy stream
            // and return it
            var writable = PauseStream().pause()
                , readable = through(catchFirstMessage)
                , proxy = duplex(writable, readable)
                , tryAgain = 4
                , connected = false

            openStream()

            callback(proxy)

            function openStream() {
                // connect to client directly (through relay)
                var id = rack()
                    , stream = mdm.createStream(prefix + "/server/" + name +
                    "/client/" + clientName + "/" + id)

                console.log("opening", id)

                // Boot server says the relay server disconnected.
                // Clean up open streams
                stream.once("ended", function () {
                    console.log("ending server", id)
                    stream.purge && stream.purge()
                    stream.end()
                })

                writable.pipe(stream).pipe(readable)

                // handle client does not exist yet and try to reconnect
                stream.once("error", handleError)

                function handleError(err) {
                    var code = err.code
                        , message = err.message

                    if (code === "500" && message === "cannot open client-" +
                        "server connection"
                    ) {
                        tryAgain--
                        console.log('client does not exist', tryAgain, id)
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

            function catchFirstMessage(data) {
                // the open message is from the proxy server
                if (connected === false && data === "[stream-server]:open") {
                    connected = true
                    writable.resume()
                } else {
                    this.emit("data", data)
                }
            }
        }
    }
}