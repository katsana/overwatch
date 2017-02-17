interface Listener {
  /**
   * Vehicle located.
   *
   * @param {object} data
   */
  locate(data: any): void;

  /**
   * Update the listener with response status.
   *
   * @param {number} status
   */
  update(status: number): void;

  /**
   * Get all vehicles.
   *
   * @return {array}
   */
  get all(): Array<any>;

  /**
   * Get the current vehicle.
   *
   * @return {object}
   */
  get current(): any;
}
