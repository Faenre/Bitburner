import { avg, sum } from 'lib/math';
import { bold, colorizeGradient } from 'lib/textutils';
import { SolidProgressBar } from 'lib/textui';

const ALLOW_SLEEVES = true;

const JOBS = {
	'General': [
		'Recruitment',
	],
	'Contracts': [
		'Retirement',
		'Bounty Hunter',
		'Tracking',
	],
	'Operations': [
		'Assassination',
		'Stealth Retirement Operation',
		// 'Raid',
		// 'Sting Operation',
		'Undercover Operation',
		'Investigation',
	],
}

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	const hq = HQ(ns);
	do {
		ns.clearLog();
		const blades = Blade.getBlades(ns);

		drawDashboard(ns, hq, blades);
	} while (await ns.bladeburner.nextUpdate());
}


function HQ(ns) {
	return {
		stamina: () => ns.bladeburner.getStamina(),
		skillPoints: () => ns.bladeburner.getSkillPoints(),
		rank: () => ns.bladeburner.getRank(),
	}
}


class City {
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


class Blade {
	static blades = {};

	static getBlades(ns, includeSleeves=ALLOW_SLEEVES) {
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
			.filter(([_typ, name]) => Object.values(Blade.blades).every(b => b.task.name !== name))
	)[0]
}

class Task {
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
		const name = task.actionName || 'Infiltrating Synthdroids';
		const timeSpent = task.cyclesWorked || task.timeSpent || 0;
		const taskTime = task.cyclesNeeded || task.taskTime || 1;
		let level = -1;
		if (type === 'Contracts') 
			level = ns.bladeburner.getActionCurrentLevel(type, name);
		return { type, name, timeSpent, taskTime, level }
	}
}


function drawDashboard(ns, hq, blades) {

	// Drawing character reference: │└┬┤┌┼┐├┴─┘

	/**
	 * Blade characters
	 */
	ns.print('┌───────────┬────────────────────────────────────┬────────────────┐');
	for (let blade of blades) {
		let name = blade.name.padEnd(9);
		if (blade.isPlayer) name = bold(name);
		const level = blade.task.level === -1 ? '' : `-${blade.task.level}`
		const task = colorizeGradient((blade.task.name + level).padEnd(34), blade.successLower);
		const bar = SolidProgressBar(blade.pctWorked, 14);
		ns.print(`│ ${[name, task, bar].join(' │ ')} │`);
		if (blade.isPlayer)
			ns.print('├───────────┼────────────────────────────────────┼────────────────┤');
	}

	ns.print('├───────────┴───────────────────────┬────────────┴───┬────────────┤');

	/**
	 * Stats
	 */
	const [sCurrent, sMaximum] = hq.stamina();
	const sPct = sCurrent / sMaximum;
	const stamina = 'Stamina:' + colorizeGradient((`${sCurrent.toFixed(1)}/${sMaximum.toFixed(1)} (${(sPct*100).toFixed(1)}%)`).padStart(25), sPct);
	const rank = `Rank:${ns.formatNumber(hq.rank()).padStart(9)}`;
	const skillPoints = `SP:${hq.skillPoints().toFixed(0).padStart(7)}`;
	ns.print(`│ ${[stamina, rank, skillPoints].join(' │ ')} │`)

	ns.print('├───────────┬────────────────────┬──┴──────────┬─────┴────────────┤');

	/**
	 * Cities
	 */
	const cities = City.getCities(ns);
	const preferredPop = 1.66e9
	const playerCity = ns.bladeburner.getCity();
	for (let city of cities) {
		const name = city.name === playerCity ? bold(city.name.padEnd(9)) : city.name.padEnd(9);
		const population = colorizeGradient(ns.formatNumber(city.population).padStart(8), city.population / preferredPop) + ' synthoids';
		const chaos = colorizeGradient(city.chaos.toFixed(1).padStart(5) + ' chaos', 30 / city.chaos);
		const communities = String(city.communities).padStart(4) + ' communities';
		ns.print(`│ ${[name, population, chaos, communities].join(' │ ')} │`);
	}

	ns.print('├───────────┼────────────────────┼─────────────┼──────────────────┤');

	const totalPop = ns.formatNumber(sum(cities.map(c => c.population))).padStart(8) + ' total pop';
	const avgChaos = avg(cities.map(c => c.chaos)).toFixed(1).padStart(5) + ' avg  ';
	const totalCommunities = String(sum(cities.map(c => c.communities))).padStart(4) + ' communities';
	ns.print(`│ ${['Global:  ', totalPop, avgChaos, totalCommunities].join(' │ ')} │`);

	ns.print('└───────────┴────────────────────┴─────────────┴──────────────────┘');
}
