import { BitNodeMultipliers, CityName, Player, SleevePerson, SleeveTask } from "@/NetscriptDefinitions";
import { BladeData } from "./HTTP/endpoints/blade";
import { getRequest } from "./HTTP/API";
import { BladeAction } from "./lib/BladeTask";
// import { SleeveInfo } from "./lib/Sleeve";

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
	do {
		const context = {
			ns,
			bladeData: await getRequest(ns, 'bladeburner') as BladeData,
			player: await getRequest(ns, 'player') as Player,
		}
		sleeves.forEach(sleeve => manageSleeve(sleeve, context));
	} while (await ns.sleep(1000));
}

// @TODO: formulize this?
const DESHOCK_TIER_1 = 85;	// above this, the sleeve isn't going to be worth much
// const DESHOCK_TIER_4 = 0; 	// needed to unlock implants

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

// const BLADEBURNER_CONTRACT_TYPES = [
// 	'Retirement',
// 	'Bounty Hunter',
// 	'Tracking',
// ];
// const BLADEBURNER_OPERATION_TYPES = [
// 	'Investigation',
// 	'Undercover Operation',
// 	'Sting Operation',
// 	'Raid',
// 	'Stealth Retirement Operation',
// 	'Assassination',
// ]

interface Context {
	ns: NS;
	bladeData: BladeData;
	player: Player;
}

function manageSleeve(currentSleeve: Sleeve, context: Context) {
	currentSleeve.reload();
	// If the sleeve has a discrete task in progress, stop everything else
	let taskAssignedSuccessfully = currentSleeve.taskInProgress()
		// || currentSleeve.synchronize()
		|| currentSleeve.deshock(DESHOCK_TIER_1);
	/**
	 * Gangs are useful for augments and generational wealth.
	 * This uses sleeves to quickly unlock them.
	*/
	taskAssignedSuccessfully ||= currentSleeve.improvePhysicalSkills(HOMICIDE_SKILL_THRESHOLDS)
		|| currentSleeve.commitHomicide(context.player.karma)

	/**
	 * If the player is trying to do Bladeburner content,
	 * help them out.
	 */
	const currentCity = context.bladeData.cities.find(city => city.name === context.bladeData.hq.city);
	if (context.bladeData.actions === undefined)
		taskAssignedSuccessfully ||= currentSleeve.bbHelpPlayerJoin(context.player)
	else
		taskAssignedSuccessfully ||= currentSleeve.bbDoContracts(
			context.bladeData.actions,
			context.bladeData.sleeveContractChances
		) || currentSleeve.bbDoFieldAnalysis(context.bladeData.actions)
			|| currentSleeve.bbRecoverStamina(context.bladeData.hq.stamina)
			|| currentSleeve.bbReduceChaos(currentCity.chaos)
			|| currentSleeve.bbGenerateContracts(context.bladeData.actions, 150)
			|| currentSleeve.bbTrainStamina(context.bladeData.hq.stamina, 300)
			|| currentSleeve.bbDoRecruitment(context.bladeData.actions)
			|| currentSleeve.improvePhysicalSkills(BLADEBURNER_SKILL_THRESHOLDS)
			|| currentSleeve.bbGenerateContracts(context.bladeData.actions, 500);


		// Get the player some basic skills
		// @TODO write a "true skill multiplier" that takes BN into account
		// || currentSleeve.helpPlayerSkills(40)

		// Singularity functions go here
		// || currentSleeve.helpPlayerWork()

		// If the PC has a job, a sleeve should help with it
		// || currentSleeve.doJob()

		// For any faction the player is member to, help them gain rep.
		// @TODO set rep limits?
		// || currentSleeve.gainRep()

		// If the player has purchased hacknet server XP, start studying int.
		// @TODO replace studyHacking with studyInt that takes the above into account
		// || currentSleeve.deshock(DESHOCK_TIER_3)
		// || currentSleeve.studyHacking()

		// Unlock implants

	// If all else fails, deshock and accrue bonus time
	taskAssignedSuccessfully ||= currentSleeve.deshock(0)
		|| currentSleeve.idle();

	currentSleeve.task = currentSleeve.ns.sleeve.getTask(currentSleeve.id);
	return taskAssignedSuccessfully
}


class Sleeve {
	ns: NS;
	id: number;
	task: SleeveTask;
	trueMults: BitNodeMultipliers;
	info: SleevePerson;
	otherSleeveIds: number[];


	static getCurrentSleeves = (ns: NS) =>
		[0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => new Sleeve(ns, i));

	static currentSleeves: Sleeve[] = [];

	constructor(ns: NS, id: number) {
		this.ns = ns;
		this.id = id;
		this.task = ns.sleeve.getTask(id);
		this.trueMults = this.ns.getBitNodeMultipliers();
		Sleeve.currentSleeves[id] = this;
	}

	// Anything that should happen only once per 'tick' goes here
	reload() {
		this.info = this.ns.sleeve.getSleeve(this.id);
		this.task = this.ns.sleeve.getTask(this.id);
	}

	// Get sleeve towards 100 sync
	// synchronize(threshold = 100) {
	// 	if (this.info.sync < threshold)
	// 		return this.ns.sleeve.setToSynchronize(this.id);
	// 	return false;
	// }

