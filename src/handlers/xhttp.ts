import { Request } from '../request'
import { Resolver } from '../resolver'

class XHttpRequest extends Request {
  /**
   * Request interval.
   *
   * @type {number}
   */
  protected interval: number = 5000;

  /**
   * Dispatch request.
   *
   * @param {array} vehicles
   */
  dispatch(): void {
    this.update(304);

    Javie.on('Request.onComplete: katsana.overwatch', (data, status, self) => {
      if (status == 200)
        this.locate(data);

      this.update(status);
    });

    this.queue();
  }

  /**
   * Send request.
   */
  send(): void {
    this.request.execute(this.listener.vehicle);
  }

  /**
   * Set request endpoint.
   *
   * @param  {object} options
   * @return {this}
   */
  to(options: any = {}): this {
    this.request = Javie.make('request', 'katsana.overwatch');
    this.request.to(`GET ${options.url}`);

    return this;
  }
}

export class XHttp extends Resolver {
  /**
   * Make Xhttp request.
   *
   * @param {object} listener
   * @return {Request}
   */
  make(listener: any) {
    let request = new XHttpRequest(listener);

    return request.to(this.options);
  }
}
