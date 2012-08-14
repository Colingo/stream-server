var partial = require("ap").partial
    , StreamRouter = require("stream-router")
    , handleServer = require("./lib/handleServer")
    , handleClient = require("./lib/handleClient")
    , redirectServerToClient = require("./lib/redirectServerToClient")
    , EventEmitter = require("events").EventEmitter.prototype
    , extend = require("xtend")
    , through = require("through")

module.exports = StreamServerProxy

function StreamServerProxy(prefix) {
    var proxy = StreamRouter()
        , stores = {}

    extend(proxy, EventEmitter)

    prefix = prefix || "/stream-server"

    proxy.addRoute(prefix + "/server/:serverName/client/:clientName"
        , partial(redirectServerToClient, stores))
    proxy.addRoute(prefix + "/server/:serverName"
        , partial(handleServer, stores, proxy))
    proxy.addRoute(prefix + "/client/:serverName/*"
        , partial(handleClient, stores))

    // probably buggy
    proxy.connect = connect

    return proxy

    function connect(serverName) {
        var stream = through()
        handleClient(stores, stream, {
            serverName: serverName
        })
        return stream
    }
}