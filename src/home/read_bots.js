import { colorize } from './lib/textutils';

/** @param {NS} ns */
export async function main(ns) {
  const nodes = ns.read('bots.txt').trim().split("\n");
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
  const monetary = `\$${money} (${difficulty}*s, ${growth}*g)`.padEnd(25);
  const hardware = `${ram} memory, ${cores} cores`
  return [name, monetary, hardware].join(' | ');
}

function coloredHostname(server) {
	colorize(server.name, serverColor(server));
}

function serverColor(server) {
	if (server.hostname == 'home') return 'green';
	if (server.backdoorInstalled) return 'green';
	if (server.hasAdminRights) return 'cyan';
	return 'red';
}
