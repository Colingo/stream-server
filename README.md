# stream-server

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

## Motivation

This a pre-runner to real P2P experiments that will be done once we can create [data channels][3] with WebRTC

This is the smallest piece necessary to spawn arbitary stream servers in browsers.

## Documentation

### `StreamClient(mdm, options).connect(serverName)`

To be used in the browser

``` js
var StreamClient = require("browser-stream-server")
var stream = StreamClient(mdm).connect("SERVER_NAME")
```

Returns a stream connection to that server name. It assumes the server is running somewhere else. If it's not then the stream is closed.

The `mdm` value is a [MuxDemux][4] stream. This can be got from mux-demux, mux-demux-shoe or boot.

options include a prefix option which allows you to set a custom prefix if the StreamServerProxy uses a custom prefix.

### `StreamServer(mdm, options, callback).listen(serverName)`

To be used in the browser

``` js
var StreamServer = require("browser-stream-server")
var server = StreamServer(mdm, options, function (stream) {
    // handle stream
}).listen("SERVER_NAME")
```

Creates a server stream connection. It assumes that named server is not already running somewhere else. If it is then the stream is closed.

The `mdm` value is a [MuxDemux][4] stream. This can be got from mux-demux, mux-demux-shoe or boot.

options are optional, you can pass a callback as the second parameter. The callback get's called every time someone else calls `.connect(serverName)` and you get passed a stream connection to them

options include a prefix option which allows you to set a custom prefix if the StreamServerProxy uses a custom prefix.

To close the server just `.end()` the returned server

### `StreamServerProxy(prefix)`

To be used in the server

``` js
var StreamServerProxy = require("browser-stream-server")
    , proxy = StreamServerProxy("/somePrefix")
// for every request to /browser-server let the StreamServer proxy handle it
streamRouter.addRoute("/somePrefix/*", proxy)
```

Set up a steam route handler to allow the stream servers and clients to be proxied through your central server.

Optionally pass in a prefix which defaults to `"/browser-server"`. If you pass in a different prefix make sure that your browser code matches the prefix.

#### proxy events

The returned proxy object emits `server-created` and `server-destroyed` events when a server stream connects and claims to own the SERVER_NAME

``` js
proxy.on("server.created", function (serverName) {
    createSomeSpecialResources(serverName)
})

proxy.on("server.destroyed", function (serverName) {
    destroySpecialResources(serverName)
})
```

#### `proxy.connect("serverName")`

``` js
var stream = proxy.connect(serverName)
```

You can manually connect directly to a stream server. This runs similar logic to `StreamClient(...).connect(serverName)`

## How it works

When you call `StreamServer(...).listen(SERVER_NAME)` you open a server stream to the `StreamServerProxy` and tell the server "redirect all connect SERVER_NAME traffic to me"

When you call `StreamClient(...).connect(SERVER_NAME)` you open a client stream to the `StreamServerProxy` saying "connect me to SERVER_NAME". The `StreamProxyServer` then sends a message to `StreamServer` identified by SERVER_NAME. The message contains a unique identifier, UNIQUE_ID for this client stream. The proxy server stores this client stream in memory.

The `StreamServer` receives this message and opens another connection to the `StreamServerProxy` saying "hi I'm server SERVER_NAME and want to connect to client UNIQUE_ID". The `StreamServerProxy` then gets the client stream out of memory and connects it to the new server connection which allows the client to talk to the server

## Installation

`npm install browser-stream-server`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/browser-stream-server.png
  [2]: http://travis-ci.org/Raynos/browser-stream-server
  [3]: http://dev.w3.org/2011/webrtc/editor/webrtc.html#widl-RTCPeerConnection-createDataChannel-DataChannel-DOMString-label-DataChannelInit-dataChannelDict
  [4]: https://github.com/dominictarr/mux-demux#muxdemuxoptions