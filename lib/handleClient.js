var through = require("through")
    , PauseStream = require("pause-stream")
    , duplex = require("duplexer")

module.exports = handleClient

function handleClient(stores, stream, params, counter) {
    var serverName = params.serverName
        , server = stores[serverName]

    counter = counter || 0

    if (!server) {
        // This server does not exist so end the connection
        if (counter > 5) {
            return stream.end()
        }
        // Try to find the server again 5 more times
        counter++
        return setTimeout(handleClient, 500, stores, stream, params, counter)
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