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

  private timer?: ReturnType<typeof setInterval>;

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

  status(data: any): void {
    if (typeof this.listener.status === 'function') {
      this.listener.status(data);
    }
  }

  close(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    if (this.request && typeof this.request.close === 'function') {
      this.request.close();
    }
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
    clearInterval(this.timer);
    this.timer = setInterval(() => this.send(), this.interval);
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
