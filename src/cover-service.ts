import { Service } from './service';
import { EntityDomain, EntityId, NodeRedOpts } from './types';

export function newCoverService(entity_id: EntityId, opts?: NodeRedOpts) {
  return new CoverService(entity_id, opts);
}

/**
 * Payload builder for service call
 */
export class CoverService extends Service {
  // _domain = 'cover';
  _domain(): EntityDomain {
    return 'cover';
  }

  /**
   * Shortcut to set service to close_cover.
   * @returns
   */
  close(): this {
    this._payload.service = 'close_cover';
    return this;
  }

  /**
   * Shortcut to set service to open_cover.
   * @returns
   */
  open(): this {
    this._payload.service = 'open_cover';
    return this;
  }

  stop(): this {
    this._payload.service = 'stop_cover';
    return this;
  }
}
