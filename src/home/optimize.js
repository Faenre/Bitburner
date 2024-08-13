import { bold, underline, colorizeBG } from './lib/textutils'

const GROW_SCRIPT = 'toolbox/grow1.js';
const WEAKEN_SCRIPT = 'toolbox/weaken1.js';

/**
 * This will use all available RAM to run growth and weakens.
 *
 * @TODO use multipliers to determine weaken needs
 * @TODO limit weaken to maximum to take server from 100 to secMinimum
 * @TODO tprint PIDs, threads, and times-to-complete
 *
 * @param {NS} ns
 * @param {String} target hostname
 * */
export async function main(ns) {
  const target = ns.args[0];
  const home = ns.getServer();
	const targetServer = ns.getServer(target);
	const player = ns.getPlayer();

  const ramFree = home.maxRam - home.ramUsed;// + ns.getScriptRam('optimize.js');
  const ramNeeded = 1.75;
  const threads = Math.floor(ramFree / ramNeeded);

	const wSec = ns.weakenAnalyze(1, home.cpuCores);

  // 12.5 growers need 1 weaken
  const growers = Math.floor(threads / 13.5 * 12.5);
  const weakeners = Math.min(threads - growers, Math.floor((100 - targetServer.minDifficulty) / wSec));

	const gTime = ns.formulas.hacking.growTime(targetServer, player);
	const wTime = ns.formulas.hacking.weakenTime(targetServer, player);

	// const gSec = ns.growthAnalyzeSecurity(Math.floor(ramFree / ramNeeded))

  const gPID = ns.run(GROW_SCRIPT, growers, target);
  const wPID = ns.run(WEAKEN_SCRIPT, weakeners, target);

	ns.tprint(`INFO PID ${colorizeBG(gPID, 'black')}: Growing ${bold(growers)} threads in ${underline(ns.tFormat(gTime))}`);
	ns.tprint(`INFO PID ${colorizeBG(wPID, 'black')}: Weakening ${bold(weakeners)} threads in ${underline(ns.tFormat(wTime))}`);
}
