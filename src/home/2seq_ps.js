import { hwgwForRam, hwgwForH, getTimes } from './lib/batching';
import { RamPool } from './threadpool'; // @TODO move to libs
import { newSpinner, segmentBar, TerminalUI } from './lib/textui';
import { bold, colorize } from './lib/textutils';

const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";
// const HACK = "toolbox/sequence_h.js";
// const GROW = "toolbox/sequence_g.js";
// const WEAKEN = "toolbox/sequence_w.js";

const DELAY_MS = 24;
/**
 * Calculates the times that are necessary to run different threads,
 * then sequences them.
 *
 * Requires Formulas API.
 *
 * In the BB community this is known as a Batcher.
 *
 * @param {NS} ns
 * @arg {String} target hostname
 */
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail();
  const target = ns.args[0];
	ns.killall(target);
	installScripts(ns);

	const progressBar = segmentBar(40);
	const spinner = newSpinner();
	const log = new TerminalUI(ns);
	while (true) {
		const serverData = ns.getServer(target);
		if (serverData.moneyMax == 0) return;
		const payoutPerBatch = (h) => ns.hackAnalyze(target) * h * serverData.moneyMax;
		const times = getTimes(ns, target);
		const pservs = RamPool.fromPServs(ns);
		// const threads = calcThreads(ns, target);
		// const maxBatches = Math.floor(times.w / (DELAY_MS + 10)) - 2;
		// const threads = hwgwForRam(ns, pservs.totalRamFree() / maxBatches, target, 1);
		const [threads, maxBatches] = getThreadsAndBatches(ns, pservs.totalRamFree(), times, serverData);
		if (!threads) {
			ns.print(`ERROR threadcount is nil`);
			return;
		}
		const expectedPayout = bold(ns.formatNumber(payoutPerBatch(threads.h) * maxBatches))

		log.add(`INFO thread counts are ${JSON.stringify(threads)}`);
		log.add(`INFO batch count is ${bold(maxBatches)}`);
		log.add(`INFO payout is ~\$${bold(ns.formatNumber(payoutPerBatch(threads.h)))} per batch`);
		log.add(`INFO Expected total payout: ${expectedPayout} in ~${ns.tFormat(times.w + maxBatches*DELAY_MS)}`);
		log.add(' ');

		const stockInverter = inverter();
		const scriptDelays = scriptDelayPairs(times, threads, stockInverter);
		// @todo implement this with a timer
		const timeAtStart = Date.now();
		for (let i = 0; i < maxBatches-3; i++) {
			if (Date.now() - timeAtStart > times.w - DELAY_MS * 2) {
				log.add(`WARNING exiting early at ${i}/${maxBatches} batches`);
				log.add('');
				break;
			}
			sequenceThreads(target, scriptDelays, pservs);
			// if (i % 5 === 0) {
			if (Math.round(i % (1e3 / DELAY_MS)) === 0) {
				log.replace(colorize(`${progressBar((i+1)/maxBatches)} (${i+1}/${maxBatches})`, 'white'), 0);
			} else if (i === maxBatches-3) {
				log.replace(colorize(`${progressBar(1)} (${maxBatches}/${maxBatches})`, 'white'), 0);
			}
			await ns.sleep(DELAY_MS);
		}

		// Add some G's and W2's at the end for incidental repairs.
		// @TODO pre-allocate # threads to repair from $0.00 and 100 sec
		const repairThreads = {h: 0, w1: 0, g: threads.g * 2, w2: 100};
		const repairDelays = scriptDelayPairs(times, repairThreads, stockInverter);
		sequenceThreads(target, repairDelays, pservs);

		log.replace(colorize(`${progressBar(1)} (${maxBatches}/${maxBatches})`, 'white'), 0);
		const timeToWait = times.w + 10e3;
		log.add(`SUCCESS Batching complete! Waiting ${ns.tFormat(timeToWait)} for cooldown...`);
		log.add('');
		for (let time = timeToWait; time > 0; time -= 1e3) {
			log.replace(`${progressBar((timeToWait - time) / timeToWait)} ${spinner()}`, 0);
			log.render();
			await ns.sleep(1e3);
		}
	}
}

function sequenceThreads(target, scriptDelays, rampool) {
	for (let [script, ramPerThread, threadCount, msDelay, affectStocks] of scriptDelays) {
		if (threadCount < 1) continue;
		rampool.assignThreads(script, ramPerThread, threadCount, [target, msDelay, affectStocks]);
		// await ns.sleep(1);
	}
}

const scriptDelayPairs = (times, threads, stockInverter) =>
	[
		[HACK,   1.70, threads.h, times.w  - times.h + 0, stockInverter === 0],
		[WEAKEN, 1.75, threads.w1, times.w - times.w + 6, 1],
		[GROW,   1.75, threads.g, times.w  - times.g + 12, stockInverter === 1],
		[WEAKEN, 1.75, threads.w2, times.w - times.w + 18, 1],
	];

// switches between 0 and 1 with each call
const inverter = ((i) => () => i ^= 1)(1)

function getThreadsAndBatches(ns, ramFree, times, server) {
	const maxBatches = Math.floor(times.w / (DELAY_MS + 10)) - 2;
	const batchedThreads = hwgwForRam(ns, ramFree / maxBatches, server, 1);

	if (batchedThreads)
		return [batchedThreads, maxBatches];

	const singleBatch = hwgwForH(ns, 1, server, ns.getPlayer());
	const numBatches = Math.floor(ramFree / singleBatch.ram);
	return [singleBatch, numBatches];
}
function installScripts(ns) {
	const pservs = RamPool.fromPServs(ns);
	[HACK, WEAKEN, GROW].forEach(script => pservs.installScript(script));
}
