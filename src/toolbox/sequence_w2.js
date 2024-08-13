/** 
 * hgw that relies on a port to know how long and who to target
 * 
 * @param {NS} ns 
 * @arg {String} server to target
 * @arg {Number} what port to wait on
 * */
export async function main(ns) {
	const target = ns.args[0];
	const port = ns.args[1];
	await ns.nextPortWrite(port);
	const info = ns.peek(port);
	await ns.sleep(info.delays.w2);
	await ns.weaken(target);
}