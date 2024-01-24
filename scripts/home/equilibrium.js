const ORCHESTRATOR_RAM = 2.6;

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  const host = ns.args[0] || await ns.read('hostname.txt');
  await ns.killall(host, true);
  
  const threads = await calcThreads(ns, host);
// - figure out a sidecar launcher
  await ns.exec('orchestration.js', host, 1, threas.hack, threads.grow, threads.weaken);
}

async function calcThreads(ns, host, threads=null, hackThreads=0) {
  // given h...
  const hackPct = await ns.hackAnalyze(host) * hackThreads;
  const growThreads = Math.ceil(await ns.growthAnalyze(host, 1/(1-hackPct)));
  const weakenThreads = countWeakens(hackThreads, growThreads);
  const ramNeeded = countRamNeeded(hackThreads, growThreads, weakenThreads);
  const ramAvailable = await ns.getServerMaxRam(host);

  if (ramNeeded > ramAvailable) 
    return threads;
  const threads = {
    "hack": hackThreads,
    "grow": growThreads,
    "weaken": weakenThreads,
  }

  return calcThreads(ns, host, threads, hackThreads+1); //todo cleanup
}

function countWeakens(hacks, grows) {
  const hackSec = hacks * 0.002;
  const growSec = grows * 0.004;
  return Math.ceil((hackSec + growSec) / 0.05);
}

function countRamNeeded(h, g, w) {
  return (h * 1.7) + (g * 1.75) + (w * 1.75) + ORCHESTRATOR_RAM;
}