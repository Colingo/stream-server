var uuid = require("node-uuid")

module.exports = createServer

function createServer(mdm, callback) {
    return {
        listen: listen
        , connect: connect
    }

    function connect(name) {
        return mdm.createStream("/user/client/" + name + "/" + uuid())
    }
    
    function listen(name) {
        var stream = mdm.createStream("/user/server/" + name)

        stream.on("data", openServerConnection)

        function openServerConnection(clientName) {
            var clientStream = mdm.createStream("/user/server/" + name +
                "/client/" + clientName)

            callback(clientStream)
        }
    }
}