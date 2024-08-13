const HACK = 'toolbox/hack1.js';
const GROW = 'toolbox/grow1.js';
const WEAKEN = 'toolbox/weaken1.js';
// const G_THREADS = 275000;
const H_THREADS = 10000;//5000;
const G_THREADS = 60000;
const W_THREADS = 200;//10000;

/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	const weakenTime = () => ns.getWeakenTime(target);
	const ramAvail = () => ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
	const gThreads = () => Math.floor((ramAvail() - (1.7 * H_THREADS) - (1.75 * W_THREADS)) / 1.75);
	do {
		const growThreads =
		ns.run(HACK, H_THREADS, target);
		ns.run(GROW, gThreads(), target);
		ns.run(WEAKEN, W_THREADS, target);
	} while (await ns.sleep(weakenTime()));
}