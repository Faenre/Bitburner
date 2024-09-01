/**
 * Buys the given skill from the Bladeburner store whenever it's possible to do so.
 *
 * @param {NS} ns
 * @arg {string} ns.args.0 The bladeburner skill to buy
 * */
export async function main(ns: NS) {
  while (await ns.bladeburner.nextUpdate())
    upgradeSkill(ns, 1);
}

const upgradeSkill = (ns: NS, i=1): boolean =>
  ns.bladeburner.upgradeSkill(String(ns.args[0]), i) && upgradeSkill(ns, i * 10);
