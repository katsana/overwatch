const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { Server } = require('socket.io');
const Overwatch = require('..');

function event(socket, name) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${name}`)), 3000);
    socket.once(name, (...args) => { clearTimeout(timer); resolve(args); });
  });
}

async function fixture(t, transport, token = 'test-token') {
  const httpServer = http.createServer();
  const server = new Server(httpServer, { allowEIO3: false });
  const connections = [];
  const authentications = [];
  server.on('connection', socket => {
    connections.push(socket);
    socket.on('authenticate', payload => {
      authentications.push(payload);
      if (payload.token === 'test-token') socket.emit('authenticated');
      else {
        socket.emit('unauthorized');
        socket.disconnect(true);
      }
    });
  });
  await new Promise(resolve => httpServer.listen(0, '127.0.0.1', resolve));
  Overwatch.config({ websocket: {
    url: `http://127.0.0.1:${httpServer.address().port}`, token,
    transports: [transport], reconnectionDelay: 10, randomizationFactor: 0
  } });
  const received = { locations: [], statuses: [], updates: [] };
  const listener = {
    vehicles: [{ imei: '123' }],
    locate: data => received.locations.push(data),
    status: data => received.statuses.push(data),
    update: code => received.updates.push(code)
  };
  const request = new Overwatch().driver('websocket').make(listener);
  t.after(async () => {
    request.close();
    await new Promise(resolve => server.close(resolve));
  });
  return { request, listener, received, connections, authentications };
}

async function deliver(request, serverSocket, packets) {
  const done = event(request.request, 'test:barrier');
  for (const [name, payload] of packets) serverSocket.emit(name, payload);
  serverSocket.emit('test:barrier');
  await done;
}

for (const transport of ['polling', 'websocket']) {
  test(`v2 authenticates and delivers scoped track/status events over ${transport}`, { timeout: 6000 }, async t => {
    const { request, received, connections, authentications } = await fixture(t, transport);
    const ready = event(request.request, 'authenticated');
    request.dispatch();
    await ready;
    assert.equal(connections[0].conn.protocol, 4);
    assert.deepEqual(authentications, [{ token: 'test-token' }]);
    await deliver(request, connections[0], [
      ['track:123', { status: 200, data: { imei: '123', latitude: 3 } }],
      ['status:123', { status: 200, data: '{"online":true}' }],
      ['track:456', { status: 200, data: { imei: '456' } }],
      ['track:123', { status: 404 }]
    ]);
    assert.deepEqual(received.locations, [{ imei: '123', latitude: 3 }]);
    assert.deepEqual(received.statuses, [{ event: 'status:123', data: '{"online":true}' }]);
    assert.deepEqual(received.updates, [304, 200, 200, 404]);
  });
}

test('reconnect authenticates again without duplicate callbacks, and redispatch refreshes vehicles', { timeout: 6000 }, async t => {
  const { request, listener, received, connections, authentications } = await fixture(t, 'websocket');
  let ready = event(request.request, 'authenticated');
  request.dispatch();
  request.dispatch();
  await ready;
  ready = event(request.request, 'authenticated');
  connections[0].conn.close();
  await ready;
  assert.equal(authentications.length, 2);
  listener.vehicles = [{ imei: '456' }, { imei: '456' }];
  request.dispatch();
  await deliver(request, connections[1], [
    ['track:123', { status: 200, data: { imei: '123' } }],
    ['track:456', { status: 200, data: { imei: '456' } }],
    ['status:456', { status: 200, data: { online: true } }]
  ]);
  assert.deepEqual(received.locations, [{ imei: '456' }]);
  assert.equal(received.statuses.length, 1);
  assert.equal(Overwatch._connected, true);
  request.close();
  request.close();
  assert.equal(Overwatch._connected, false);
  assert.equal(request.request.connected, false);
  assert.equal(request.request.listenersAny().length, 0);
});

test('invalid authentication reports 401 and does not deliver telemetry', { timeout: 6000 }, async t => {
  const { request, received } = await fixture(t, 'websocket', 'invalid');
  const disconnected = event(request.request, 'disconnect');
  request.dispatch();
  await disconnected;
  assert.ok(received.updates.includes(401));
  assert.deepEqual(received.locations, []);
});

test('listeners without a status callback remain supported', { timeout: 6000 }, async t => {
  const { request, listener, received, connections } = await fixture(t, 'websocket');
  delete listener.status;
  const ready = event(request.request, 'authenticated');
  request.dispatch();
  await ready;
  await deliver(request, connections[0], [['status:123', { status: 200, data: {} }]]);
  assert.deepEqual(received.updates, [304, 200]);
});

test('SSE still parses messages and closes without claiming the websocket feed', t => {
  const originalWindow = global.window;
  t.after(() => { global.window = originalWindow; });
  let source;
  global.window = { EventSource: class {
    constructor(url) { this.url = url; source = this; }
    addEventListener(name, callback) { this.callback = callback; }
    close() { this.closed = true; }
  } };
  const locations = [], updates = [];
  Overwatch.config({ sse: { url: '/sse' } });
  const request = new Overwatch().driver('sse').make({
    locate: data => locations.push(data), update: code => updates.push(code)
  });
  request.dispatch();
  source.callback({ data: JSON.stringify({ status: 200, data: { imei: '123' } }) });
  assert.equal(source.url, '/sse');
  assert.deepEqual(locations, [{ imei: '123' }]);
  assert.deepEqual(updates, [304, 200]);
  assert.equal(Overwatch._connected, false);
  request.close();
  assert.equal(source.closed, true);
});

test('HTTP fallback polls through Javie and releases its timer and event listener', t => {
  const originalWindow = global.window, originalJavie = global.Javie;
  t.after(() => { global.window = originalWindow; global.Javie = originalJavie; });
  t.mock.timers.enable({ apis: ['setInterval'] });
  global.window = {};
  const handlers = new Set(), sent = [], locations = [];
  const events = {
    listen(name, callback) { handlers.add(callback); return callback; },
    forget(callback) { handlers.delete(callback); }
  };
  const httpRequest = { to(url) { this.url = url; }, execute(vehicle) { sent.push(vehicle); } };
  global.Javie = { make: service => service === 'event' ? events : httpRequest };
  Overwatch.config({ xhttp: { url: '/location' } });
  const request = new Overwatch().driver('sse').make({
    vehicle: { imei: '123' }, locate: data => locations.push(data), update() {}
  });
  request.dispatch();
  t.mock.timers.tick(5000);
  for (const callback of handlers) callback({ imei: '123' }, 200);
  assert.equal(httpRequest.url, 'GET /location');
  assert.deepEqual(sent, [{ imei: '123' }]);
  assert.deepEqual(locations, [{ imei: '123' }]);
  request.close();
  t.mock.timers.tick(5000);
  assert.equal(sent.length, 1);
  assert.equal(handlers.size, 0);
});
