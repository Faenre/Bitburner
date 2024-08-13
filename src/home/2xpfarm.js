const SCRIPTS = {
	"hack": "toolbox/hack1.js",
	"grow": "toolbox/grow1.js",
	"weaken": "toolbox/weaken1.js",
};
const HOST = 'home';

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	const target = ns.args[0];
	const getWeakenTime = () => ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());

	while (true) {
		const threads = await calcHGW(ns, target);
		ns.print(`INFO launching the following threads: ${JSON.stringify(threads)}`)
		ns.run(SCRIPTS.hack, threads.h, target);
		ns.run(SCRIPTS.grow, threads.g, target);
		ns.run(SCRIPTS.weaken, threads.w, target);
		const weakenTime = getWeakenTime();
		ns.print(`Sleeping for ${expandMillis(weakenTime)}`);
		await ns.sleep(weakenTime);
	}
}

function calcHGW(ns, target, h = 1) {
	// given an h thread, how many g threads are necessary?
	const hPct = hTakePct(ns, target) * h;
	const g = gNeededForPct(ns, target, hPct);

	// given h + g, how many w threads are necessary?
	const w = wNeeded(ns, h, g);

	// do we have enough memory for it?
	const threads = { h, g, w }

	if (!hasEnoughRam(ns, threads))
		return false;
	return calcHGW(ns, target, h + 1) || threads;
}

function hTakePct(ns, target) {
	return ns.formulas.hacking.hackPercent(ns.getServer(target), ns.getPlayer());
}

function gNeededForPct(ns, target, pct) {
	const server = ns.getServer(target);
	server.moneyAvailable = server.moneyMax * (1 - pct);
	const player = ns.getPlayer();
	const cores = ns.getServer(HOST).cpuCores;
	return ns.formulas.hacking.growThreads(server, player, server.moneyMax, cores);
}

function wNeeded(ns, h, g) {
	const cores = ns.getServer().cpuCores;
	const hSec = ns.hackAnalyzeSecurity(h);
	const gSec = ns.growthAnalyzeSecurity(g, undefined, cores);
	const wSec = ns.weakenAnalyze(1, cores);
	return Math.ceil((hSec + gSec) / wSec);
}

const hasEnoughRam = (ns, t) => getRamAvailable(ns) - calcThreadsRam(t) > 0;
const getRamAvailable = (ns) => ns.getServerMaxRam(HOST) - ns.getServerUsedRam(HOST);
const calcThreadsRam = (t) => (1.7 * t.h) + (1.75 * (t.g + t.w));

function expandMillis(ms) {
	let seconds = Math.round(ms / 1000);
	let minutes = Math.floor(seconds / 60);
	seconds %= 60;
	let hours = Math.floor(minutes / 60);
	minutes %= 60;

	return [
		`${hours ? hours + 'h ' : ''}`,
		`${minutes ? minutes + 'm ' : ''}`,
		`${seconds ? seconds + 's ' : ''}`,
	].join('');
}