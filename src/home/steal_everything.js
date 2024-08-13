const HACK_SCRIPT = 'toolbox/hack1.js';

/** @param {NS} ns */
export async function main(ns) {
	const hosts = ns.read('bots.txt').trim().split('\n');
	
	for (let host of hosts) { 
		const hPct = ns.hackAnalyze(host);
		const hThreads = Math.ceil(1/hPct);
		const parallelProcesses = Math.ceil(1 / ns.hackAnalyzeChance(host));

		for (let i=0; i < parallelProcesses; i++)
			ns.run(HACK_SCRIPT, hThreads, host, 100);
	}
}