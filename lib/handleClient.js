var through = require("through")
    , PauseStream = require("pause-stream")
    , duplex = require("duplexer")

module.exports = handleClient

function handleClient(stores, stream, params, counter) {
    var serverName = params.serverName
        , server = stores[serverName]

    counter = counter || 0

    if (!server) {
        stream.error({
            code: "404"
            , library: "[stream-server]"
            , message: "server does not exist"
            , details: serverName
        })
        return stream.end()
    }

    var store = server.store
        , rack = server.rack
        , serverStream = server.stream
        , clientName = rack()
        , buffer = BufferStream(stream)

    store.set(clientName, buffer)

    serverStream.write(clientName)

    stream.once("end", onend)

    function onend() {
        store.delete(clientName)
    }
}

function BufferStream(stream) {
    var writable = through()
        , readable = PauseStream().pause()
        , buffer = duplex(writable, readable)

    writable.pipe(stream).pipe(readable)

    return buffer
}