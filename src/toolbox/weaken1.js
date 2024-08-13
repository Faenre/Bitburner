/** 
 * Weakens a target, once (per thread)
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} msDelay (optional) number of ms to wait
 * */
export async function main(ns) {
	const target = ns.args[0];
	const msDelay = ns.args[1] || 0;

	// if (msDelay) await ns.sleep(msDelay);
	await ns.weaken(target, { additionalMsec: msDelay });
}