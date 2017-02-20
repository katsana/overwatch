import { Resolver } from './resolver'
import { Sse } from './handlers/sse'
import { Websocket } from './handlers/websocket'
import { XHttp } from './handlers/xhttp'

class Overwatch {
  /**
   * List of configuration.
   *
   * @type {object}
   */
  static _config: any = {
    sse: {},
    websocket: {},
    xhttp: {}
  };

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
   * Construct a new class.
   *
   * @param {string} service
   * @return {Resolver}
   */
  protected createDriver(service: string): Resolver {
    if (service == 'sse') {
      return this.registerSseRequest();
    } else if (service == 'websocket') {
      return this.registerWebsocketRequest();
    } else if (service == 'xhttp') {
      return this.registerXHttpRequest();
    }

    throw new Error(`Driver [${service}] is not available.`);
  }

  /**
   * Get current service.
   *
   * @return {Resolver}
   */
  driver(service: string): Resolver {
    if (this.drivers[service] !== null) {
      this.drivers[service] = this.createDriver(service);
    }

    return this.drivers[service];
  }

  /**
   * Register SSE request.
   *
   * @return {Sse|XHttp}
   */
  private registerSseRequest(): Sse|XHttp {
    if (!window.EventSource) {
      return this.registerXHttpRequest();
    }

    return new Sse(Overwatch._config.sse);
  }

  /**
   * Register Websocket request.
   *
   * @return {Websocket}
   */
  private registerWebsocketRequest(): Websocket {
    return new Websocket(Overwatch._config.websocket);
  }

  /**
   * Register XHTTP request.
   *
   * @return {XHttp}
   */
  private registerXHttpRequest(): XHttp {
    return new XHttp(Overwatch._config.xhttp);
  }

  /**
   * Attach configuration.
   *
   * @param {any} options
   */
  static config(options: any) {
    Overwatch._config = _.extend(Overwatch._config, options);
  }
}

module.exports = Overwatch;
