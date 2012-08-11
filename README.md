# browser-stream-server

A stream server in the browser

Create streaming servers in your browser. Emulating peer to peer connections through a central proxy server

## Example browser server (In a seperate browser)

``` js
var StreamServer = require("browser-stream-server")
    , boot = require("boot")
    , mdm = boot("/boot")

// Open a Stream server and listen on a server name
StreamServer(mdm, function (stream) {
    // Called every time a client opens up a stream connection to you
    stream.on("data", function (data) {
        console.log("[SERVER]", data)
    })
    stream.write("from server")
}).listen("SERVER_NAME")
```

## Example browser client (In a seperate browser)

``` js
var StreamClient = require("browser-stream-server")
    , boot = require("boot")
    , mdm = boot("/boot")

// Open a connection to a named stream server
var stream = StreamClient(mdm).connect("SERVER_NAME")
stream.on("data", function (data) {
    console.log("[CLIENT]", data)
})
stream.write("from client")
```

## Example proxy server

``` js
var boot = require("boot")
    , StreamServerProxy = require("browser-stream-server")
    , StreamRouter = require("stream-router")

// route stream traffic from boot through a stream router
var streamRouter = StreamRouter()
    , sock = boot(streamRouter)

// for every request to /browser-server let the StreamServer proxy handle it
streamRouter.addRoute("/browser-server/*"
    , StreamServerProxy("/browser-server"))

sock.install(someHttpServer, "/boot")
```

## Installation

`npm install browser-stream-server`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/browser-stream-server.png
  [2]: http://travis-ci.org/Raynos/browser-stream-server