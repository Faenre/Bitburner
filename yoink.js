/*
 This script requires 2.45GB of RAM to run for 1 thread(s)
  1.60GB | baseCost (misc)
  0.15GB | grow (fn)
  0.15GB | weaken (fn)
  0.10GB | getServerMaxMoney (fn)
  0.10GB | getServerMoneyAvailable (fn)
  0.10GB | getServerMinSecurityLevel (fn)
  0.10GB | getServerSecurityLevel (fn)
  0.10GB | hack (fn)
  0.05GB | getHostname (fn)
 */

let NS;

/** @param {NS} ns */
export async function main(ns) {
  NS = ns;
  const host = NS.getHostname();
  
  while (true) {
    await growToMax(host);
    await weakenToMinimum(host);
    await harvestCycle(host);
  }
}

async function growToMax(host) {
  const maximum  = NS.getServerMaxMoney(host);
  let current = NS.getServerMoneyAvailable(host);
  while (current < maximum) {
    await NS.grow(host);
  }
}

async function weakenToMinimum(host) {
  const minimum = NS.getServerMinSecurityLevel(host);
  while (getServerSecurityLevel(host) < minimum) {
    await NS.weaken(host);
  }
}

async function harvestCycle(host) {
  await NS.hack(host);
  await NS.hack(host);
  await NS.hack(host);
  await NS.weaken(host);
  await NS.hack(host);
  await NS.hack(host);
  await NS.weaken(host);
}