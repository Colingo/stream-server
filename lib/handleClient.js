var through = require("through")
    , PauseStream = require("pause-stream")
    , duplex = require("duplexer")

module.exports = handleClient

function handleClient(stores, stream, params, counter) {
    var serverName = params.serverName
        , server = stores[serverName]

    console.log("connecting")

    counter = counter || 0

    if (!server) {
        console.log("killing stream")
        stream.error("404: server does not exist: " + serverName)
        return stream.end()
    }

    var store = server.store
        , rack = server.rack
        , serverStream = server.stream
        , clientName = rack()
        , bufferWritable = through()
        , bufferReadable = PauseStream().pause()
        , buffer = duplex(bufferWritable, bufferReadable)

    store.set(clientName, buffer)

    serverStream.write(clientName)

    // When a client requests a server connection buffer that stream
    // until the server responds
    bufferWritable.pipe(stream).pipe(bufferReadable)

    stream.once("end", onend)

    function onend() {
        store.delete(clientName)
    }
}