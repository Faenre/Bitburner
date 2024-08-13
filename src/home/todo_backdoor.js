/** @param {NS} ns */
export async function main(ns) {
	const known_hosts = ns.read('hosts.txt').split('\n');
	for (let host of known_hosts) {
		const server = ns.getServer(host);
		const has_backdoor = server.backdoorInstalled;
		if (!has_backdoor)
			ns.toast(`Todo: Backdoor '${host}'`, 'warning', null);
	}
}