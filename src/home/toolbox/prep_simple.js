/** 
 * @param {NS} ns 
 * @arg {string} hostname of target of target, if not self
 * @arg {number} minimum security of target
 * */
export async function main(ns) {
	const [host, secMin] = getServerInfo(ns);
	
	while (true) {
		while (ns.getServerSecurityLevel(host) > secMin)
			await ns.weaken(host);
		await ns.grow(host);
		await ns.grow(host);
		await ns.grow(host);
	}
}

// @TODO: get server data from webserver
function getServerInfo(ns) {
	const host = ns.args[0];
	const secMin = ns.args[1];
	if (host && secMin) 
		return [host, secMin];
	const serverInfo = JSON.parse(ns.read(`server_data.json`));
	return [serverInfo.hostname, serverInfo.minDifficulty]
}