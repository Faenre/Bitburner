/**
 * Performs the Incite Violence bladeburner activity, pausing to perform Diplomacy
 * when needed.
 *
 * At 100k Charisma, for any real number of city chaos, it can be repaired in 1 cycle.
 * However, in 2.6.2 there is a bug in which chaos can reach Infinity.
 * This is fixed in the /dev branch, but for now, this script is necessary.
 *
 * @param {NS} ns
 * @arg {string} ns.args.0 The bladeburner skill to buy
 * */
export async function main(ns: NS) {
  while (await ns.bladeburner.nextUpdate())
    ns.bladeburner.startAction('General', getAction(ns));
}

const CHAOS_THRESHOLD = 1e50;
const getAction = (ns: NS): string => (
  ns.bladeburner.getCityChaos(ns.bladeburner.getCity()) > CHAOS_THRESHOLD
  ? 'Diplomacy'
  : 'Incite Violence'
);
