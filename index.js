var partial = require("ap").partial
    , StreamRouter = require("stream-router")
    , handleServer = require("./lib/handleServer")
    , handleClient = require("./lib/handleClient")
    , redirectServerToClient = require("./lib/redirectServerToClient")

module.exports = createRouter

function createRouter(prefix) {
    var router = StreamRouter()
        , stores = {}

    prefix = prefix || "/browser-server"

    router.addRoute(prefix + "/server/:serverName/client/:clientName"
        , partial(redirectServerToClient, stores))
    router.addRoute(prefix + "/server/:serverName"
        , partial(handleServer, stores))
    router.addRoute(prefix + "/client/:serverName/*"
        , partial(handleClient, stores))

    return router
}