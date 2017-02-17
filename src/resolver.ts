import { Request } from './request'

export abstract class Resolver {
  /**
   * Construct a new class.
   *
   * @param {object} options
   */
  constructor(protected options: any = {}) {
    //
  }

  /**
   * Make the request.
   *
   * @param {object} listener
   * @return {Request}
   */
   abstract make(listener: any): Request;
}
