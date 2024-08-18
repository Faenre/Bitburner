import { Status } from '../StatusCodes';
import { getSleeveInfos } from '../../lib/Sleeve';

/**
 * Returns information regarding all sleeves and their current tasks.
 *
 * */
export default function(ns: NS, data: object): [Status, object] {
  try {
    const sleeves = getSleeveInfos(ns, data['numSleeves']);
    return [Status.OK, {sleeves}];
  } catch {
    return [Status.PRECONDITION_FAILED, {}]
  }
}
