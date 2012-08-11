var browserifyServer = require("browserify-server")
    , http = require("http")
    , path = require("path")
    , boot = require("boot")
    , StreamServerProxy = require("../..")
    , StreamRouter = require("stream-router")

var handler = browserifyServer(path.join(__dirname, "static"))
    , server = http.createServer(handler).listen(8080)
    , streamRouter = StreamRouter()
    , sock = boot(logger(streamRouter))
    , proxy = StreamServerProxy()

streamRouter.addRoute("/browser-server/*", proxy)

sock.install(server, "/boot")

function logger(f) {
    return function (stream) {
        /*console.log("[BOOT-STREAM-RECEIVED]", {
            meta: stream.meta
            , id: stream.id
        })
        stream.on("data", function (data) {
            console.log("[BOOT-STREAM-DATA]", {
                meta: stream.meta
                , data: data
                , id: stream.id
            })
        })*/
        f.apply(this, arguments)
    }
}