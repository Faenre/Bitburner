const WALLET_PCT_DEFAULT = 0.4;

/** 
 * Manages hacknet servers.
 * 
 * Requires Bitnode 9.1 to use.
 * This version uses some basic logic for determining which 
 * upgrades to prioritize, but it will select the unoptimal
 * choices from time to time. See the v2 manager if you have
 * access to the Formulas API.
 * 
 * @param {NS} ns 
 * @arg {number} What decimal percentage of the wallet is considered viable? 
 * */
export async function main(ns) {
	ns.disableLog('sleep');
	const walletPct = ns.args[0] || WALLET_PCT_DEFAULT;
	const network = new Network(ns, walletPct);
	do {
		network.buyServers();
		network.buyMoney();
		network.buyUpgrades();
	} while (await ns.sleep(15e3));
}

class Network {
	static HASH_SELL_THRESHOLD = 0.20; // at what % of the hash cache do we start auto-spending?
	static HASH_SELL_FOR_MONEY = "Sell for Money";

	constructor(ns, walletPct = null) {
		this.ns = ns;
		this.walletPct = walletPct;
		this.maxNodes = this.ns.hacknet.maxNumNodes();
		this.servers = Server.getServers(this.ns);
	}

	hashes = () => this.ns.hacknet.numHashes();
	capacity = () => this.ns.hacknet.hashCapacity();

	buyMoney() {
		if (this.hashes() < this.capacity() * Network.HASH_SELL_THRESHOLD)
			return;
		const cost = this.ns.hacknet.hashCost(Network.HASH_SELL_FOR_MONEY, 1);
		const hashesAvailable = this.hashes() - (this.capacity() * Network.HASH_SELL_THRESHOLD);
		const timesToBuy = Math.floor(hashesAvailable / cost);
		if (timesToBuy > 0) {
			this.ns.print(`INFO buying $${timesToBuy}m`);
			this.ns.hacknet.spendHashes(Network.HASH_SELL_FOR_MONEY, '', timesToBuy);
		}
	}

	buyServers() {
		if (this.ns.hacknet.getPurchaseNodeCost() < this.ns.getPlayer().money * this.walletPct) {
			const newServerIndex = this.ns.hacknet.purchaseNode();
			if (newServerIndex >= 0) {
				this.ns.print('SUCCESS bought new server');
				this.servers.push(new Server(this.ns, newServerIndex));
			} else {
				this.ns.print(`ERROR could not buy server.`);
			}
		}
	}

	buyUpgrades() {
		const totalBudget = this.ns.getPlayer().money * this.walletPct;
		for (let server of this.servers) {
			server.upgradeWithinBudget(totalBudget / this.servers.length);
		}
	}
}

class Server {
	static getServers(ns) {
		const servers = [];
		for (let i = 0; i < ns.hacknet.numNodes(); i++)
			servers.push(new Server(ns, i));
		return servers;
	}

	static UPGRADE_TYPES = ['Cache', 'Core', 'Ram', 'Level'];
	static PRICE_FACTORS = {
		'Cache': 3.0,
		'Core': 1.0,
		'Ram': 1.5,
		'Level': 2.0,
	}

	constructor(ns, index) {
		this.ns = ns;
		this.index = index;
	}

	upgradeWithinBudget(totalBudget) {
		let currentBudget = totalBudget;
		for (let type of Server.UPGRADE_TYPES) {
			let price = this.priceForUpgrade(type);
			let qty = 0;
			while (price <= currentBudget) {
				this.buyUpgrade(type);
				currentBudget -= price;
				qty += 1;
				price = this.priceForUpgrade(type);
			}
			if (qty)
				this.ns.print(`INFO upgraded ${type} on server[${this.index}]`);
		}
	}

	priceForUpgrade(type) {
		const priceMethods = {
			'Cache': this.ns.hacknet.getCacheUpgradeCost,
			'Core': this.ns.hacknet.getCoreUpgradeCost,
			'Level': this.ns.hacknet.getLevelUpgradeCost,
			'Ram': this.ns.hacknet.getRamUpgradeCost,
		}
		const basePrice = priceMethods[type](this.index);
		return basePrice * Server.PRICE_FACTORS[type];
	}

	buyUpgrade(type) {
		const upgradeMethods = {
			'Cache': this.ns.hacknet.upgradeCache,
			'Core': this.ns.hacknet.upgradeCore,
			'Level': this.ns.hacknet.upgradeLevel,
			'Ram': this.ns.hacknet.upgradeRam,
		}
		upgradeMethods[type](this.index, 1);
	}
}
