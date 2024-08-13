const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";

/** 
 * Sequences HGW threads to arrive one after another, within a total span of 20ms.
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} (optional) 'h' threads
 * @arg {Number} (optional) 'w1' threads
 * @arg {Number} (optional) 'g' threads
 * @arg {Number} (optional) 'w2' threads
 * */
export async function main(ns) {
	const target = ns.args[0];
	const threads = {
		'h': ns.args[1],
		'w1': ns.args[2],
		'g': ns.args[3],
		'w2': ns.args[4],
	};

	ns.print(`INFO preparing to sequence ${threads.h}, ${threads.w1}, ${threads.g}, ${threads.w2}`);

	if (!verifyRamAvailable(ns, threads)) {
		ns.toast(`Not enough RAM! Cannot sequence ${target} with ${threads}`, 'error', 2000);
		return;
	}

	await sequenceThreads(ns, target, threads);
}


// threads has {h, g, w1, w2}
async function sequenceThreads(ns, target, threads) {
	const weakenTime = ns.getWeakenTime(target);
	const growTime = ns.getGrowTime(target);
	const hackTime = ns.getHackTime(target);
	const maxTime = Math.max(weakenTime, growTime, hackTime);
	const hDelay = maxTime  - hackTime   + 0;
	const w1Delay = maxTime - weakenTime + 5;
	const gDelay = maxTime  - growTime   + 10;
	const w2Delay = maxTime - weakenTime + 15;

	const scriptDelayPairs = [
		[HACK,   hDelay, threads.h],
		[GROW,   gDelay, threads.g],
		[WEAKEN, w1Delay, threads.w1],
		[WEAKEN, w2Delay, threads.w2],
	];

	for (let [script, msDelay, threadCount] of scriptDelayPairs) {
		ns.run(script, threadCount, target, msDelay);
	}
}

	// let timeSpentWaiting = 0;
	// for (let d of scriptDelayPairs) {
	// 	const [script, delay, numThreads] = d;
	// 	ns.print(`INFO waiting ${Math.ceil(delay - timeSpentWaiting)}ms for ${script}...`);
	// 	await ns.sleep(delay - timeSpentWaiting);
	// 	timeSpentWaiting += delay;
	// 	// ns.print(`INFO now running ${script} x ${numThreads}`);
	// 	ns.run(script, numThreads, target);
	// }
// }

function verifyRamAvailable(ns, threads) {
	const ramNeeded = (1.7 * threads.h) + (1.75 * (threads.g + threads.w));
	const ramAvailable = ns.getServerMaxRam('home') - ns.getServerUsedRam('home'); // TODO
	return ramNeeded < ramAvailable;
}