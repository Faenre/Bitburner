const HACK = "toolbox/hack1.js";
const GROW = "toolbox/grow1.js";
const WEAKEN = "toolbox/weaken1.js";

/** 
 * Sequences HGW threads to arrive one after another, within a total span of 1s.
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} (optional) 'h' threads
 * @arg {Number} (optional) 'g' threads
 * @arg {Number} (optional) 'w' threads
 * */
export async function main(ns) {
	const target = ns.args[0];
	const threads = {
		'h': ns.args[1],
		'g': ns.args[2],
		'w': ns.args[3],
	};

	ns.print(`INFO preparing to sequence ${threads.h}, ${threads.g}, ${threads.w}`);

	if (!verifyRamAvailable(ns, threads)) {
		ns.toast(`Not enough RAM! Cannot sequence ${target} with ${threads}`, 'error', 2000);
		return;
	}

	await sequenceThreads(ns, target, threads);
}


// threads has {h, g, w}
async function sequenceThreads(ns, target, threads) {
	const weakenTime = ns.getWeakenTime(target);
	const growTime = ns.getGrowTime(target);
	const hackTime = ns.getHackTime(target);
	const maxTime = Math.max(weakenTime, growTime, hackTime) + 800;
	const hDelay = maxTime - hackTime   - 800;
	const gDelay = maxTime - growTime   - 400;
	const wDelay = maxTime - weakenTime - 0; // this should be slowest but we force it anyway

	const scriptDelayPairs = [
		[HACK,   hDelay, threads.h],
		[GROW,   gDelay, threads.g],
		[WEAKEN, wDelay, threads.w],
	].sort((a, b) => a[1] - b[1]);

	let timeSpentWaiting = 0;
	for (let d of scriptDelayPairs) {
		const [script, delay, numThreads] = d;
		ns.print(`INFO waiting ${Math.ceil(delay - timeSpentWaiting)}ms for ${script}...`);
		await ns.sleep(delay - timeSpentWaiting);
		timeSpentWaiting += delay;
		// ns.print(`INFO now running ${script} x ${numThreads}`);
		ns.run(script, numThreads, target);
	}
}

function verifyRamAvailable(ns, threads) {
	const ramNeeded = (1.7 * threads.h) + (1.75 * (threads.g + threads.w));
	const ramAvailable = ns.getServerMaxRam('home') - ns.getServerUsedRam('home'); // TODO
	return ramNeeded < ramAvailable;
}