/**
 * Logic for handling Sleeves
 *
 * @TODO @SINGULARITY update Sleeve.helpPlayer() with jobs
 * @TODO move some of this into a library
 * @TODO implement a "not while busy" mechanism for discrete actions
 *
 * @param {NS} ns
 * */
export async function main(ns) {
	const sleeves = Sleeve.getCurrentSleeves(ns);
	ns.disableLog('sleep');
	const timer = sleeves.inBladeburners ? (async () => await ns.bladeburner.nextUpdate()) : (async () => await ns.sleep(5e3));
	do {
		sleeves.forEach(manageSleeve);
	} while (await timer());
	// } while (await ns.sleep(5e3));
	// } while (await ns.bladeburner.nextUpdate());
}

// @TODO: formulize this?
const DESHOCK_TIER_1 = 85;	// above this, the sleeve isn't going to be worth much
// const DESHOCK_TIER_2 = 60;  // below this, it's worth it to perform group actions together
// const DESHOCK_TIER_3 = 15;  // above this, we don't really want to perform long-term training
const DESHOCK_TIER_4 = 0; 	// needed to unlock implants

//@TODO account for BN multipliers
const HOMICIDE_SKILL_THRESHOLDS = {
	strength: 60,
	defense: 60,
	dexterity: 30,
	agility: 30,
}

const BLADEBURNER_SKILL_THRESHOLDS = {
	strength: 70,
	defense: 70,
	dexterity: 80,
	agility: 90,
};

const BLADEBURNER_CONTRACT_TYPES = [
	'Retirement',
	'Bounty Hunter',
	'Tracking',
];
const BLADEBURNER_OPERATION_TYPES = [
	'Investigation',
	'Undercover Operation',
	'Sting Operation',
	'Raid',
	'Stealth Retirement Operation',
	'Assassination',
]

function manageSleeve(currentSleeve) {
	currentSleeve.reload();
	// If the sleeve has a discrete task in progress, stop everything else
	return currentSleeve.taskInProgress()
		// These have to happen first, or else the sleeve is pretty useless.
		|| currentSleeve.synchronize()
		|| currentSleeve.deshock(DESHOCK_TIER_1)

		// Get the player some basic skills
		// @TODO write a "true skill multiplier" that takes BN into account
		// || currentSleeve.helpPlayerSkills(40)

		// Singularity functions go here
		// || currentSleeve.helpPlayerWork()

		// Gangs are useful for augments and generational wealth.
		// This uses sleeves to quickly unlock them.
		|| currentSleeve.improvePhysicalSkills(HOMICIDE_SKILL_THRESHOLDS)
		|| currentSleeve.commitHomicide()

		// If player is in Bladeburner, help them out:
		|| currentSleeve.bbHelpPlayerJoin()
		|| currentSleeve.bbDoContracts()
		|| currentSleeve.bbDoFieldAnalysis()
		|| currentSleeve.bbRecoverStamina()
		|| currentSleeve.bbReduceChaos()
		|| currentSleeve.improvePhysicalSkills(BLADEBURNER_SKILL_THRESHOLDS)
		|| currentSleeve.bbGenerateContracts()
		|| currentSleeve.bbTrainStamina(300)
		|| currentSleeve.bbDoRecruitment()

		// If the PC has a job, a sleeve should help with it
		|| currentSleeve.doJob()

		// For any faction the player is member to, help them gain rep.
		// @TODO set rep limits?
		// || currentSleeve.gainRep()

		// If the player has purchased hacknet server XP, start studying int.
		// @TODO replace studyHacking with studyInt that takes the above into account
		// || currentSleeve.deshock(DESHOCK_TIER_3)
		// || currentSleeve.studyHacking()

		// Unlock implants
		|| currentSleeve.deshock(DESHOCK_TIER_4)
		// Accrue bonus time
		|| currentSleeve.idle();
}


class Sleeve {
	static getCurrentSleeves = (ns) =>
		Array(ns.sleeve.getNumSleeves())
			.fill(null)
			.map((_, i) => new Sleeve(ns, i));

	static currentSleeves = [];

	// static sleevesDoingTask = (task) => Sleeve.currentSleeves.filter(s => s.task?.actionName === task)

