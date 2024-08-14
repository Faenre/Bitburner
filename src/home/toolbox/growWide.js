import { getHackableServers } from "../lib/servers";

const HOME = 'home';
const GROW_RAM_SIZE = 1.75;
const GROW_SCRIPT = 'toolbox/grow1.js';

/** @param {NS} ns */
export async function main(ns) {
  const hosts = getHackableServers(ns);
	const home = ns.getServer()
	const cores = home.cpuCores;
	let serverCount = 0;
	let threadCount = 0;
	for (let host of hosts) {
		const server = ns.getServer(host);
		const current = server.moneyAvailable;
		const maximum = server.moneyMax;
		if (current >= maximum * 0.8) continue;
		const growThreadsNeeded = Math.ceil(ns.growthAnalyze(host, maximum/current + 1, cores));

		// do we have enough ram for the # threads?
		const maxGrowThreads = Math.floor((ns.getServerMaxRam(HOME) - ns.getServerUsedRam(HOME)) / GROW_RAM_SIZE);
		const growThreadsToUse = Math.min(maxGrowThreads, growThreadsNeeded);

		if (!growThreadsToUse) continue;
		ns.run(GROW_SCRIPT, growThreadsToUse, host);
		serverCount += 1;
		threadCount += growThreadsToUse;
	}
	ns.toast(`Currently growing ${threadCount} threads on ${serverCount} servers.`, 'info', 5000);
}
