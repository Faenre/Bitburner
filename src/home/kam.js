const CORES = 1; // rented servers always have 1 core

/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	
	ns.tprint(calcThreads(ns, target))
}

function calcThreads(ns, target) {
	const player = ns.getPlayer();
	const server = ns.getServer();
	const ramAvailable = () => server.maxRam - server.ramUsed;

	// how many wThreads do we need (assume worst case 1.00 security)
	const wThreads = wThreadsForTarget(ns, target);

	// how many hThreads do we need:
	const hPct = ns.hackAnalyze(target);
	const hParallels = Math.ceil(1 / ns.hackAnalyzeChance(target)); 
	const hThreadsForPct = (pct) => Math.floor(pct / hPct) * hParallels;

	// find how high of a growth we can get
	// returns [gThreads, hThreads]
	function getHighestViableGrowth(gThreads=100) {
		const growPct = ns.formulas.hacking.growPercent(server, gThreads, player, CORES);
		const hThreads = hThreadsForPct(1 - (1 / growPct));
		if (threadsRamUsage(hThreads, wThreads, gThreads) > ramAvailable())
			return false;
		return getHighestViableGrowth(gThreads + 100) || [hThreads, gThreads];
	}
	
	const [hThreads, gThreads] = getHighestViableGrowth();

	return {
		hThreads,
		hParallels,
		gThreads,
		wThreads,
	};
}

function wThreadsForTarget(ns, target) {
	const minSec = ns.getServerMinSecurityLevel(target);
	const wSingleThread = ns.weakenAnalyze(1, CORES);
	return Math.ceil((100 - minSec) / wSingleThread);
}

function threadsRamUsage(h,w,g) {
	return (0.7 * h) + (0.75 * (w + g));
}
