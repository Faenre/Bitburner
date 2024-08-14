/**
 * Buys the given skill from the Bladeburner store whenever it's possible to do so.
 *
 * @param {NS} ns
 * @arg {string} ns.args.0 The bladeburner thing to buy
 * */
export async function main(ns: NS) {
  const skill = String(ns.args[0]);
  const canBuy = (skillPoints: number, count: number) => skillPoints > ns.bladeburner.getSkillUpgradeCost(skill, count);
  const getMaxUpgrade = (sp: number, i=1) => canBuy(sp, i) ? (getMaxUpgrade(sp, i+1) || i) : false;
  do {
    const sp = ns.bladeburner.getSkillPoints();
    const upgradeCount = getMaxUpgrade(sp, 1);
    if (upgradeCount)
      ns.bladeburner.upgradeSkill(skill, upgradeCount);
  } while (await ns.bladeburner.nextUpdate());
}

