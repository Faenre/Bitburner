/** @param {NS} ns */
export async function main(ns) {
	const script = ns.args[0];
	const threads = ns.args[1] || 1;
	const hosts = ns.read('bots.txt').trim().split('\n');
	for (let host of hosts) {
		ns.run(script, threads, host);
	}
}