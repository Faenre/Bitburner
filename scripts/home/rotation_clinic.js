/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  const hosts = ns.read('bots.txt').trim().split("\n");

  while (true) {
    for (host of hosts) {
      while (ns.getServerMoneyAvailable(host) < ns.getServerMaxMoney(host)) {
        await ns.grow(host);
        await ns.weaken(host);
      }
    }
  }
}