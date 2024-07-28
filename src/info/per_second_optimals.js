/** 
 * Checks all servers in the game and compares at current player skill values
 * which servers offer how much xp/sec and $/sec.
 * 
 * Requires the Formulas API to use.
 * 
 * @param {NS} ns 
 * @arg {Boolean} whether to include non-rooted servers (default false)
 * */
export async function main(ns) {
  const includeNonRooted = ns.args[0];
  const player = ns.getPlayer();
  ns.disableLog('scan');
  ns.tail();

  // pt 1, list all servers
  const servers = getAllServers(ns)
    .map(s => ns.getServer(s))                          // turn hostnames into server references
    .filter(s => s.moneyMax)                            // remove unhackable servers
    .filter(s => includeNonRooted || s.hasAdminRights)  // filter on admin rights (unless overridden)
    .sort((a, b) => a.moneyMax - b.moneyMax);

  // pt 2, set server mocks to optimal conditions
  servers.forEach(s => s.hackDifficulty = s.minDifficulty);
  servers.forEach(s => s.moneyAvailable = s.moneyMax);

  // pt 3, get xp/sec
  const expPerSecond = (server) => ns.formulas.hacking.hackExp(server, player) / ns.formulas.hacking.growTime(server, player) * 1000;
  // pt 4, get $/sec
  const moneyPerSecond = (server) => moneyPerThread(server) / ns.formulas.hacking.weakenTime(server, player) * 1000;
  const moneyPerThread = (server) => server.moneyMax * ns.formulas.hacking.hackPercent(server, player);

  // @TODO: clean this up some
  servers.forEach(server => {
    const paddedName = server.hostname.padEnd(20);
    const xpPerSec = `${ns.formatNumber(expPerSecond(server)).padStart(8)} xp/sec`;
    const moneyPerSec = `${ns.formatNumber(moneyPerSecond(server)).padStart(8)} \$/sec`;
    ns.print([paddedName, xpPerSec, moneyPerSec].join('  |  '))
  });
}

function getAllServers(ns, host = 'home') {
  return ns.scan(host)
    .slice(host === 'home' ? 0 : 1)
    .reduce((acc, conn) => acc.concat(getAllServers(ns, conn)), [host]);
}
