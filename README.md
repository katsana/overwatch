Overwatch
=====

A simple request engine to fetch streaming of location update for KATSANA™ beacon.

## Installation

You can install the package via `NPM` or `Yarn`.

    npm install katsana-overwatch

or,

    yarn add katsana-overwatch

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

  get vehicle(): any {
    // return the current vehicle
  }

  get all(): Array<any> {
    // return all vehicles
  }
}

var feed = new Overwatch(new Listener());

feed.driver('sse').dispatch(); // you can change the driver to "sse" or "websocket"
