var StreamStore = require("stream-store")
    , hat = require("hat")
    , StreamRouter = require("stream-router")

var stores = {}

module.exports = createRouter

function createRouter(prefix) {
    var router = StreamRouter()
    router.addRoute(prefix + "/server/:serverName/client/:clientName"
        , redirectServerToClient)
    router.addRoute(prefix + "/server/:serverName", handleServer)
    router.addRoute(prefix + "/client/:serverName/*", handleClient)
    return router
}

function handleServer(stream, params) {
    var serverName = params.serverName
        , store = stores[serverName]

    console.log("[HANDLE-SERVER]", {
        serverName: serverName
        , params: params
        , store: Object.keys(stores)
    })

    if (store) {
        // someone already registered this server. This is invalid state
        return stream.end()
    }

    store = StreamStore()

    stores[serverName] = {
        rack: hat.rack(128, 16, 16)
        , store: store
        , stream: stream
    }

    stream.once("end", onend)

    function onend() {
        delete stores[serverName]
        // Close all the open client streams that are trying to connect
        // to this server
        store.iterate(ensureStreamIsEnded)
    }

    function ensureStreamIsEnded(stream) {
        if (!stream.ended) {
            stream.end()
        }
        stream.destroy && stream.destroy()
    }
}

function handleClient(stream, params) {
    var serverName = params.serverName
        , server = stores[serverName]

    if (!server) {
        // This server does not exist so end the connection
        return stream.end()
    }

    var store = server.store
        , rack = server.rack
        , serverStream = server.stream
        , clientName = rack()

    store.set(clientName, stream)

    serverStream.write(clientName)

    stream.once("end", onend)

    function onend() {
        store.delete(clientName)
    }
}

function redirectServerToClient(stream, params) {
    var serverName = params.serverName
        , clientName = params.clientName
        , server = stores[serverName]

    if (!server) {
        // trying to connect to a stream when a server is not registered
        return stream.end()
    }

    var store = server.store
        , hasClientStream = store.has(clientName)

    if (!hasClientStream) {
        // The client the server is trying to connect to doesn't exist
        return stream.end()
    }

    var clientStream = store.get(clientName)

    stream.pipe(clientStream).pipe(stream)
}