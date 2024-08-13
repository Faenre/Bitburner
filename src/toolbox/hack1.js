/** 
 * Hacks a target, once (per thread)
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} msDelay (optional) number of ms to wait
 * @arg {Boolean} (optional) Whether to affect the stock market. Default false.
 * */
export async function main(ns) {
	const target = ns.args[0];
	// const retries = ns.args[1] || 0;
	const msDelay = ns.args[1] || 0;
	const affectStocks = ns.args[2] || false;

	// if (msDelay) await ns.sleep(msDelay);

	await ns.hack(target, { "stock": affectStocks, additionalMsec: msDelay });

	// await doHack(ns, target, retries, affectStocks);
}

// async function doHack(ns, target, retries, affectStocks) {
// 	const payout = await ns.hack(target, {"stock": affectStocks})
//   if (payout) {
// 		ns.print('SUCCESS');
// 		// ns.toast(ns.formatNumber(payout));
// 		return payout;
// 	} else if (!retries) {
// 		ns.print('ERROR Hack not successful and no more retries allotted.')
// 		return;
// 	} else {
// 		ns.print('INFO Hack not successful; now retrying...');
// 		await doHack(ns, target, retries-1);
// 	}
// }