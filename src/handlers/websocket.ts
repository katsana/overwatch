import { Request } from '../request'
import { Resolver } from '../resolver'
import io from 'socket.io-client'

class WebsocketRequest extends Request {
  /**
   * JWT token.
   *
   * @type {string}
   */
  private token: string;

  /**
   * Dispatch request.
   */
  dispatch(): void {
    let vehicles = this.listener.all;

    this.request.on('connect', () => {
      this.request.on('authenticated', () => {
        for (const vehicle of vehicles) {
          this.request.on('track:' + vehicle.imei, response => {
            if (response.status == 200)
              this.locate(response.data)

            this.update(response.status)
          })
        }
      })
      .emit('authenticate', {token: this.token});
    })
  }

  /**
   * Send request.
   */
  send() {
    this.update(304);
  }

  /**
   * Set request endpoint.
   *
   * @param  {object} options
   * @return {this}
   */
  to(options: any = {}): this {
    this.token = options.token;
    this.request = io(options.url);

    return this;
  }
}

export class Websocket extends Resolver {
  /**
   * Make websocket request.
   *
   * @param {object} listener
   * @return {Request}
   */
  make(listener: any) {
    let request = new WebsocketRequest(listener);

    return request.to(this.options);
  }
}
