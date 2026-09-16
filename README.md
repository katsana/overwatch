Overwatch
=====

A simple request engine to fetch streaming of location update for KATSANA™ beacon.

## Versions

- `0.2.x` uses Socket.IO client 2.x.
- `1.0.0` was the original Socket.IO 4 release.
- `1.0.1` reverted to Socket.IO client 2.5.x for compatibility. Existing npm
  releases are left unchanged.
- `2.0.0` uses Socket.IO client 4.8.3 or a compatible newer 4.x release and
  requires a Socket.IO 3.x/4.x server. It cannot connect to a Socket.IO 2 server.

The `authenticate` / `authenticated` token exchange and `track:<imei>` /
`status:<imei>` events are unchanged. Requests authenticate again after a
transport reconnect without duplicating listeners. SSE and Javie HTTP fallback
remain available.

## Installation

Install the Socket.IO 4 version from the `v2.x` GitHub branch using npm or Yarn:

    npm install "github:katsana/overwatch#v2.x"

or,

    yarn add "github:katsana/overwatch#v2.x"

Commit your application's lockfile to pin the resolved Git commit. Use `npm ci`
for repeatable installations. No npm registry release or GitHub release tag is
required for branch-based installation. Existing npm releases remain unchanged.

## Importing Overwatch

Once installed, you can easily import the library using the following

```javascript
const Overwatch = require('katsana-overwatch');
```

## Configuration

By default you can either use `SSE` or `Websocket` connection, you can start by configurating the connection using `Overwatch.config()`:

```javascript
Overwatch.config({
  sse: { url: "https://demo.katsana.com/sse" },
  websocket: { url: "https://demo.katsana.com/websocket", token: "xyz" }
});
```

## Streaming

Once configuration has been made, you can start streaming the data using the following:

```javascript

class Listener {
  locate(vehicle: any): void {
    // triggered when vehicle is located
  }

  update(status: number): void {
    // trigger when server made a response.
  }

  status(data: any): void {
    // optional: receives { event: 'status:<imei>', data: payload }
  }

  get vehicle(): any {
    // return the current vehicle
  }

  get vehicles(): Array<any> {
    // return all vehicles
  }
}

var feed = new Overwatch();

feed.driver('sse').make(new Listener()).dispatch(); // you can change the driver to "sse" or "websocket"
```

Retain the request and call `request.close()` when leaving a view or replacing a
feed. A websocket request can be dispatched again to refresh its vehicle list
without opening another connection. `Overwatch._connected` indicates that a
websocket request is active, including while reconnecting; SSE does not set it.

Websocket configuration accepts Socket.IO connection options alongside `url`
and `token`, for example `path` or `transports`. Connecting starts at `dispatch()`.
The listener receives update code 401 for rejected authentication and 503 for a
connection error, in addition to the existing pending (304) and telemetry codes.

## Development

Use Node.js 22 or newer (Katsana2 uses Node.js 24) and npm:

```sh
npm ci
npm test
npm run compile
```

Rollup 4 and its maintained TypeScript plugin replace the old Rollup/Babel 6
pipeline. TypeScript 6 is the newest compatible compiler; TypeScript 7 does not
provide the compiler API required by the current plugin. Socket.IO supplies its
own types, so the old Typings registry and unused Javie build dependency are
removed. The host still supplies Javie when using the HTTP fallback.

The CommonJS entry point remains `dist/overwatch.js`. Both `prepare` and
`prepack` build it, and tests exercise the compiled package against Socket.IO 4
with legacy protocol compatibility disabled.
