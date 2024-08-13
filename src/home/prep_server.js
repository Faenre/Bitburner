/** @param {NS} ns */
export async function main(ns) {
	const target = ns.args[0];
	
	// @TODO: get server data from webserver
	const serverInfo = JSON.parse(ns.read(`servers/${target}.json`));
	const secMin = serverInfo.minDifficulty;
	
	while (true) {
		await weakenServerToMinimum(ns, target, secMin);
		await ns.grow(target);
		// await ns.grow(target);
		// await ns.grow(target);
	}
}

async function weakenServerToMinimum(ns, target, secMin) {
	while (ns.getServerSecurityLevel(target) > secMin)
		await ns.weaken(target);
}