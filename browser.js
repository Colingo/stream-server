var uuid = require("node-uuid")

module.exports = createServer

function createServer(mdm, options, callback) {
    if (typeof options === "function") {
        callback = options
        options = {}
    }

    options = options || {}
    var prefix = options.prefix || "/browser-server"

    return {
        listen: listen
        , connect: connect
    }

    function connect(name) {
        return mdm.createStream(prefix + "/client/" + name + "/" + uuid())
    }
    
    function listen(name) {
        var stream = mdm.createStream(prefix + "/server/" + name)

        stream.on("data", openServerConnection)

        function openServerConnection(clientName) {
            var clientStream = mdm.createStream(prefix + "/server/" + name +
                "/client/" + clientName)

            callback(clientStream)
        }
    }
}