const JOBS = {
	'Operations': [
		'Assassination',
		'Stealth Retirement Operation',
		// 'Raid',
		// 'Sting Operation',
		'Undercover Operation',
		'Investigation',
	],
	'Contracts': [
		'Retirement',
		'Bounty Hunter',
		'Tracking',
	],
	'General': [
		'Recruitment',
	],
};

const BLACK_OP_NAMES = [
	"Operation Typhoon",
	"Operation Zero",
	"Operation X",
	"Operation Titan",
	"Operation Ares",
	"Operation Archangel",
	"Operation Juggernaut",
	"Operation Red Dragon",
	"Operation K",
	"Operation Deckard",
	"Operation Tyrell",
	"Operation Wallace",
	"Operation Shoulder of Orion",
	"Operation Hyron",
	"Operation Morpheus",
	"Operation Ion Storm",
	"Operation Annihilus",
	"Operation Ultron",
	"Operation Centurion",
	"Operation Vindictus",
	"Operation Daedalus",
];


//@TODO decide if this should be a class (with functionality), or
//	a simple object with static properties
export function getHQ(ns) {
	const rank = ns.bladeburner.getRank();
	const stamina = ns.bladeburner.getStamina();
	const city = ns.bladeburner.getCity();
	const skillPoints = ns.bladeburner.getSkillPoints();
	const nextBlackOp = ns.bladeburner.getNextBlackOp();
	const blackOpIndex = BLACK_OP_NAMES.findIndex(nextBlackOp);

	return { rank, stamina, city, skillPoints, nextBlackOp, blackOpIndex };
}


export class City {
	static getCities(ns) {
		return Object.values(ns.enums.CityName).map(c => new City(ns, c));
	}

	constructor(ns, name) {
		this.name = name;
		this.population = ns.bladeburner.getCityEstimatedPopulation(name);
		this.communities = ns.bladeburner.getCityCommunities(name);
		this.chaos = ns.bladeburner.getCityChaos(name);
	}
}


export class Blade {
	static blades = {};

	static getBlades(ns, includeSleeves=true) {
		return Array(1 + (includeSleeves ? ns.sleeve.getNumSleeves() : 0))
			.fill(null)
			.map((_, i) => new Blade(ns, i-1));
	}

	/**
	 * Creates a new Blade character reference.
	 *
	 * @param {NS} ns
	 * @param {Number} sleeveId The ID of a sleeve. Default is -1 (player).
	 */
	constructor(ns, sleeveId=-1) {
		Blade.blades[sleeveId] = this;
		this.ns = ns;
		this.isPlayer = (sleeveId === -1);
		this.name = this.isPlayer ? 'Player' : `Sleeve.${sleeveId}`;

		this.task = this.isPlayer ? Task.playerTask(ns) : Task.sleeveTask(ns, sleeveId);
		switch (this.task.type) {
			case 'INFILTRATE':
				this.successPcts = [1, 1]; break;
			case 'General':
			case 'Contracts':
			case 'Operations':
			case 'Black Operations':
				this.successPcts = ns.bladeburner.getActionEstimatedSuccessChance(
					this.task.type,
					this.task.name,
					this.isPlayer ? null : sleeveId
				); break;
			default:
				this.successPcts = [-1, -1];
		}
		this.pctWorked = this.task.timeSpent / this.task.taskTime;
		this.successLower = this.successPcts[0];
		this.isIdle = this.task.name === 'Idle' || this.task.timeSpent === 0;
	}

	jobsAvailable() {
		const jobs = [];
		jobs.unshift(JOBS.General.map(j => ['General', j]));
		jobs.unshift(JOBS.Contracts.map(j => ['Contracts', j]));
		if (!this.isPlayer) return jobs.flat();

		jobs.unshift(JOBS.Operations.map(j => ['Operations', j]));
		if (this.ns.bladeburner.getRank() < 4e5) return jobs.flat();

		jobs.unshift(['Black Operations', this.ns.bladeburner.getNextBlackOp().name]);
		return jobs.flat();
	}

	pickNextTask = () => (
		this.jobsAvailable()
			.filter(([type, name]) => this.ns.bladeburner.getActionCountRemaining(type, name) > 0)
			.filter(([type, name]) => this.ns.bladeburner.getActionEstimatedSuccessChance(type, name)[0] > 0.95)
			.filter(([_, name]) => Object.values(Blade.blades).every(b => b.task.name !== name))
	)[0]
}


export class Task2 {
	type;
	name;
	timeSpent;
	taskTime;
	level;
}

// class PlayerTask extends Task2 {
// 	constructor(ns) {
// 		super(ns)
// 	}
// }


export class Task {
	static playerTask(ns) {
		const task = ns.bladeburner.getCurrentAction() || {};
		const type = task.type;
		const name = task.name || 'Idle';
		const timeSpent = ns.bladeburner.getActionCurrentTime() || 0;
		const taskTime = name === 'Idle' ? 1 : ns.bladeburner.getActionTime(type, name);
		let level = -1;
		if (['Contracts', 'Operations'].includes(type))
			level = ns.bladeburner.getActionCurrentLevel(type, name);
		return { type, name, timeSpent, taskTime, level }
	}

	static sleeveTask(ns, id) {
		const task = ns.sleeve.getTask(id) || { actionName: 'Idle' };
		const type = task.actionType || task.type;
		const name = task.actionName || (task.type === 'INFILTRATE' ? 'Infiltrating Synthdroids' : 'Other');
		const timeSpent = task.cyclesWorked || task.timeSpent || 0;
		const taskTime = task.cyclesNeeded || task.taskTime || 1;
		let level = -1;
		if (type === 'Contracts')
			level = ns.bladeburner.getActionCurrentLevel(type, name);
		return { type, name, timeSpent, taskTime, level }
	}
}