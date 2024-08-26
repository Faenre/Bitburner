import { Status } from '../StatusCodes';
import { getSleeveInfos } from '../../lib/Sleeve';

/**
 * Returns information regarding all sleeves and their current tasks.
 *
 * */
export default function(ns: NS, data: object): [Status, object] {
  try {
    const sleeves = getSleeveInfos(ns, data['numSleeves'] || 8);
    const safeSleeves = JSON.parse(JSON.stringify(sleeves))
    return [Status.OK, {sleeves: safeSleeves}];
  } catch {
    return [Status.PRECONDITION_FAILED, {}]
  }
}
