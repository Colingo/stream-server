var browserifyServer = require("browserify-server")
    , boot = require("boot")
    , StreamServerProxy = require("../..")

var server = browserifyServer.listen(__dirname, 8080)
    , proxy = StreamServerProxy()

boot.install(server, logger(proxy))

function logger(f) {
    return function (stream) {
        console.log("[BOOT-STREAM-RECEIVED]", {
            meta: stream.meta
            , id: stream.id
        })
        stream.on("data", function (data) {
            console.log("[BOOT-STREAM-DATA]", {
                meta: stream.meta
                , data: data
                , id: stream.id
            })
        })
        var _write = stream.write
        stream.write = function (data) {
            console.log("[BOOT-STREAM-WRITE]", {
                meta: stream.meta
                , data: data
                , id: stream.id
            })
            _write.apply(this, arguments)
        }
        f.apply(this, arguments)
    }
}