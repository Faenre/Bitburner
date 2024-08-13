/*
  Builds a Combat Gang from the ground up.

  Usage: 
    1. Join a combat gang (e.g. Slum Snakes, Tetrads, The Dark Army, etc)
    2. Run this script (needs > 32gb RAM!)
    3. Let it run (takes ~12 hours to take over the streets, assuming you already have $$)
*/

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('gang.purchaseEquipment');
  
  if (!ns.gang.inGang()) {
    ns.tprint('ERROR: not in a gang! Aborting.');
    return
  }

  ns.tail();

  do {
    const gang = new Gang(ns);
    gang.apply();
  } while (await ns.gang.nextUpdate());
}


class Gang {
  static ENABLE_CONFLICT_THRESHOLD = 0.60;
  static INCREASE_POWER_THRESHOLD = 0.825;

  static INTENTS = {
    GAIN_RESPECT: 'Gaining Respect',
    GAIN_TERRITORY: 'Increasing Power',
    MAKE_MONEY: 'Making Money',
  }

  constructor(ns) {
    this.gangInfo = ns.gang.getGangInformation();
    this.members = ns.gang.getMemberNames().map((name) => new GangMember(ns, name));
    this.ns = ns;
  }

  size = () => this.members.length;
  atMaxSize = () => this.ns.gang.respectForNextRecruit() == Infinity;
  workers = () => this.members.filter((member) => member.readyForWork());

  apply() {
    // HR and bookkeeping
    this.updateNames();
    this.recruit();
    this.ascend();
    this.buyUpgrades();
    
    // 
    this.enableConflictIfReady();

    this.intent = null
    || this.assignGainRespect()
    || this.assignGainTerritory()
    || this.assignMakeMoney();
  }

  updateNames = () => this.members.forEach((m, i) => m.updateName(i));

  recruit() {
    while (this.ns.gang.canRecruitMember())
      this.members.push(GangMember.recruit(this.ns, this.members.length));
  }

  ascend = () => this.members.forEach(m => m.ascend());

  buyUpgrades = () => this.members.forEach(m => m.upgradeEquipment());

  enableConflictIfReady() {
    if (this.allTerritoryOwned())
      return this.disableConflict();

    if (this.worstConflictPct() < Gang.ENABLE_CONFLICT_THRESHOLD)
      return this.disableConflict();

    return this.enableConflict();
  }

  allTerritoryOwned = () => this.gangInfo.territory == 1.00;

  enableConflict() {
    if (this.conflictEnabled()) 
      return;
    this.ns.gang.setTerritoryWarfare(true);
    this.ns.toast('Gang territory conflicts enabled!', 'info', 10e3);
  }

  disableConflict() {
    if (!this.conflictEnabled()) 
      return;
    this.ns.gang.setTerritoryWarfare(false);
    if (this.allTerritoryOwned())
      this.ns.toast('Gang territory now at 100%!', 'success', null);
    else
      this.ns.toast('Gang territory conflicts disabled!', 'warning', 10e3);
  }

  conflictEnabled = () => this.gangInfo.territoryWarfareEngaged;

  assignGainRespect() {
    if (this.atMaxSize()) return false;

    this.workers().forEach(w => w.gainRespect());
    return Gang.INTENTS.GAIN_RESPECT;
  }

  assignGainTerritory() {
    if (this.allTerritoryOwned()) return false;
    if (this.worstConflictPct() > Gang.INCREASE_POWER_THRESHOLD) return false;

    this.workers().forEach(w => w.gainTerritory());
    return Gang.INTENTS.GAIN_TERRITORY;
  }

  assignMakeMoney() {
    this.workers().forEach(w => w.makeMoney());
    return Gang.INTENTS.MAKE_MONEY;
  }

  // returns a decimal of the worst conflict win chance
  worstConflictPct() {
    const highestEnemyPower = Object
      .values(this.enemyGangs())
      .filter(stats => stats.territory)
      .map(stats => stats.power)
      .reduce((a, b) => a > b ? a : b);
    return this.gangInfo.power / (this.gangInfo.power + highestEnemyPower);
  }

  enemyGangs() {
    const gangs = this.ns.gang.getOtherGangInformation();
    delete gangs[this.gangInfo.faction];
    return gangs;
  }
}


class GangMember {
  static TASKS = {
    'UNASSIGNED': "Unassigned",
    'MUGGING': "Mug People",
    'DEALING': "Deal Drugs",
    'STRONGARMING': "Strongarm Civilians",
    'CONNING': "Run a Con",
    'ROBBING': "Armed Robbery",
    'ARMS_TRAFFICKING': "Traffick Illegal Arms",
    'BLACKMAILING': "Threaten & Blackmail",
    'HUMAN_TRAFFICKING': "Human Trafficking",
    'TERRORISM': "Terrorism",
    'VIGILANCE': "Vigilante Justice",
    'TRAIN_COMBAT': "Train Combat",
    'TRAIN_HACKING': "Train Hacking",
    'TRAIN_CHARISMA': "Train Charisma",
    'TERRITORY_WARFARE': "Territory Warfare",
  };

  static NAMES = [
    'Abigail', 'Brenda', 'Charlie', 'Daisy', 'Effie', 'Frankie',
    'Greta', 'Hope', 'Illia', 'Jasmine', 'Katrina', 'Lavender',
  ];

  static ASCEND_SKILLS_PER_MULT = 130; // how many skills should +1x ascend mean before use?
  static WALLET_THRESHOLD = 0.15; // what percent of our wallet do we use to fund the gang?
  static STATS = {
    'all': ['agi', 'cha', 'def', 'dex', 'hack', 'str'],
    'combat': ['agi', 'def', 'dex', 'str'],
    'hacking': ['cha', 'hack'],
    }

