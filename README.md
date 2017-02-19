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

By default you can either use `XHTTP`, `SSE` or `Websocket` connection, you can start by configurating the connection using `Overwatch.config()`:

