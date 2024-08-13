const SCRIPTS = {
  "hack": "toolbox/hack1.js",
  "grow": "toolbox/grow1.js",
  "weaken": "toolbox/weaken1.js",
};

/** 
 * @param {NS} ns 
 * @arg {String} target hostname
 * @arg {Boolean} whether to use remote power. default false (local exec)
 */
export async function main(ns) {
	const serverData = JSON.parse(ns.read('server_data.json'));
  const host = serverData.hostname;
  ns.killall(host, true);

  do {
		const threads = calcThreads(ns, host, serverData);
		ns.print('INFO Thread counts: ' + threads);

    await launch(ns, host, threads);
  } while (await ns.sleep(ns.getWeakenTime(host)));
}

function calcThreads(ns, host, serverData, hacks = 1) {
  const hackPct = hacks * ns.hackAnalyze(host);

  const threads = {};
  threads.hack = hacks;
  threads.grow = Math.ceil(ns.growthAnalyze(host, 1 / (1 - hackPct)));
  threads.weaken = countWeakens(threads.hack, threads.grow);

  if (!enoughMemoryForThreads(ns, threads))
    return false;

  return calcThreads(ns, host, ramHost, hacks + 1) || threads;
}

function countWeakens(hacks, grows) {
  const hackSec = hacks * 0.002;
  const growSec = grows * 0.004;
  return Math.ceil((hackSec + growSec) / 0.05);
}

function enoughMemoryForThreads(ns, host, threads) {
  const ramAvailable = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  const ramNeeded = (threads.hack * 1.7) + ((threads.grow + threads.weaken) * 1.75);

  return ramAvailable >= ramNeeded;
}

async function launch(ns, target, threads) {
  const retries = Math.floor(ns.getGrowTime(target) / ns.getHackTime(target));
  for (let script of ['hack', 'grow', 'weaken']) {
    await ns.run(
      SCRIPTS[script],  // script to run
      threads[script],  // how many threads
      // Script args:
      target,           // target hostname
      retries,          // number of retries (for hack %)
    );
  }
}