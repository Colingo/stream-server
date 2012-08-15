module.exports = redirectServerToClient

function redirectServerToClient(stores, stream, params) {
    var serverName = params.serverName
        , clientName = params.clientName
        , server = stores[serverName]

    if (!server) {
        // trying to connect to a stream when a server is not registered
        stream.error({
            code: "500"
            , library: "[stream-server]"
            , message: "cannot open client-server connection, server does" +
                "not exist"
            , details: serverName
        })
        return stream.end()
    }

    var store = server.store
        , hasClientStream = store.has(clientName)

    if (!hasClientStream) {
        // The client the server is trying to connect to doesn't exist
        stream.error({
            code: "500"
            , library: "[stream-server]"
            , message: "cannot open client-server connection"
            , details: clientName
        })
        return stream.end()
    }

    var clientStream = store.get(clientName)
    // tell the client it is open so it can empty its buffer directly to
    // the server
    clientStream.write("[stream-server]:open")
    // Tell the server that this connection is open aswell
    stream.write("[stream-server]:open")
    // connect client and server
    stream.pipe(clientStream).pipe(stream)

    clientStream.resume()
}