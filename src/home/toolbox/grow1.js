/** 
 * Grows a target, once (per thread)
 * @param {NS} ns 
 * @arg {String} (required) Target hostname
 * @arg {String} (required) target hostname
 * @arg {Boolean} (optional) Whether to affect the stock market. Default false.
 * */
export async function main(ns) {
	const target = ns.args[0];
	const msDelay = ns.args[1] || 0;
	const affectStocks = ns.args[2] || false;

	// if (msDelay) await ns.sleep(msDelay);

	await ns.grow(target, { "stock": affectStocks, additionalMsec: msDelay });
}