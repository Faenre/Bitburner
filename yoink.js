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
 * */
export async function main(ns) {
  NS = ns;
  Host = NS.read('hostname.txt');
  
  while (true) {
    await growToMax();
    await harvestCycle();
  }
}


async function growToMax(iter=0, sec=0.000) {
  NS.print('Growth iteration: ' + iter);
  NS.print('Security offset: ' + sec);

  if (sec >= WEAK_SEC){
    await NS.weaken(Host);
    sec -= WEAK_SEC;
  }

  if (await NS.grow(Host) > 1.000) 
    return growToMax(iter + 1, sec + GROW_SEC);
}


async function harvestCycle(sec=0.000) {
  if (sec >= WEAK_SEC) 
    return await NS.weaken(Host);
  
  await NS.hack(Host);
  return await harvestCycle(sec + HACK_SEC);
}
