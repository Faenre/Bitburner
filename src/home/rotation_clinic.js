/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  const hosts = ns.read('bots.txt').trim().split("\n");

  while (true) {
    for (let host of hosts) {
			await ns.grow(host);
			await ns.weaken(host);
    }
  }
}