	constructor(ns, id) {
		this.ns = ns;
		this.id = id;
		this.task = ns.sleeve.getTask(id) ?? { actionName: 'Idle' };
		this.trueMults = this.ns.getBitNodeMultipliers();
		Sleeve.currentSleeves[id] = this;
	}

	// Anything that should happen only once per 'tick' goes here
	reload() {
		this.info = this.ns.sleeve.getSleeve(this.id);
		this.task = this.ns.sleeve.getTask(this.id) ?? { actionName: 'Idle' };
		this.player = this.ns.getPlayer();
		this.inBladeburners = this.ns.bladeburner.inBladeburner();
		this.bbCity = this.inBladeburners && this.ns.bladeburner.getCity();
		this.otherSleeveIDs = Sleeve.currentSleeves
			.filter(s => s.id !== this.id);
	}

	// Get sleeve towards 100 sync
	synchronize(threshold = 100) {
		if (this.info.sync < threshold)
			return this.ns.sleeve.setToSynchronize(this.id);
		return false;
	}

	// Get sleeve towards 0 shock
	deshock(threshold) {
		if (this.info.shock >= threshold)
			return this.ns.sleeve.setToShockRecovery(this.id);
		return false;
	}

	combatSkills = () => [
		this.info.skills.agility,
		this.info.skills.dexterity,
		this.info.skills.defense,
		this.info.skills.strength,
	];

	// @TODO
	// @singularity
	helpPlayerWork() {
		// if player is exercising, join them
		// if player is criming, join them
		// if player is working for faction, join them
	}

	helpPlayerSkills(threshold) {
		// if player's stats are below 100 * skill mult, fix them
		for (let skill of ['strength', 'defense', 'dexterity', 'agility'])
			if (this.player.skills[skill] < threshold * this.player.mults[skill])
				return this.workOut(this.ns.enums.GymType[skill]);

		if (this.player.skills.hacking < threshold * this.player.mults.hacking)
			return this.studyHacking();

		if (this.player.skills.charisma < threshold * this.player.mults.charisma)
			return this.studyCharisma();

		return false;
	}

	// Commit homicide to help player get towards -54k
	commitHomicide() {
		if (this.player.karma < -54000)
			return false;

		if (this.task.crimeType === this.ns.enums.CrimeType.homicide)
			return true;

		return this.ns.sleeve.setToCommitCrime(this.id, this.ns.enums.CrimeType.homicide);
	}

	improvePhysicalSkills(skillGoals) {
		skillGoals ??= { strength: 100, defense: 100, dexterity: 100, agility: 100 };

		for (let [skill, goal] of Object.entries(skillGoals))
			if (this.info.skills[skill] < goal * this.trueMults[`${skill[0].toUpperCase() + skill.slice(1)}LevelMultiplier`])
				return this.workOut(skill);

		return false;
	}

	/**
	 * @param {String} The three-letter skill (agi, def, dex, str).
	 */
	workOut(skill) {
		if (!this.travelTo(this.ns.enums.CityName.Sector12))
			return false;
		return this.ns.sleeve.setToGymWorkout(
			this.id,
			this.ns.enums.LocationName.Sector12PowerhouseGym,
			skill
		)
	}

	studyHacking() {
		if (!this.travelTo(this.ns.enums.CityName.Volhaven))
			return false;

		return this.ns.sleeve.setToUniversityCourse(
			this.id,
			this.ns.enums.LocationName.VolhavenZBInstituteOfTechnology,
			this.ns.enums.UniversityClassType.algorithms,
		)
	}

	studyCharisma() {
		if (!this.travelTo(this.ns.enums.CityName.Volhaven))
			return false;

		return this.ns.sleeve.setToUniversityCourse(
			this.id,
			this.ns.enums.LocationName.VolhavenZBInstituteOfTechnology,
			this.ns.enums.UniversityClassType.leadership,
		)
	}

	/**
	 * Ensures the sleeve is in the city.
	 *
	 * @param {String} location The name of the city.
	 * @return {Boolean} whether or not the sleeve is now in the city
	 */
	travelTo(location) {
		if (this.info.city === location)
			return true;

		return this.ns.sleeve.travel(this.id, location)
	}

	// @TODO implement
	doJob() {
		// if the player has jobs at any companies, work on them
		// ...
		// maybe train hacking and charisma?
		return false;
	}

