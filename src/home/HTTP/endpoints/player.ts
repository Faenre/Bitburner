import { Status } from '../StatusCodes';

/**
 * Returns Bladeburner information.
 *
 * */
export default function(ns: NS, _data: object): [Status, object] {
  try {
    return [Status.OK, ns.getPlayer()];
  } catch {
    return [Status.SERVER_ERROR, {}]
  }
}
