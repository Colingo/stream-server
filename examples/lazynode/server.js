var browserifyServer = require("browserify-server")
    , http = require("http")
    , path = require("path")
    , boot = require("boot")
    , StreamServer = require("../..")
    , StreamRouter = require("stream-router")

var handler = browserifyServer(path.join(__dirname, "static"))
    , server = http.createServer(handler).listen(8080)
    , streamRouter = StreamRouter()
    , sock = boot(streamRouter)

streamRouter.addRoute("/browser-server/*", StreamServer("/browser-server"))

sock.install(server, "/boot")