import { hwgwForRam, hwgwDelays, getTimes } from './lib/batching';

const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";

const DELAY_MS = 24;
/**
 * @param {NS} ns
 * @arg {String} servername to target
 * */
export async function main(ns) {
	const target = ns.args[0];
	if (!target)
		return ns.tprint(`ERROR please specify target`);

	const targetServer = ns.getServer(ns.args[0]);
	const home = ns.getServer();
	const hwgw = hwgwForRam(ns, home.maxRam, targetServer, home.cpuCores);
	const wThreads = Math.ceil(99 / ns.weakenAnalyze(1, home.cpuCores));

	if (ns.formulas.hacking.hackPercent(targetServer, ns.getPlayer()) * hwgw.h < 1.00)
		return ns.tprint('ERROR home not ready for continuum.');

	do {
		const times = getTimes(ns, target);
		const delays = hwgwDelays(times);

		ns.run(HACK, hwgw.h, target, delays.h);
		ns.run(WEAKEN, wThreads, target, delays.w1);
		ns.run(GROW, hwgw.g, target, delays.g);
		ns.run(WEAKEN, wThreads, target, delays.w2);

	} while (await ns.sleep(DELAY_MS));
}
