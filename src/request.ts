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
   * @param {object} container
   */
  constructor(protected container: any) {
    this.request = null;
  }

  /**
   * Locate a beacon.
   *
   * @param {any} data
   */
  locate(data: any): void {
    this.container.locate(data);
  }

  /**
   * Update status.
   *
   * @param {number = 200} status
   */
  update(status: number = 200): void {
    this.container.update(status);
  }

  /**
   * Queue a request.
   */
  queue(): void {
    let callback = () => this.send();
    setInterval(callback, this.interval);
  }

  /**
   * Dispatch request.
   *
   * @param {any} vehicles
   */
  abstract dispatch(vehicles?: any): void;

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
