import { io, Socket } from 'socket.io-client'
import { Request } from '../request'
import { Resolver } from '../resolver'

class WebsocketRequest extends Request {
  protected request!: Socket;
  private token: string = '';
  private dispatched: boolean = false;
  private authenticated: boolean = false;
  private imeis: Set<string> = new Set();

  dispatch(): void {
    this.imeis = new Set(this.listener.vehicles.map(vehicle => String(vehicle.imei)));
    if (this.dispatched) return;

    this.dispatched = true;
    Websocket.activeRequests++;
    this.update(304);

    this.request.on('connect', () => {
      this.authenticated = false;
      this.request.emit('authenticate', { token: this.token });
    });
    this.request.on('authenticated', () => { this.authenticated = true; });
    this.request.on('unauthorized', () => {
      this.authenticated = false;
      this.update(401);
    });
    this.request.on('connect_error', () => { this.update(503); });
    this.request.on('disconnect', () => {
      this.authenticated = false;
      this.update(304);
    });
    this.request.onAny((event, response) => {
      const [type, imei] = event.split(':');
      if (!this.authenticated || !this.imeis.has(imei) ||
          !['track', 'status'].includes(type) || !response) return;

      if (response.status == 200) {
        if (type === 'track') this.locate(response.data);
        else this.status({ event, data: response.data });
      }
      this.update(response.status);
    });
    this.request.connect();
  }

  send(): void {
    this.update(304);
  }

  to(options: any = {}): this {
    this.token = options.token;
    const { url, token, ...socketOptions } = options;
    this.request = io(url, { ...socketOptions, autoConnect: false });
    return this;
  }

  close(): void {
    this.request.removeAllListeners();
    this.request.offAny();
    this.request.disconnect();
    this.authenticated = false;
    if (this.dispatched) {
      this.dispatched = false;
      Websocket.activeRequests--;
    }
  }
}

export class Websocket extends Resolver {
  static activeRequests: number = 0;

  make(listener: any): Request {
    return new WebsocketRequest(listener).to(this.options);
  }
}
