const COMMANDS = {
	'money': 'Sell for Money',
	'school': 'Improve Studying',
	'gym': 'Improve Working Out',
}

/** 
 * This sells hacknet hashes for money (typically, 4.00 hashes == 1 mil).
 * It can optionally repeat every 30 seconds.
 * 
 * @param {NS} ns 
 * @arg {boolean} whether to perform once or loop
 * */
export async function main(ns) {
	const command = COMMANDS[ns.args[0] ?? 'money'];
	do {
		while (ns.hacknet.numHashes() > ns.hacknet.hashCost(command))
			ns.hacknet.spendHashes(command);
	} while (await ns.sleep(30e3));
}
