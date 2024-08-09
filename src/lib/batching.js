import { clamp } from 'lib/math';

/**
 * Calculates the optimal HWGW threads within a given RAM budget.
 * 
 * @arg {NS} ns
 * @arg {Number} maxRam the maximum ram allocated per batch
 * @arg {String} target name of the server
 * @arg {Number} cores number of CPU cores on the server performing g/w
 */
export function hwgwForRam(ns, maxRam, server, cores=1) {
	const player = ns.getPlayer();
	server.moneyAvailable = server.moneyMax;

	const wSec = ns.weakenAnalyze(1, cores);
	// const hAmt = ns.hackAnalyze(target);
	const hPct = ns.formulas.hacking.hackPercent(server, player);

	function calcHwgw(h) {
		const hwgw = hwgwForH(ns, h, server, player, cores, wSec, hPct);
		if (hwgw.ram > maxRam) 
			return false;
		if (h * hPct >= 1.00)
			return hwgw;

		return calcHwgw(h + 1) || hwgw;
	}

	return calcHwgw(1);
}

/**
 * @param {NS} ns
 * @param {Number} h
 * @param {Server} server server object, from ns.getServer()
 * @param {Player} player player object, from ns.getPlayer()
 * @param {Number} [cores=1] number of cores to calculate for
 * @param {Number} [wSec] how much does 1 weaken thread do (this is memoized)
 * @param {Number} [hPct] how much does 1 hack thread do (this is memoized)
 */
export function hwgwForH(ns, h, server, player, cores=1, wSec=null, hPct=null) {
	cores ??= 1;
	wSec ??= ns.weakenAnalyze(1, cores);
	server.moneyAvailable = server.moneyMax;
	hPct ??= ns.formulas.hacking.hackPercent(server, player);

	server.moneyAvailable = server.moneyMax * clamp(0, 1, (1.00 - hPct * h));
	const g = ns.formulas.hacking.growThreads(server, player, server.moneyMax, cores) + 1;
	const w1 = Math.ceil(ns.hackAnalyzeSecurity(h, null) / wSec) + 1;
	const w2 = Math.ceil(ns.growthAnalyzeSecurity(g, null, cores) / wSec) + 1;
	
	return Hwgw(h, g, w1, w2);
}

// @TODO marked for deletion
const ramPerHwgw = (h, g, w1, w2) => Math.ceil((h * 1.7) + ((g + w1 + w2) * 1.75));

/**
 * Helper function that returns h, g, and w times, measured in ms.
 * 
 * @param {NS} ns
 * @param {String} target server name
 */
export function getTimes(ns, target) {
	return {
		h: ns.getHackTime(target),
		g: ns.getGrowTime(target),
		w: ns.getWeakenTime(target),
	}
}

/**
 * @param {Object} times
 * @param {Number} times.h
 * @param {Number} times.g
 * @param {Number} times.w
 */
export function hwgwDelays(times) {
	return {
		h: 	times.w - times.h + 0,
		w1: times.w - times.w + 6,
		g: 	times.w - times.g + 12,
		w2: times.w - times.w + 18,
	}
}

const Hwgw = (h, g, w1, w2) => ({
	h: h,
	g: g,
	w1: w1,
	w2: w2,
	ram: (h * 1.7) + ((g + w1 + w2) * 1.75),
});

