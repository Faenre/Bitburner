import { getHackableServers } from "../lib/servers";

const HOME = 'home';
const WEAK_RAM_SIZE = 1.75;
const WEAK_SCRIPT = 'toolbox/weaken1.js';

/** @param {NS} ns */
export async function main(ns) {
  const hosts = getHackableServers(ns);
	const home = ns.getServer()
	const cores = home.cpuCores;
	const weakenValue = ns.weakenAnalyze(1, cores);
	let serverCount = 0;
	let threadCount = 0;
	for (let host of hosts) {
		const minSec = ns.getServerMinSecurityLevel(host);
		const currentSec = 100;//ns.getServerSecurityLevel(host);

		// do we have enough ram for the # threads?
		const threadsAvailable = Math.floor((ns.getServerMaxRam(HOME) - ns.getServerUsedRam(HOME)) / WEAK_RAM_SIZE);
		const threadsNeeded = Math.ceil((currentSec - minSec)/weakenValue);
		const threadsActual = Math.min(threadsAvailable, threadsNeeded);

		if (!threadsActual) continue;
		ns.run(WEAK_SCRIPT, threadsActual, host);
		serverCount += 1;
		threadCount += threadsActual;
	}
	ns.toast(`Currently weakening ${threadCount} threads on ${serverCount} servers.`, 'info', 5000);
}
