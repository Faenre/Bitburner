import { Status } from '../StatusCodes';

/**
 * Returns the current Stanek configuration.
 *
 * */
export default function(ns: NS, _data: object): [Status, object] {
  try {
    const fragments = ns.stanek
      .activeFragments()
      .filter(fragment => fragment.id < 100);
    return [Status.OK, {fragments}];
  } catch {
    // This should only ever fail if the user either doesn't have the
    // bitnode, or if the user doesn't have Stanek's Gift installed.
    //
    // Whichever cause should be immediately evident to the player,
    // so we're not going to worry about wasting RAM by troubleshooting.
    return [Status.PRECONDITION_FAILED, {}]
  }
}
