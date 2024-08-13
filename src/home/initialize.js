// Standalone scripts
const SCRIPTS = ['equilibrium.js'];

// Tools (not intended to be manually-executed)
const TOOLBOX = [
	'/toolbox/hack1.js',
	'/toolbox/grow1.js',
	'/toolbox/weaken1.js',
	'/toolbox/prep_simple.js',
];

/** 
 * @param {NS} ns 
 * @param {String} hostname
 */
export async function main(ns) {
	const host = ns.args[0];
	const serverData = getServerData(ns, host);

	const startPrep = (h, t) => ns.exec('toolbox/prep_simple.js', h, t);

	await writeServerData(ns, serverData);
	await deliverFiles(ns, host);
	// if (serverData.moneyMax && (serverData.maxRam >= 4))
	// 	await startEquilibrium(ns, host);
	if (serverData.maxRam >= 2) {
		ns.killall(host);
		startPrep(host, Math.floor(serverData.maxRam / 2));
	}
}

function getServerData(ns, host) {
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

async function writeServerData(ns, serverData) {
	await ns.write('server_data.json', JSON.stringify(serverData), "w");
	await ns.scp('server_data.json', serverData.hostname);
	await ns.mv('home', 'server_data.json', `/servers/${serverData.hostname}.json`);
}

async function deliverFiles(ns, host) {
	await ns.scp(SCRIPTS, host);
	await ns.scp(TOOLBOX, host);
}

async function startEquilibrium(ns, host) {
	await ns.exec('equilibrium.js', host);
}