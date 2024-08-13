/** @param {NS} ns */
export async function main(ns) {
  const hosts = ns.read('bots.txt').trim().split('\n');

	for (let hostname of hosts) {
		let server = ns.getServer(hostname);
		if (!server.hasAdminRights) continue;

		while (!server.backdoorInstalled) {
			ns.toast(`Next backdoor candidate: ${hostname}`, 'info', 10000);
			await ns.sleep(10000);
			server = ns.getServer(hostname);
		}
	}
}