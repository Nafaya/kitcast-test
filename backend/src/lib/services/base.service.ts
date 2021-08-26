/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from 'winston';

export interface IServiceBaseConstructorInput {
  context : Record<string, unknown>
  logger : Logger
  traceId : string
}
export default class ServiceBase {
  protected context : Record<string, unknown>
  protected logger : Logger
  protected traceId : string

  constructor({ context = {}, logger, traceId } : IServiceBaseConstructorInput) {
    this.logger = logger;
    this.traceId = traceId;
    this.context = context;
  }

  validate(params : unknown) : Record<never, unknown> {
    return {};
  }

  async run(params : Record<never, unknown> = {}) : Promise<Record<never, unknown>> {
    try {
      return await this.execute(this.validate(params));
    } catch (e) {
      this.translateError(e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(params : Record<never, unknown>) : Promise<Record<never, unknown>> {
    throw new Error('Im abstract');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  translateError(e: Error) : never {
    throw e;
  }
}
