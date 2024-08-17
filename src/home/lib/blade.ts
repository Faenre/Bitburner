import { CityName } from "@/NetscriptDefinitions";
import { getBladeTask, BladeTask, JOBS } from './BladeTask';


export class BladeHQ {
	rank: number;
	stamina: [number, number];
	city: string;
	skillPoints: number;
	nextBlackOp: { name: string, rank: number } | null;
	nextBlackOpIndex: number;
	bonusTime: number;

	constructor(ns: NS)	{
		this.rank = ns.bladeburner.getRank();
		this.stamina = ns.bladeburner.getStamina();
		this.city = ns.bladeburner.getCity();
		this.skillPoints = ns.bladeburner.getSkillPoints();
		this.nextBlackOp = ns.bladeburner.getNextBlackOp();
		this.nextBlackOpIndex = JOBS['Black Operations']
			.findIndex(name => name === this.nextBlackOp.name);
		this.bonusTime = ns.bladeburner.getBonusTime();
	}
}


export class City {
	name: CityName;
	population: number;
	communities: number;
	chaos: number;

	static getCities(ns: NS) {
		return Object.values(ns.enums.CityName).map(c => new City(ns, c));
	}

	constructor(ns: NS, name: CityName) {
		this.name = name;
		this.population = ns.bladeburner.getCityEstimatedPopulation(name);
		this.communities = ns.bladeburner.getCityCommunities(name);
		this.chaos = ns.bladeburner.getCityChaos(name);
	}
}


export class Blade {
	static blades = {};

	static getBlades(ns: NS, includeSleeves=true) {
		return Array(1 + (includeSleeves ? ns.sleeve.getNumSleeves() : 0))
			.fill(null)
			.map((_, i) => new Blade(ns, i-1));
	}

	ns: NS;
	isPlayer: boolean;
	name: string;
	task: BladeTask;
	isIdle: boolean;

	constructor(ns: NS, sleeveId: number=-1) {
		Blade.blades[sleeveId] = this;
		this.ns = ns;
		this.isPlayer = (sleeveId === -1);
		this.name = this.isPlayer ? 'Player' : `Sleeve.${sleeveId}`;

		this.task = getBladeTask(ns, sleeveId);
		this.isIdle = this.task.name === 'Idle' || this.task.timeSpent === 0;
	}

	// @TODO get rid of this, or move it elsewhere
	static jobsAvailable(ns: NS, isPlayer: boolean) {
		const jobs = [
			JOBS.General.map(j => ['General', j]),
			JOBS.Contracts.map(j => ['Contracts', j]),
		];
		if (!isPlayer) return jobs.flat();

		jobs.unshift(JOBS.Operations.map(j => ['Operations', j]));
		if (ns.bladeburner.getRank() > 4e5)
			jobs.unshift([['Black Operations', ns.bladeburner.getNextBlackOp().name]]);
		return jobs.flat();
	}
}

