// const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";
const SEQUENCER = 'toolbox/sequencehgw.js';

const PCT_TO_TAKE = 0.90; // 

// REQUIRES FORMULAS API

/** 
 * @param {NS} ns 
 * @arg {String} target hostname
 */
export async function main(ns) {
	ns.tprint('ERROR you probably meant to use 2sequence. aborting');
	return;
	// const server_data = JSON.parse(ns.read('server_data.json'));
	// const server_data = JSON.parse(ns.read(`/servers/${target}.json`));
  const target = ns.args[0];
	const server_data = JSON.parse(ns.read(`/servers/${target}.json`));
	if (server_data.moneyMax == 0) return;

  const threads = calcThreads(ns, target);

  while (true) {
		const weakTime = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
		const sequences = Math.floor(weakTime / 2000);
		for (let i = 0; i < sequences; i++) {
			ns.print(`INFO starting sequence ${i}/${sequences}`);
			ns.run(SEQUENCER, 1, target, threads.h, threads.g, threads.w);
			await ns.sleep(2000);
		}
		ns.print(`SUCCESS batch done, pausing to let them all finish`)
		ns.run(GROW, threads.g, target);
		ns.run(WEAKEN, threads.w, target);
		await ns.sleep(weakTime);
	};
}

function calcThreads(ns, target) {
	const cpuCores = ns.getServer().cpuCores;
	const player = ns.getPlayer();
	const server = optimalServer(ns, target);

	const hThreads = Math.floor(PCT_TO_TAKE / ns.formulas.hacking.hackPercent(server, player));

	// let gThreads = 10;
	// while (ns.formulas.hacking.growPercent(server, gThreads, player, cpuCores) < 2 + (1 / (1-PCT_TO_TAKE)))
	// 	gThreads += 10;
	const gThreads = Math.ceil(ns.growthAnalyze(target, 1 + (1/(1-PCT_TO_TAKE)), cpuCores) * 1.5);

	// const wSingleThread = ns.weakenAnalyze(1, cpuCores);
	// // TOO MUCH MEMORY, NEED TO REDO
	// const minSec = ns.getServerMinSecurityLevel(target);
	// const wThreads = Math.ceil((100-minSec) / wSingleThread);
	const hSec = ns.hackAnalyzeSecurity(hThreads, target);
	const gSec = ns.growthAnalyzeSecurity(gThreads, target, cpuCores);
	// const wThreads = Math.ceil((hSec + gSec) / wSingleThread);
	let wThreads = 10;
	while (ns.weakenAnalyze(wThreads, cpuCores) < (hSec + gSec))
		wThreads += 10;

	return {
		"h": hThreads,
		"g": gThreads,
		"w": wThreads,
	};
}

const optimalServer = (ns, target) => {
	const server = ns.getServer(target);
	server.moneyAvailable = server.moneyMax;
	server.hackDifficulty = server.minDifficulty;
	return server;
}