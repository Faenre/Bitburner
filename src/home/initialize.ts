// Tools (not intended to be manually-executed)
const TOOLBOX = [
	'/toolbox/hack1.js',
	'/toolbox/grow1.js',
	'/toolbox/weaken1.js',
	'/toolbox/prep_simple.js',
];

interface ServerData {
	minDifficulty: number,
	moneyStr: string,
	moneyMax: number,
	ip: string,
	hostname: string,
	organizationName: string,
	cpuCores: number,
	maxRam: number,
	portsRequired: number,
	requiredHackingSkill: number,
};

/**
 * Loads scripts onto target server, and creates a json
 * on home with that server name.
 *
 * @TODO reduce file IO
 * @TODO move file IO to a one-time thing
 * @param {NS} ns
 * @arg {string} ns.args.0 target hostname
 */
export async function main(ns: NS) {
	const target = String(ns.args[0]);
	const serverData = getServerData(ns, target);

	ns.scp(TOOLBOX, target);
	ns.write(`/servers/${serverData.hostname}.json`, JSON.stringify(serverData), "w");

	if (serverData.maxRam < 2) return;
	ns.killall(target);
	ns.exec('toolbox/prep_simple.js', target, Math.floor(serverData.maxRam / 2));
}

function getServerData(ns: NS, host: string): ServerData {
	const server = ns.getServer(host);

	return {
		"minDifficulty": server.minDifficulty,
		"moneyStr": ns.formatNumber(server.moneyMax || 0),
		"moneyMax": server.moneyMax,
		"ip": server.ip,
		"hostname": server.hostname,
		"organizationName": server.organizationName,
		"cpuCores": server.cpuCores,
		"maxRam": server.maxRam,
		"portsRequired": server.numOpenPortsRequired,
		"requiredHackingSkill": server.requiredHackingSkill,
	};
}
