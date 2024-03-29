import { Request } from '../request'
import { Resolver } from '../resolver'

class SseRequest extends Request {
  /**
   * Dispatch request.
   */
  dispatch(): void {
    this.update(304);

    this.request.addEventListener('message', e => {
      let response = JSON.parse(e.data);

      if (response.status == 200)
        this.locate(response.data);

      this.update(response.status);
    });
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
   * @param  {options} options
   * @return {this}
   */
  to(options: any = {}): this {
    this.request = new window.EventSource(options.url);

    return this;
  }
}

export class Sse extends Resolver {
  /**
   * Make SSE request.
   *
   * @param {object} listener
   * @return {Request}
   */
  make(listener: any) {
    let request = new SseRequest(listener);

    return request.to(this.options);
  }
}
