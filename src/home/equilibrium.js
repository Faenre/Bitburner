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
	const server_data = JSON.parse(ns.read('server_data.json'));
  const host = ns.args[0] || server_data.hostname;
  const ramHost = ns.args[1] ? host : ns.getHostname();
  ns.killall(host, true);

  const threads = calcThreads(ns, host, ramHost);

  ns.print('Thread counts: ' + threads);

  while (true) {
    await launch(ns, host, threads, ramHost);
    await ns.sleep(ns.getWeakenTime(host) + 500);
  }
}

function calcThreads(ns, host, ramHost, hacks = 1) {
  const hackPct = hacks * ns.hackAnalyze(host);

  const threads = {};
  threads['hack'] = hacks;
  threads['grow'] = Math.ceil(ns.growthAnalyze(host, 1 / (1 - hackPct)));
  threads['weaken'] = countWeakens(threads['hack'], threads['grow']);

  if (!enoughMemoryForThreads(ns, ramHost, threads))
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
  const ramNeeded = (threads['hack'] * 1.7) + (threads['grow'] * 1.75) + (threads['weaken'] * 1.75);

  return ramAvailable >= ramNeeded;
}

async function launch(ns, host, threads, ramHost) {
  const retries = Math.floor(ns.getGrowTime(host) / ns.getHackTime(host));
  for (let script of ['hack', 'grow', 'weaken']) {
		if (threads[script] == 0) continue;
    await ns.exec(
      SCRIPTS[script],  // script to run
      ramHost,
      threads[script],  // how many threads
      // Script args:
      host,             // target hostname
      retries,          // number of retries (for hack %)
    );
  }
}