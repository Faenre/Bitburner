import { BladeCharacter, BladeHQ, City } from '../../lib/blade';
import { BLADE_ACTIONS, BladeAction } from '../../lib/BladeTask';
import { Status } from '../StatusCodes';

export interface BladeData {
  actions: BladeAction[];
  hq: BladeHQ;
  blades: BladeCharacter[];
  cities: City[];
  sleeveContractChances: Record<string, [[number, number]]>;
}
/**
 * Returns Bladeburner information.
 *
 * */
export default function(ns: NS, _data: object): [Status, object] {
  try {
    const actions = getActions(ns);
    const hq = new BladeHQ(ns);
    const blades = BladeCharacter.getBlades(ns);
    const cities = City.getCities(ns);
    const sleeveContractChances = getSleeveContractChances(ns);

    const safeData = JSON.parse(JSON.stringify({ actions, hq, blades, cities, sleeveContractChances }));

    return [Status.OK, safeData];
  } catch {
    return [Status.PRECONDITION_FAILED, {}]
  }
}

function getActions(ns: NS): BladeAction[] {
  return BLADE_ACTIONS.map((action: BladeAction) => ({
    ...action,
    countRemaining: ['Contracts', 'Operations'].includes(action.type) ? ns.bladeburner.getActionCountRemaining(action.type, action.name) : null,
    currentLevel: ['Contracts', 'Operations'].includes(action.type) ? ns.bladeburner.getActionCurrentLevel(action.type, action.name) : null,
    time: ns.bladeburner.getActionTime(action.type, action.name),
    successChances: ns.bladeburner.getActionEstimatedSuccessChance(action.type, action.name)
  }));
}

function getSleeveContractChances(ns: NS): Record<string, [[number, number]]> {
  const chances = {};
  const sleeveIds = [0, 1, 2, 3, 4, 5, 6, 7];
  for (const contract of ['Tracking', 'Bounty Hunter', 'Retirement'])
    chances[contract] = sleeveIds.map(
      (id) => ns.bladeburner.getActionEstimatedSuccessChance('Contracts', contract, id)
    );
  return chances;
}
