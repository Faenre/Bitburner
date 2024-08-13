import { hwgwForRam, hwgwForH, getTimes } from './lib/batching';
import { segmentBar, newSpinner, TerminalUI } from './lib/textui';
import { bold, colorize } from './lib/textutils';

const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";
const SEQUENCER = 'toolbox/sequencehgw.js';

const PCT_TO_TAKE = 0.90; //@TODO automate this
const DELAY_MS = 30;

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

	const ramPerBatch = (thr) => (thr.h * 1.7) + ((thr.g + thr.w1 + thr.w2) * 1.75);

	const progressBar = segmentBar(30);
	const spinner = newSpinner();
	const log = new TerminalUI(ns);
	while (true) {
		const serverData = ns.getServer(target);
		const home = ns.getServer();
		const ramAvailable = home.maxRam - home.ramUsed;
		if (serverData.moneyMax == 0) return;

		const times = getTimes(ns, target);
		// const threads = calcThreads(ns, target);
		// const maxBatches = Math.floor(Math.min((times.w - times.h) / DELAY_MS, ramAvailable / ramPerBatch(threads)));

		// const maxBatches = Math.floor(times.w / (DELAY_MS + 10)) - 2;
		// const threads = hwgwForRam(ns, ramAvailable / maxBatches, serverData, home.cpuCores);

		const [threads, maxBatches] = getThreadsAndBatches(ns, ramAvailable, times, serverData);
		const recoveryThreads = { ...threads, h: 0, w2: 100 };
		const payoutPerBatch = ns.hackAnalyze(target) * threads.h * serverData.moneyMax;
		const expectedPayout = bold(ns.formatNumber(payoutPerBatch * maxBatches))

		log.add(`INFO thread counts are ${JSON.stringify(threads)}`);
		log.add(`INFO batch count is ${bold(maxBatches)}`);
		log.add(`INFO payout is ~\$${bold(ns.formatNumber(payoutPerBatch))} per batch`);
		log.add(`INFO Expected total payout: ${expectedPayout} in ~${ns.tFormat(times.w + maxBatches * DELAY_MS)}`);
		log.add(' ');
		const startTime = Date.now();
		for (let i = 1; i <= maxBatches-2; i++) {
			if (Date.now() - startTime > times.w - DELAY_MS*2) {
				log.add(`WARNING exiting early at ${i}/${maxBatches} batches`);
				log.add('');
				break;
			}
			sequenceThreads(ns, target, threads, times);

			if (Math.round(i % (1e3 / DELAY_MS)) === 0) {
				log.replace(colorize(`${progressBar((i+1)/maxBatches)} (${i+1}/${maxBatches})`, 'white'), 0);
			}

			await ns.sleep(DELAY_MS);
		}
		sequenceThreads(ns, target, recoveryThreads, times);

		const waitTime = times.w;// + 10e3
		log.replace(colorize(`${progressBar(1)} (${maxBatches}/${maxBatches})`, 'white'), 0);
		log.add(`SUCCESS Batching complete! Waiting ${ns.tFormat(waitTime)} for cooldown...`);
		log.add('');
		for (let time = waitTime; time > 0; time -= 1e3) {
			log.replace(`${progressBar((waitTime - time) / waitTime)} ${spinner()}`, 0);
			log.render();
			await ns.sleep(1e3);
		}
	}
}

function sequenceThreads(ns, target, threads, times) {
	const hDelay = times.w  - times.h   + 0;
	const w1Delay = times.w - times.w + 5;
	const gDelay = times.w  - times.g   + 10;
	const w2Delay = times.w - times.w + 15;

	const scriptDelayPairs = [
		[HACK,   hDelay, threads.h],
		[WEAKEN, w1Delay, threads.w1],
		[GROW,   gDelay, threads.g],
		[WEAKEN, w2Delay, threads.w2],
	];

	for (let [script, msDelay, threadCount] of scriptDelayPairs) {
		if (!threadCount) continue;
		ns.run(script, threadCount, target, msDelay);
		// await ns.sleep(1);
	}
}

function getThreadsAndBatches(ns, ramFree, times, server) {
	const maxBatches = Math.floor(times.w / (DELAY_MS + 10)) - 2;
	const batchedThreads = hwgwForRam(ns, ramFree / maxBatches, server, 1);

	if (batchedThreads)
		return [batchedThreads, maxBatches];

	const singleBatch = hwgwForH(ns, 1, server, ns.getPlayer());
	const numBatches = Math.floor(ramFree / singleBatch.ram);
	return [singleBatch, numBatches];
}
