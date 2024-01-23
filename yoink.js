/*
 This script requires 2.00GB of RAM to run for 1 thread(s)
  1.60GB | baseCost (misc)
  0.15GB | grow (fn)
  0.15GB | weaken (fn)
  0.10GB | hack (fn)
 */

let NS;
let Host;
let Threads;

const GROW_SEC = 0.004;
const HACK_SEC = 0.002;
const WEAK_SEC = 0.050;

let SecurityBuildup = 0.000;

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
  NS = ns;
  Host = NS.args[0] || await NS.read('hostname.txt');
  Threads = Math.floor(await NS.read('total_ram.txt') / 2)

  while (true) {
    await growToMax();
    await resetSecurityBuildup();
    await harvestCycle();
  }
}


async function growToMax(iterations=0) {
  const growth = await doGrow();
  if (growth > 1.000) 
    return await growToMax(iterations + 1);
  else 
    return iterations;
}


async function resetSecurityBuildup() {
  await doWeaken();
  if (SecurityBuildup > 0.00)
    await resetSecurityBuildup();
}


async function harvestCycle() {
  if (SecurityBuildup >= WEAK_SEC) return;
  await doHack();
  await harvestCycle();
}


// NS function wrappers:

async function doGrow() {
  const growth = await NS.grow(Host);
  if (growth > 1.000) 
    SecurityBuildup += GROW_SEC * Threads;
  return growth;
}
async function doHack() {
  SecurityBuildup += HACK_SEC * Threads;
  await NS.hack(Host);
}
async function doWeaken() {
  SecurityBuildup -= WEAK_SEC * Threads;
  await NS.weaken(Host);
}
