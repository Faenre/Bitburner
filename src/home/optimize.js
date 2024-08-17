import { bold, underline, colorizeBG } from './lib/textutils'

const GROW_SCRIPT = 'toolbox/grow1.js';
const WEAKEN_SCRIPT = 'toolbox/weaken1.js';
const RAM_NEEDED_PER_SCRIPT = 1.75;

/**
 * This will use all available RAM to run growth and weakens.
 *
 * @TODO add grow limiter
 *
 * @param {NS} ns
 * @param {String} target hostname
 * */
export async function main(ns) {
  const target = ns.args[0];
  const home = ns.getServer();
	const targetServer = ns.getServer(target);
	const player = ns.getPlayer();

  const ramFree = home.maxRam - home.ramUsed;
  const threads = Math.floor(ramFree / RAM_NEEDED_PER_SCRIPT);

	const wSec = ns.weakenAnalyze(1, home.cpuCores);

  const weakeners = Math.floor(99 / wSec);
  const growers = threads - weakeners;

  const gPID = ns.run(GROW_SCRIPT, growers, target);
  const wPID = ns.run(WEAKEN_SCRIPT, weakeners, target);

	const gTime = ns.formulas.hacking.growTime(targetServer, player);
	const wTime = ns.formulas.hacking.weakenTime(targetServer, player);

	ns.tprint(`INFO ${colorizeBG('PID ' + gPID, 'black')}: Growing ${bold(growers)} threads in ${underline(ns.tFormat(gTime))}`);
	ns.tprint(`INFO ${colorizeBG('PID ' + wPID, 'black')}: Weakening ${bold(weakeners)} threads in ${underline(ns.tFormat(wTime))}`);
}
