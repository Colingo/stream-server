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
        // connect to a client directly
        return mdm.createStream(prefix + "/client/" + name + "/" + uuid())
    }
    
    function listen(name) {
        // open a server stream
        var stream = mdm.createStream(prefix + "/server/" + name)

        stream.on("data", openServerConnection)

        return stream

        function openServerConnection(clientName) {
            // for each client message that comes up open the client stream
            // and return it into the callback
            var clientStream = mdm.createStream(prefix + "/server/" + name +
                "/client/" + clientName)

            callback(clientStream)
        }
    }
}