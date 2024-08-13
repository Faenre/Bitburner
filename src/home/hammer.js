const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";

const PCT_TO_TAKE = 0.70; // 

// REQUIRES FORMULAS API

/** 
 * @param {NS} ns 
 * @arg {String} target hostname
 */
export async function main(ns) {
	// const server_data = JSON.parse(ns.read('server_data.json'));
	// const server_data = JSON.parse(ns.read(`/servers/${target}.json`));
  const target = ns.args[0];
	const server_data = JSON.parse(ns.read(`/servers/${target}.json`));
	if (server_data.moneyMax == 0) return;

  const threads = calcThreads(ns, target);
	if (!verifyRamAvailable(ns, threads)) {
		ns.toast(`Not enough RAM! Cannot Hammer against ${target}.`, 'error', 10000);
		return;
	}
	const weakenTime = ns.getWeakenTime(target);
	const growTime = ns.getGrowTime(target);
	const hackTime = ns.getHackTime(target);
	const hackAttempts = Math.floor(growTime / hackTime);

  ns.print('INFO: Thread counts: ' + threads);
  ns.print('INFO: Weaken duration: ' + weakenTime);

  while (true) {
		const stock = hasStock(ns, server_data);
		// Per "hammer" strategy, launch multiple simultaneous hacks (separated briefly):
		for (let i = 0; i < threads.hp; i++) {
			ns.run(HACK, threads.h, target, hackAttempts, !stock);
			await ns.sleep(10000);
		}
		ns.run(WEAKEN, threads.w, target);
		// await ns.sleep(weakenTime - growTime - 1000);
		ns.run(GROW,   threads.g, target, stock);

		// Every 2 seconds, check the server to see if a hack was successful.
		// We don't want 2 hacks to actually succeed back to back!
		for (let t = weakenTime; t > 0; t -= 2000) {
			if (ns.getServerMoneyAvailable(target) < (server_data.moneyMax * .9))
				ns.kill(HACK, 'home', target, hackAttempts, !stock);
			await ns.sleep(2000);
		}
  }
}

function calcThreads(ns, target) {
	const cpuCores = ns.getServer().cpuCores;
	const player = ns.getPlayer();
	const server = ns.getServer(target);

	const hThreads = Math.floor(PCT_TO_TAKE / ns.hackAnalyze(target));
	const hParallels = Math.ceil(1 / ns.hackAnalyzeChance(target));

	let gThreads = 10;
	while (ns.formulas.hacking.growPercent(server, gThreads, player, cpuCores) < (1 / (1-PCT_TO_TAKE)))
		gThreads += 10;

	const minSec = ns.getServerMinSecurityLevel(target);
	const wSingleThread = ns.weakenAnalyze(1, cpuCores);
	const wThreads = Math.ceil((100 - minSec) / wSingleThread);

	return {
		"h": hThreads,
		"hp": hParallels,
		"g": gThreads,
		"w": wThreads,
	};
}

function verifyRamAvailable(ns, threads) {
	const ramNeeded = (1.7 * threads.h * threads.hp) + (1.75 * (threads.g + threads.w));
	const ramAvailable = ns.getServerMaxRam('home') - ns.getServerUsedRam('home'); // TODO
	return ramNeeded < ramAvailable;
}

// experimental

function hasStock(ns, serverInfo) {
	const targetOrg = serverInfo.organizationName;
	const stocks = ns.stock.getSymbols();
	for (let sym of stocks)
		if (targetOrg === ns.stock.getOrganization(sym))
			return !!ns.stock.getPosition(sym)[0]
	return false;
}