  static HACKING_ITEMS = [
    'NUKE Rootkit',
    'Soulstealer Rootkit',
    'Jack the Ripper',
    'Hmap Node',
    'Demon Rootkit',
    'BitWire',
    'DataJack',
    'Neuralstimulator',
  ]

  /**
   * Recruits a new gang member.
   * 
   * @param {NS} ns
   * @param {Number} integer ID, between 0-11 inclusive
   */
  static recruit(ns, id) {
    const name = GangMember.NAMES[id];
    ns.gang.recruitMember(name);
    ns.toast(`Recruited ${name}!`, 'success', 6000);
    const gangMember = new GangMember(ns, name);
    gangMember.trainCombat();
    return gangMember;
  }

  constructor(ns, name) {
    this.ns = ns;
    this.name = name;
    this.gangType = 'combat';
  }

  info = () => this.ns.gang.getMemberInformation(this.name);

  updateName(id) {
    const expectedName = GangMember.NAMES[id]
    if (this.name != expectedName) {
      this.ns.gang.renameMember(this.name, expectedName);
      this.name = expectedName;
    }
  }

  ascend() {
    const avgBonus = this.avgAscensionBonus();
    if (avgBonus < this.ascendThreshold(avgBonus))
      return;
    if (this.info().task == GangMember.TASKS.TERRORISM)
      return; // don't ascend while explicitly trying to *gain* respect! super counterprodutive.
    this.ns.gang.ascendMember(this.name);
    this.ns.gang.setMemberTask(this.name, GangMember.TASKS.TRAIN_COMBAT);
    this.ns.print(`INFO ascending ${this.name}`);
    this.ns.toast(`${this.name} ascended!`, 'info', 5000);
  }

  // formula provided thanks to jeek / @tadzhikistan on discord
  ascendThreshold = (mult) => 1.66 - 0.62 / Math.exp((2 / mult) ** 2.24);

  avgAscensionBonus() {
    const expectedResults = this.ns.gang.getAscensionResult(this.name);
    if (!expectedResults) return 0;
    const stats = GangMember.STATS[this.gangType];
    return stats.reduce((sum, stat) => sum + (expectedResults[stat] || 1), 0) / stats.length;
  }

  upgradeEquipment() {
    let moneyThreshold = this.ns.getPlayer().money * GangMember.WALLET_THRESHOLD;
    for (const upgrade of this.availableUpgrades()) {
      const itemCost = this.ns.gang.getEquipmentCost(upgrade)
      if (itemCost < moneyThreshold)
        this.ns.gang.purchaseEquipment(this.name, upgrade);
    }
  }

  availableUpgrades() {
    const upgrades = new Set(this.ns.gang.getEquipmentNames());
    // remove owned upgrades
    for (let item of this.info().upgrades)
      upgrades.delete(item);
    // remove owned augments
    for (let augment of this.info().augmentations)
      upgrades.delete(augment);
    // remove rootkits
    // @TODO update this for hacking gangs
    for (let item of GangMember.HACKING_ITEMS)
      upgrades.delete(item);
    return upgrades;
  }

  // @TODO remove!
  // upgrades1() {
  //  const itemNames = this.ns.gang.getEquipmentNames();
  //  const itemsOwned = this.info().upgrades;
  //  const augmentsOwned = this.info().augmentations;
  //  const upgrades = {};
  //  for (let item of itemNames)
  //    upgrades[item] = false;
  //  for (let item of itemsOwned)
  //    upgrades[item] = true;
  //  for (let augment of augmentsOwned)
  //    upgrades[augment] = true;
  //  return upgrades;
  // }

  // @TODO refactor
  readyForWork() {
    const memberInfo = this.ns.gang.getMemberInformation(this.name);
    const relevantStats = GangMember.STATS[this.gangType];
    let currentSum = 0;
    let ascensionMultipliers = 0;
    for (let stat of relevantStats) {
      currentSum += memberInfo[stat];
      ascensionMultipliers += memberInfo[`${stat}_asc_mult`];
    }
    if (currentSum < ascensionMultipliers * 100)
      return false;
    if (currentSum < relevantStats.length * 500)
      return false;
    return true;
  }

  /**
   * Wrapper for startWork that takes current skills into consideration.
   * 
   * @TODO revisit the skill formula: what are the formulas for HT vs AT?
   */
  makeMoney() {
    const stats = Object.values(this.combatStats());
    const statAvg = stats.reduce((a, b) => a + b) / stats.length;
    if (statAvg < 400)
      this.startWork(GangMember.TASKS.MUGGING);
    else if (statAvg < 10000)
      this.startWork(GangMember.TASKS.HUMAN_TRAFFICKING);
    else
      this.startWork(GangMember.TASKS.ARMS_TRAFFICKING);
  }

  gainRespect() {
    this.startWork(GangMember.TASKS.TERRORISM);
  }

  doVigilanteWork() {
    this.startWork(GangMember.TASKS.VIGILANCE);
  }

  gainTerritory() {
    this.startWork(GangMember.TASKS.TERRITORY_WARFARE);
  }

  trainCombat() {
    this.startWork(GangMember.TASKS.TRAIN_COMBAT);
  }

  startWork(task) {
    if (this.info().task !== task)
      this.ns.gang.setMemberTask(this.name, task);
  }

  combatStats() {
    const memberInfo = this.ns.gang.getMemberInformation(this.name);
    const relevantStats = GangMember.STATS[this.gangType];
    const combatStats = {};
    for (let stat of relevantStats) 
      combatStats[stat] = memberInfo[stat];
    return combatStats;
  }
}