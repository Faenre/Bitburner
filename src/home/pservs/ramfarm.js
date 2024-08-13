import { sum } from '../lib/math';
const BUDGET_PCT = 1.00;//0.80;

/**
 * Manages a purchasable-server farm
 *
 * @param {NS} ns
 * @arg {number} What decimal percent of the player's wallet to use
 * */
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail();
	const budgetPct = ns.args[0] || BUDGET_PCT;
	const currentBudget = () => ns.getPlayer().money * budgetPct;
	do {
		// buy pservs (if possible)
		PurchasableServer.buyNewServers(ns);

		// get current servers
		const servers = PurchasableServer.getServers(ns);

		// upgrade pservs
		for (let server of servers)
			if (currentBudget() > server.nextUpgradeCost())
				server.buyNextUpgrade();

		ns.clearLog();
		ns.print(`INFO current pool has ${ns.formatRam(sum(servers.map(s => s.ram())))} RAM`)
		ns.print(`INFO next upgrade at $${ns.formatNumber(servers.at(-1).nextUpgradeCost())}`);
	} while (await ns.sleep(10e3));
}


class PurchasableServer {
	static buyNewServers(ns) {
		const existingServers = ns.getPurchasedServers().length;
		const maxServers = ns.getPurchasedServerLimit();
		if (existingServers === maxServers) return;

		const cost = ns.getPurchasedServerCost(2);
		const serversToBuy = Math.min(ns.getPlayer().money / cost, maxServers - existingServers);
		for (let i=existingServers; i < serversToBuy; i++)
			ns.purchaseServer(`pserv-${i}`, 2);
		ns.print(`INFO Purchased ${serversToBuy} servers`);
	}

	static getServers(ns) {
		return ns.getPurchasedServers()
			.map(name => new PurchasableServer(ns, name));
	}

	constructor(ns, name) {
		this.ns = ns;
		this.name = name;
	}

	ram = () => this.ns.getServerMaxRam(this.name);
	nextUpgradeCost = () => this.ns.getPurchasedServerUpgradeCost(this.name, this.ram()*2);
	buyNextUpgrade = () => this.ns.upgradePurchasedServer(this.name, this.ram() * 2);

}