	// Get sleeve towards 0 shock
	deshock(threshold:number) {
		if (this.info.shock > threshold)
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

	helpPlayerSkills(player: Player, threshold: number) {
		// if player's stats are below 100 * skill mult, fix them
		for (const skill of ['strength', 'defense', 'dexterity', 'agility'])
			if (player.skills[skill] < threshold * player.mults[skill])
				return this.workOut(this.ns.enums.GymType[skill]);

		if (player.skills.hacking < threshold * player.mults.hacking)
			return this.studyHacking();

		if (player.skills.charisma < threshold * player.mults.charisma)
			return this.studyCharisma();

		return false;
	}

	// Commit homicide to help player get towards -54k
	commitHomicide(karma: number) {
		if (karma < -54000)
			return false;

		if (this.task?.['crimeType'] === this.ns.enums.CrimeType.homicide)
			return true;

		return this.ns.sleeve.setToCommitCrime(this.id, this.ns.enums.CrimeType.homicide);
	}

	improvePhysicalSkills(skillGoals: Record<string, number>) {
		skillGoals ??= { strength: 100, defense: 100, dexterity: 100, agility: 100 };

		for (const [skill, goal] of Object.entries(skillGoals))
			if (this.info.skills[skill] < (goal * this.trueMults[`${skill[0].toUpperCase() + skill.slice(1)}LevelMultiplier`]))
				return this.workOut(skill);

		return false;
	}

	/**
	 * @param {String} skill strength, defense, dexterity, or agility.
	 */
	workOut(skill: string) {
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
	 * @param {CityName} location The name of the city.
	 * @return {Boolean} whether or not the sleeve is now in the city
	 */
	travelTo(location: CityName): boolean {
		if (this.info.city === location)
			return true;

		return this.ns.sleeve.travel(this.id, location)
	}

	// @TODO implement
	doJob(): boolean {
		// if the player has jobs at any companies, work on them
		// ...
		// maybe train hacking and charisma?
		return false;
	}

	// @TODO implement
	gainRep(): boolean {
		// if the player is a member of any factions, gain rep for them
		return false;
	}

	/**
	 * Instead of "starting" a task, this short-circuits the logic if the sleeve is in the
	 * middle of an existing Bladeburner task.
	 */
	taskInProgress(): boolean {
		return this.ns.sleeve.getTask(this.id)?.['cyclesWorked'] >= 2;
	}

	bbHelpPlayerJoin(player: Player): boolean {
		for (const skill of ['strength', 'defense', 'dexterity', 'agility'])
			if (player.skills[skill] < 100)
				return this.workOut(this.ns.enums.GymType[skill]);

		return false;
	}

	bbDoContracts(actions: BladeAction[], chances: Record<string, [[number, number]]>): boolean {
		for (const contract of actions.filter(a => a.type === 'Contracts')) {
			const contractName = contract.name;
			const successChance = chances[contractName][this.id][0];
			if (successChance < 0.95) continue;
			if (this.task?.['actionName'] === contractName) return true;
			if (contract.countRemaining < 1) continue;
			if (Sleeve.currentSleeves.some(s => this.ns.sleeve.getTask(s.id)?.['actionName'] === contractName)) continue;
			return this.ns.sleeve.setToBladeburnerAction(this.id, 'Take on contracts', contractName);
		}
		return false;
	}

	bbDoRecruitment(actions: BladeAction[]) {
		const successChance = actions.find(a => a.name === 'Recruitment').successChances[0];
		if (successChance < 0.90) return false;
		if (this.task?.['actionName'] === 'Recruitment') return true;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Recruitment');
	}

	bbDoFieldAnalysis(actions: BladeAction[]) {
		const estimations = actions.map(a => a.successChances);
		if (estimations.every(([min, max]) => max - min == 0)) return false;
		if (this.task?.['actionName'] === 'Field Analysis') return true;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Field Analysis');
	}

	// @TODO monitor auto-scale
	// @TODO extract strings
	bbRecoverStamina(stamina: [number, number]) {
		const [current, max] = stamina;
		const threshold = 0.9 - 0.1 * (Sleeve.currentSleeves.filter(s => this.ns.sleeve.getTask(s.id)?.['actionName'] === 'Hyperbolic Regeneration Chamber').length);
		if (current / max >= threshold) return false;
		if (this.task?.['actionName'] === 'Hyperbolic Regeneration Chamber') return true;

		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Hyperbolic Regeneration Chamber');
	}

	bbTrainStamina(stamina: [number, number], staminaThreshold: number) {
		if (stamina[1] >= staminaThreshold) return false;
		if (this.task?.['actionName'] === 'Training') return true;

		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Training');
	}

	bbGenerateContracts(actions: BladeAction[], threshold: number) {
		if (this.info.storedCycles === 0) return false;

		if (this.task?.['actionName'] === 'Infiltrate Synthoids')
			return true;
		else if (Sleeve.currentSleeves.some(s => s.task?.type === 'INFILTRATE'))
			return false;

		if (actions.some(a => a.countRemaining < threshold))
			return this.ns.sleeve.setToBladeburnerAction(this.id, 'Infiltrate Synthoids');

		return false;
	}

	bbReduceChaos(chaos: number) {
		const threshold = 35 + (Sleeve.currentSleeves.filter(s => s.task?.['actionName'] === ('Diplomacy')).length) * 5;
		if (chaos < threshold) return false;
		if (this.task?.['actionName'] === 'Diplomacy') return true;
		if (Sleeve.currentSleeves.filter(s => s.task?.['actionName'] === 'Diplomacy').length * 5 > chaos - threshold)
			return false;
		return this.ns.sleeve.setToBladeburnerAction(this.id, 'Diplomacy');
	}

	idle() {
		this.ns.sleeve.setToIdle(this.id);
		return true;
	}
}
