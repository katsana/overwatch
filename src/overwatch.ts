import { Sse } from './handlers/sse'
import { Websocket } from './handlers/websocket'
import { XHttp } from './handlers/xhttp'

class Overwatch {
  /**
   * The default driver name.
   *
   * @type {string}
   */
  protected name: string = 'sse';

  /**
   * List of drivers.
   *
   * @type {object}
   */
  protected drivers: any = {};

  /**
   * Register SSE request.
   *
   * @return {Sse}
   */
  private registerSseRequest(): Sse {
    return new Sse();
  }

  /**
   * Register Websocket request.
   *
   * @return {Websocket}
   */
  private registerWebsocketRequest(): Websocket {
    return new Websocket();
  }

  /**
   * Register XHTTP request.
   *
   * @return {XHttp}
   */
  private registerXHttpRequest(): XHttp {
    return new XHttp();
  }
}

module.exports = Overwatch;
