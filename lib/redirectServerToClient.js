module.exports = redirectServerToClient

function redirectServerToClient(stores, stream, params) {
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
    clientStream.write("open")

    stream.pipe(clientStream).pipe(stream)

    clientStream.resume()
}