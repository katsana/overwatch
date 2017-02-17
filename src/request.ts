export abstract class Request {
  /**
   * Request interval.
   *
   * @type {number}
   */
  protected interval: number = 2000;

  /**
   * Interate count.
   *
   * @type {number}
   */
  protected iterate: number = 23;

  /**
   * Request instance.
   *
   * @type {any}
   */
  protected request: any;

  /**
   * Construct a new class.
   *
   * @param {object} listener
   */
  constructor(protected listener: any) {
    this.request = null;
  }

  /**
   * Locate a beacon.
   *
   * @param {any} data
   */
  locate(data: any): void {
    this.listener.locate(data);
  }

  /**
   * Update status.
   *
   * @param {number = 200} status
   */
  update(status: number = 200): void {
    this.listener.update(status);
  }

  /**
   * Queue a request.
   */
  queue(): void {
    setInterval(() => this.send(), this.interval);
  }

  /**
   * Dispatch request.
   */
  abstract dispatch(): void;

  /**
   * Send request.
   */
  abstract send(): void;

  /**
   * Set request endpoint.
   *
   * @param  {object} options
   * @return {this}
   */
  abstract to(options: any): this;
}
