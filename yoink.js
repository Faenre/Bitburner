/*
 This script requires 2.00GB of RAM to run for 1 thread(s)
  1.60GB | baseCost (misc)
  0.15GB | grow (fn)
  0.15GB | weaken (fn)
  0.10GB | hack (fn)
 */

let NS;
let Host;

const GROW_SEC = 0.004
const HACK_SEC = 0.002
const WEAK_SEC = 0.050

/** 
 * @param {NS} ns 
 * @arg {String} hostname, currently necessary
 * */
export async function main(ns) {
  NS = ns;
  Host = NS.args[0]; // @todo read this from calibration file
  
  while (true) {
    await growToMax();
    await harvestCycle();
  }
}


async function growToMax(sec=0.000) {
  // Grow until growth can't happen
  if (await NS.grow(Host) > 1.000) 
    return growToMax(sec + GROW_SEC);

  // Undo the security gains
  for (; sec > 0.00; sec -= WEAK_SEC)
  	await NS.weaken(Host);
}


async function harvestCycle(sec=0.000) {
  if (sec >= WEAK_SEC) 
    return await NS.weaken(Host);
  
  await NS.hack(Host);
  return await harvestCycle(sec + HACK_SEC);
}
