/**
 * Buys the given skill from the Bladeburner store whenever it's possible to do so.
 *
 * @param {NS} ns
 * @arg {string} ns.args.0 The bladeburner skill to buy
 * */
export async function main(ns: NS) {
  do {
    const skill = String(ns.args[0])
    for (let i=1; ns.bladeburner.getSkillPoints() > ns.bladeburner.getSkillUpgradeCost(skill, i); i *= 10)
      ns.bladeburner.upgradeSkill(skill, i);
  } while (await ns.bladeburner.nextUpdate());
}

