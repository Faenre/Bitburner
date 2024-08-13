/** 
 * Testing endpoint, for ensuring clients can communicate back and forth. 
 * 
 * @param {NS} ns 
 * @param {Object} data object containing at least a `hostname`.
 * */
export default async function(ns, data) {
	const hostname = data.hostname;

	const secCurrent = ns.getServerSecurityLevel(hostname);
	const secMax = ns.getServerMinSecurityLevel(hostname);

	return [STATUS.OK, { secCurrent, secMax }]
}

const STATUS_OK = 200;
