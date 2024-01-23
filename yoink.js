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

  let iterations = await calibrate();
  
  while (true) {
    await harvestCycle();
    await regrow(iterations);
  }
}

/**
 * Calibrates to figure out how many regrowths are necessary per batch of ~23 hacks.
 * This can take a long time the first time it executes, but saves several minutes
 * per batch, which adds up over time.
 * */
async function calibrate() {
	await NS.print('Beginning calibration...');
	// Set money to max 
	// (this might take a long time, the very first time executed)
  await growToMax();

  // Reset security to 0
  await resetSecurityBuildup();

  // Run a maximum-cycle of hacks
  await harvestCycle();

  // Return how many iterations of regrowth are necessary
  const iterations = await growToMax();

  await NS.print('Calibrations complete!');
  return iterations;
}


async function growToMax(iterations=0) {
	const growth = await grow();
  if (growth > 1.000) 
  	await growToMax(iterations + 1);
  else 
  	return iterations;
}


async function resetSecurityBuildup() {
	await weaken();
	if (SecurityBuildup > 0.00)
		await resetSecurityBuildup();
}


async function harvestCycle(sum) {
  if (SecurityBuildup >= WEAK_SEC) {
    await weaken();
    return sum;
  }
  const amtStolen = await hack();
  return await harvestCycle(sum + amtStolen);
}


async function regrow(counter) {
	if (counter <= 0) return;
	await grow();
	return await regrow(counter - 1);
}


// NS function wrappers:

async function grow() {
	const growth = await NS.grow(Host);
	if (growth > 1.000) 
		SecurityBuildup += GROW_SEC;
	return growth;
}
async function hack() {
	SecurityBuildup += HACK_SEC;
	return await NS.hack(Host);
}
async function weaken() {
	SecurityBuildup -= WEAK_SEC;
	return await NS.weaken(Host);
}
