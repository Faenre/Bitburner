import { getHackableServers } from "./lib/servers";
/**
 * Reads the currently-rooted servers and returns information about them.
 *
 * @TODO add an 'all' tag
 *
 * @param {NS} ns
 * */
export async function main(ns) {
  const nodes = getHackableServers(ns);
  const servers = nodes
    .map(node => ns.getServer(node))
    .sort((a, b) => a.moneyMax - b.moneyMax);
  for (let server of servers) {
    ns.print(serverDescription(ns, server));
  }
	ns.tail();
}

function serverDescription(ns, server) {
  const host = server.hostname;
  const money = ns.formatNumber(server.moneyMax, 2);
  const difficulty = server.minDifficulty;
  const cores = server.cpuCores;
  const backdoor = server.backdoorInstalled;
  const ram = server.maxRam;
  const growth = server.serverGrowth;

  const name = `[${backdoor ? 'B' : ' '}] ${host}: `.padEnd(25);
  const monetary = `$${money} (${difficulty}*s, ${growth}*g)`.padEnd(25);
  const hardware = `${ram} memory, ${cores} cores`
  return [name, monetary, hardware].join(' | ');
}
