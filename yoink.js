/*
 This script requires 2.00GB of RAM to run for 1 thread(s)
  1.60GB | baseCost (misc)
  0.15GB | grow (fn)
  0.15GB | weaken (fn)
  0.10GB | hack (fn)
 */

/** 
 * This single-node script aims for optimum money farming.
 * 
 * At the start, it grows up to the server maximum, then it calculates
 * how many growths are necessary per batch of hacks. It then uses this
 * to minimize the number of growths and weakens, and maximize the 
 * number of hacks.
 * 
 * The hostname file must either be set, or set to an argument, or it won't run.
 * 
 * @param {NS} ns
 * */
export async function main(ns) {
  const host = ns.args[0] || await ns.read('hostname.txt');
  const threads = Math.floor(await ns.read('total_ram.txt') / 2)

  while (true) {
    await growToMax(ns, host);
    await harvestCycle(ns, host, threads);
  }
}

async function growToMax(ns, host, iterations=0) {
  const growth = await ns.grow(host);
  if (growth == 1.000) return;

  iterations += 1;
  while (iterations >= 12.5) {
    await ns.weaken(host);
    iterations -= 12.5;
  }

  return await growToMax(ns, host, iterations);
}


async function harvestCycle(ns, host, threads, iterations=0) {
  const totalThreads = threads * iterations;
  if (totalThreads > 25) {
    for (let i=0; i < (totalThreads / 25); i++)
      await ns.weaken(host);
    return;
  }

  await ns.hack(host);
  await harvestCycle(ns, host, threads, iterations + 1);
}
