import { avg, sum } from './lib/math';
import { bold, colorizeGradient, colorizeBG } from './lib/textutils';
import { SolidProgressBar } from './lib/textui';
import { getHQ, City, Blade } from './lib/blade';

const INCLUDE_SLEEVES = true;

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	do {
		ns.clearLog();
		const hq = getHQ(ns);
		const blades = Blade.getBlades(ns, INCLUDE_SLEEVES);

		drawDashboard(ns, hq, blades);
	} while (await ns.bladeburner.nextUpdate());
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
		if (blade.isPlayer && INCLUDE_SLEEVES)
			ns.print('├───────────┼────────────────────────────────────┼────────────────┤');
	}

	ns.print('├───────────┴───────────────────────┬────────────┴───┬────────────┤');

	/**
	 * Stats
	 */
	const [sCurrent, sMaximum] = hq.stamina;
	const sPct = sCurrent / sMaximum;
	const stamina = 'Stamina:' + colorizeGradient((`${sCurrent.toFixed(1)}/${sMaximum.toFixed(1)} (${(sPct*100).toFixed(1)}%)`).padStart(25), sPct);
	let rank = `Rank:${ns.formatNumber(hq.rank).padStart(9)}`;
	const allBlopsComplete = hq.blackOpIndex === -1;
	if (hq.rank > 400000) rank = colorizeBG(rank, allBlopsComplete ? 'cyan' : 'magenta');
	const skillPoints = `SP:${hq.skillPoints.toFixed(0).padStart(7)}`;
	ns.print(`│ ${[stamina, rank, skillPoints].join(' │ ')} │`)

	/**
	 * Bonus time
	 */
	const bonusTime = ns.bladeburner.getBonusTime();
	if (bonusTime > 5000) {
		ns.print('├───────────────────────────────────┴────────────────┴────────────┤');
		ns.print(`│ Bonus time: ${String(ns.tFormat(bonusTime)).padEnd(51)} │`);
		ns.print('├───────────┬────────────────────┬─────────────┬──────────────────┤');
	} else
		ns.print('├───────────┬────────────────────┬──┴──────────┬─────┴────────────┤');

	/**
	 * Cities
	 */
	const cities = City.getCities(ns);
	const preferredPop = 1.66e9
	const playerCity = hq.city;
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
