/*
  Builds a Combat Gang from the ground up.

  Usage: 
    1. Join a combat gang (e.g. Slum Snakes, Tetrads, The Dark Army, etc)
    2. Run this script (needs > 32gb RAM!)
    3. Let it run (takes ~12 hours to take over the streets)
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
  static CONFLICT_THRESHOLD = 0.60;

  constructor(ns) {
    this.gangInfo = ns.gang.getGangInformation();
    this.members = ns.gang.getMemberNames().map((name) => new GangMember(ns, name));
    this.ns = ns;
  }

  apply() {
    this.updateNames();
    this.recruit();
    this.ascend();
    this.buyUpgrades();
    if (this.atMaxSize())
      this.doStrategy();
    else
      this.growTeam();
  }

  updateNames() {
    for (let i=0; i < this.members.length; i++) 
      this.members[i].updateName(i);
  }

  recruit() {
    while (this.ns.gang.canRecruitMember()) {
      const name = GangMember.NAMES[this.members.length];
      this.ns.gang.recruitMember(name);
      this.members.push(new GangMember(this.ns, name, true));
      this.ns.toast(`Recruited ${name}!`, 'success', 6000);
    }
  }

  ascend() {
    for (let member of this.members)
      member.ascend();
  }

  buyUpgrades() {
    for (let gangster of this.members)
      gangster.upgradeEquipment();
  }

  // -----

  growTeam() {
    const workers = this.workers();
    const vigilantes = this.vigilantes();
    for (let i=0; i < Math.min(workers, vigilantes); i++)
      workers[i].doVigilanteWork();
    for (let i=vigilantes; i < workers.length; i++) 
      workers[i].gainRespect();
  }

  doStrategy() {
    this.enableConflictIfReady();

    const workers = this.workers();
    // const territoryWorkerQty = this.atMaxSize() ? Math.round((1 - conflictWinRate) * workers.length) : 0
    let territoryWorkerQty = Math.round((1.00 - this.worstConflictPct()) * workers.length);
    if (!this.gangInfo.territoryWarfareEngaged) territoryWorkerQty += 3;
    if (this.allTerritoryOwned()) territoryWorkerQty = 0; // @TODO: refactor this!!!
    const territoryWorkers = workers.slice(0,territoryWorkerQty);
    const moneyWorkers = workers.slice(territoryWorkerQty,workers.length);
    this.assignGainTerritory(territoryWorkers);
    this.assignSmartMoney(moneyWorkers);
  }

  // @TODO: refactor this
  enableConflictIfReady() {
    if (this.allTerritoryOwned()) {
      this.disableConflict();
      return;
    }
    const conflictWinRate = this.worstConflictPct()
    if (conflictWinRate >= Gang.CONFLICT_THRESHOLD) {
      this.enableConflict();
      return;
    } 
    if (conflictWinRate < Gang.CONFLICT_THRESHOLD) {
      this.disableConflict();
      return;
    }
  }

  conflictEnabled = () => this.gangInfo.territoryWarfareEngaged;
  allTerritoryOwned = () => this.gangInfo.territory == 1.00;

  enableConflict() {
    if (this.conflictEnabled()) 
      return;
    this.ns.gang.setTerritoryWarfare(true);
    this.ns.toast('Gang territory conflicts enabled!', 'warning', 10e3);
  }

  disableConflict() {
    if (!this.conflictEnabled()) 
      return;
    this.ns.gang.setTerritoryWarfare(false);
    this.ns.toast('Gang territory conflicts disabled!', 'warning', 10e3);
  }

  assignSmartMoney(workers) {
    // const vigilantes = this.vigilantes();
    // for (let i=0; i < Math.min(vigilantes, workers.length); i++)
    //  workers[i].doVigilanteWork();
    for (let i=0; i < workers.length; i++) 
      workers[i].makeMoney();
  }

  assignGainTerritory(workers) {
    for (let worker of workers)
      worker.gainTerritory();
  }

  worstConflictPct() {
    // returns a decimal of the worst conflict win chance
    const otherGangPowers = Object.values(this.enemyGangs()).map(stats => stats.power);
    return this.gangInfo.power / (this.gangInfo.power + Math.max(...otherGangPowers));
  }

  enemyGangs() {
    const gangInfos = this.ns.gang.getOtherGangInformation();
    delete gangInfos[this.gangInfo.faction];
    return gangInfos;
  }

  size = () => this.members.length;
  atMaxSize = () => this.ns.gang.respectForNextRecruit() == Infinity;
  workers = () => this.members.filter((member) => member.readyForWork());
  vigilantes() {
    if (this.gangInfo.wantedLevel < 100) return 0;
    return Math.round((1 - this.gangInfo.wantedPenalty) * 100 * this.workers().length);
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

  constructor(ns, name, isNewbie=false) {
    this.ns = ns;
    this.name = name;
    this.gangType = 'combat';
    if (isNewbie)
      this.startWork(GangMember.TASKS.TRAIN_COMBAT);
  }

  info() {
    return this.ns.gang.getMemberInformation(this.name);
  }

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
    for (let [item, owned] of Object.entries(this.upgrades())) {
      if (owned) continue;
      const itemCost = this.ns.gang.getEquipmentCost(item)
      if (itemCost < moneyThreshold)
        this.ns.gang.purchaseEquipment(this.name, item);
    }
  }

  upgrades() {
    const itemNames = this.ns.gang.getEquipmentNames();
    const itemsOwned = this.info().upgrades;
    const augmentsOwned = this.info().augmentations;
    const upgrades = {};
    for (let item of itemNames)
      upgrades[item] = false;
    for (let item of itemsOwned)
      upgrades[item] = true;
    for (let augment of augmentsOwned)
      upgrades[augment] = true;
    return upgrades;
  }

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

  startWork(task) {
    if (this.info().task !== task)
      this.ns.gang.setMemberTask(this.name, task);
  }

  makeMoney() { // wrapper for startWork, but with some logic
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

  combatStats() {
    const memberInfo = this.ns.gang.getMemberInformation(this.name);
    const relevantStats = GangMember.STATS[this.gangType];
    const combatStats = {};
    for (let stat of relevantStats) 
      combatStats[stat] = memberInfo[stat];
    return combatStats;
  }
}