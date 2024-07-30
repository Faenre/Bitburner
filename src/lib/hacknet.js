

/** @param {NS} ns */
export async function main(ns) {

}

/**
 * Converts a Hash Per Second to $ Per Second.
 * @param {Number} hps - Hash Per Second
 */
export const moneyPerSecond = (hps) => hps / HASHES_PER_BUY * MONEY_BUY_AMOUNT;
const HASHES_PER_BUY = 4.00;
const MONEY_BUY_AMOUNT = 1e6;
const HASH_SELL_STRING = 'Sell for Money';

/**
 * Uses the formulas API to calculate a Hacknet Server's hash rate.
 * 
 * @param {NS} ns
 * @param {Number} level
 * @param {Number} ram (in GB)
 * @param {Number} cores
 * @returns {Number} hash rate
 */
export const calcHashRate = (ns, level, ram, cores) => ns.formulas.hacknetServers.hashGainRate(level, 0, ram, cores, 1);


/**
 * 
 */
export class Network {
  static HASH_SELL_THRESHOLD = 0.20; // at what % of the hash cache do we start auto-spending?

  constructor(ns, getBudget, maxHours) {
    this.ns = ns;
    this.getBudget = getBudget;
    this.maxHours = maxHours;
    this.maxNodes = this.ns.hacknet.maxNumNodes();
    this.servers = Server.getServers(this.ns);
    this.moneyBuyCost = this.ns.hacknet.hashCost(HASH_SELL_STRING, 1);
  }

  hashes = () => this.ns.hacknet.numHashes();
  capacity = () => this.ns.hacknet.hashCapacity();

  buyMoney() {
    if (this.hashes() < this.capacity() * Network.HASH_SELL_THRESHOLD)
      return;
    const cost = this.moneyBuyCost;
    const hashesAvailable = this.hashes() - (this.capacity() * Network.HASH_SELL_THRESHOLD);
    const timesToBuy = Math.floor(hashesAvailable / cost);
    if (timesToBuy > 0) {
      this.ns.hacknet.spendHashes(HASH_SELL_STRING, '', timesToBuy);
      this.ns.print(`INFO bought \$${timesToBuy}m`);
    }
  }

  buyServers() {
    while (this.getBudget() > this.ns.hacknet.getPurchaseNodeCost()) {
      const nodeIndex = this.ns.hacknet.purchaseNode();
      this.servers.push(new Server(this.ns, nodeIndex));
      this.ns.print('SUCCESS bought new server');
    }
  }

  buyUpgrades() {
    let currentBudget = this.getBudget();
    const upgrades = this.getServerUpgrades(currentBudget);
    const purchases = { 'Level': 0, 'Ram': 0, 'Core': 0, 'Cache': 0 }

    for (const upgrade of upgrades) {
      const price = upgrade.price();
      if (price > currentBudget) break;
      currentBudget -= price;
      purchases[upgrade.name] += 1;
      upgrade.buy();
    }

    for (const [k, v] of Object.entries(purchases))
      if (v) this.ns.print(`SUCCESS Bought ${v} ${k} upgrade${v > 1 ? 's' : ''}`);
  }

  getServerUpgrades = (budget) => this.servers
    .flatMap(server => server.upgradeInfos)
    .filter(upgrade => budget > upgrade.price())
    .filter(upgrade => upgrade.price() / (moneyPerSecond(upgrade.hashRateIncrease()) * 3600) < this.maxHours)
    .sort((upgrade1, upgrade2) => upgrade1.pricePerGain() - upgrade2.pricePerGain());
}

/**
 * 
 */
export class Server {
  /**
   * Returns all hacknet nodes
   */
  static getServers = (ns) =>
    Array(ns.hacknet.numNodes())
      .fill(null)
      .map((_, i) => new Server(ns, i));

  constructor(ns, index) {
    this.ns = ns;
    this.index = index;
    this.upgradeInfos = Upgrade.generateForServer(this);
  }

  stats = () => this.ns.hacknet.getNodeStats(this.index);

  currentHashRate = () => calcHashRate(this.ns, ...(s => [s.level, s.ram, s.cores])(this.stats()));
}


class Upgrade {
  static generateForServer(server) {
    return Object.keys(Upgrade.TYPES).map(type => new Upgrade(server, type));
  }

  static TYPES = {
    'Level': {
      buy: (ns, index) => ns.hacknet.upgradeLevel(index),
      price: (ns, index) => ns.hacknet.getLevelUpgradeCost(index),
      statAdjustment: (orig) => [orig.level+1, orig.ram, orig.cores],
    },
    'Ram': {
      buy: (ns, index) => ns.hacknet.upgradeRam(index),
      price: (ns, index) => ns.hacknet.getRamUpgradeCost(index),
      statAdjustment: (orig) => [orig.level, orig.ram+1, orig.cores],
    },
    'Core': {
      buy: (ns, index) => ns.hacknet.upgradeCore(index),
      price: (ns, index) => ns.hacknet.getCoreUpgradeCost(index),
      statAdjustment: (orig) => [orig.level, orig.ram, orig.cores+1],
    },
    'Cache': { // currently, we're faking the stat adjustment, this is deliberate
      buy: (ns, index) => ns.hacknet.upgradeCache(index),
      price: (ns, index) => ns.hacknet.getCacheUpgradeCost(index),
      statAdjustment: (orig) => [orig.level+1, orig.ram, orig.cores],
    }
  }

  constructor(server, type) {
    this.ns = server.ns;
    this.server = server;
    this.name = type;
    this.buy = () => Upgrade.TYPES[type].buy(this.ns, server.index),
    this.price = () => Upgrade.TYPES[type].price(this.ns, server.index),
    this.stats = () => Upgrade.TYPES[type].statAdjustment(server.stats());
  }

  newHashRate = () => calcHashRate(this.ns, ...this.stats());
  hashRateIncrease = () => this.newHashRate() - this.server.currentHashRate();
  pricePerGain = () => this.price() / this.hashRateIncrease();
}