	// @TODO implement
	gainRep() {
		// if the player is a member of any factions, gain rep for them
		return false;
	}

	/**
	 * Instead of "starting" a task, this short-circuits the logic if the sleeve is in the
	 * middle of an existing Bladeburner task.
	 */
	taskInProgress() {
		return this.ns.sleeve.getTask(this.id)?.cyclesWorked >= 20;
	}

	bbHelpPlayerJoin() {
		if (this.inBladeburners) return false;

		for (let skill of ['strength', 'defense', 'dexterity', 'agility'])
			if (this.player.skills[skill] < 100)
				return this.workOut(this.ns.enums.GymType[skill]);

		return false;
	}

	bbDoContracts() {
		if (!this.inBladeburners) return false;

		for (let contractName of BLADEBURNER_CONTRACT_TYPES) {
			const successChance = this.ns.bladeburner
				.getActionEstimatedSuccessChance('Contracts', contractName, this.id)[0];
			if (successChance < 0.95) continue;
			if (this.task.actionName === contractName) return true;
			if (this.ns.bladeburner.getActionCountRemaining('Contracts', contractName) < 1) continue;
			if (Sleeve.currentSleeves.some(s => this.ns.sleeve.getTask(s.id)?.actionName === contractName)) continue;
			return this.ns.sleeve.setToBladeburnerAction(this.id, 'Take on contracts', contractName);
		}
		return false;
	}

	bbDoRecruitment() {
		if (!this.inBladeburners) return false;

		const successChance = this.ns.bladeburner
			.getActionEstimatedSuccessChance('General', 'Recruitment')[0];
		if (successChance < 0.90) return false;
		if (this.task.actionName === 'Recruitment') return true;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Recruitment');
	}

	// Note: Maybe this should come last; it's less effective the more sleeves are doing it
	// @TODO monitor scaling
	bbDoFieldAnalysis() {
		if (!this.inBladeburners) return false;

		const estimations = BLADEBURNER_OPERATION_TYPES //BLADEBURNER_CONTRACT_TYPES
			.map(c => this.ns.bladeburner.getActionEstimatedSuccessChance('Operations', c));
		const threshold = 0.01 * Math.max(0, Sleeve.currentSleeves.filter(s => this.ns.sleeve.getTask(s.id)?.actionName === ('Field Analysis')).length - 1);
		if (estimations.every(([min, max]) => max - min <= threshold)) return false;
		if (this.task.actionName === 'Field Analysis') return true;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Field Analysis');
	}

	// @TODO monitor auto-scale
	// @TODO extract strings
	bbRecoverStamina() {
		if (!this.inBladeburners) return false;

		const [current, max] = this.ns.bladeburner.getStamina();
		const threshold = 0.9 - 0.1 * (Sleeve.currentSleeves.filter(s => this.ns.sleeve.getTask(s.id)?.actionName === 'Hyperbolic Regeneration Chamber').length - 1);
		if (current / max >= threshold) return false;
		if (this.task.actionName === 'Hyperbolic Regeneration Chamber') return true;

		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Hyperbolic Regeneration Chamber');
	}

	bbTrainStamina(threshold) {
		if (this.inBladeburners) return false;
		if (this.ns.bladeburner.getStamina()[1] >= threshold) return false;

		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Training');
	}

	bbGenerateContracts() {
		if (!this.inBladeburners) return false;

		const contractsAvailable = BLADEBURNER_CONTRACT_TYPES
			.map(c => this.ns.bladeburner.getActionCountRemaining('Contracts', c));
		if (contractsAvailable.every(count => count > 100)) return false;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Infiltrate Synthoids');
	}

	// @TODO: decide if this is a good threshold
	bbReduceChaos() {
		if (!this.inBladeburners) return false;

		const chaos = this.ns.bladeburner.getCityChaos(this.bbCity);
		const threshold = 40 + (Sleeve.currentSleeves.filter(s => this.ns.sleeve.getTask(s.id)?.actionName === ('Diplomacy')).length - 1) * 5;
		if (chaos < threshold) return false;
		if (this.task.actionName === 'Diplomacy') return true;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Diplomacy');
	}

	idle() {
		return this.ns.sleeve.setToIdle(this.id);
	}
}
