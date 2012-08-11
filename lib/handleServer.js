var StreamStore = require("stream-store")
    , hat = require("hat")

module.exports = handleServer

function handleServer(stores, stream, params) {
    var serverName = params.serverName
        , store = stores[serverName]

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