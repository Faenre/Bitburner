import { avg, sum } from '../lib/math';
import { bold, colorizeGradient, colorizeBG, Color } from '../lib/textutils';
import { SolidProgressBar } from '../lib/textui';
import { getFromApi } from '../HTTP/API';
import { BladeData } from '../HTTP/endpoints/blade';

const INCLUDE_SLEEVES = true;
const CHAR_HEIGHT = 26;
const CHAR_WIDTH = 10;
const LINE_SIZE = 1;

/**
 * Displays a dashboard with current Blade stats.
 *
 * @param {NS} ns
 * @arg {boolean} ns.args.0
 * */
export async function main(ns: NS) {
	const includeSleeves = Boolean(ns.args[0] ?? INCLUDE_SLEEVES);

	/**
	 * Resize tail
	*/
	ns.disableLog('ALL');
	const cols = 80;
	let rows = 14;
	if (includeSleeves) rows += 9;
	if (ns.bladeburner.getBonusTime()) rows += 2;
	ns.tail();
	ns.resizeTail(cols*CHAR_WIDTH, rows*LINE_SIZE*CHAR_HEIGHT);

	do {
		const blade = (await getFromApi(ns, {endpoint: 'bladeburner', callback: 2060, data:{}})).data as BladeData;
		drawDashboard(ns, blade, includeSleeves);
	} while (await ns.sleep(1000));
}

// Drawing character reference: │└┬┤┌┼┐├┴─┘
function drawDashboard(ns: NS, bladeData: BladeData, includeSleeves?: boolean) {
	const hq = bladeData.hq;
	const blades = bladeData.blades.slice(0, includeSleeves ? 9 : 1);
	const cities = bladeData.cities;
	ns.clearLog();

	/**
	 * Blade characters
	 */
	ns.print('┌───────────┬────────────────────────────────────┬────────────────┐');
	for (const blade of blades) {
		let name = blade.name.padEnd(9);
		if (blade.isPlayer) name = bold(name);
		const level = blade.task.level === -1 ? '' : `-${blade.task.level}`
		const task = colorizeGradient((blade.task.name + level).padEnd(34), blade.task.successAvg);
		const bar = SolidProgressBar(blade.task.progress, 14);
		ns.print(`│ ${[name, task, bar].join(' │ ')} │`);
		if (blade.isPlayer && blades.length > 1)
			ns.print('├───────────┼────────────────────────────────────┼────────────────┤');
	}

	ns.print('├───────────┴───────────────────────┬────────────┴───┬────────────┤');

	/**
	 * Stats
	 */
	const [sCurrent, sMaximum] = hq.stamina;
	const sPct = sCurrent / sMaximum;
	const stamina = 'Stamina:' + colorizeGradient((`${ns.formatNumber(sCurrent, 2)}/${ns.formatNumber(sMaximum, 2)} (${(sPct*100).toFixed(1)}%)`).padStart(25), sPct);
	let rank = `Rank:${ns.formatNumber(hq.rank).padStart(9)}`;
	const allBlopsComplete = hq.nextBlackOpIndex === -1;
	if (hq.rank > 400000) rank = colorizeBG(rank, allBlopsComplete ? Color.cyan : Color.magenta);
	const skillPoints = `SP:${ns.formatNumber(hq.skillPoints, 2, 1e5, true).padStart(7)}`;
	ns.print(`│ ${[stamina, rank, skillPoints].join(' │ ')} │`)

	/**
	 * Bonus time
	 */
	if (hq.bonusTime > 5000) {
		ns.print('├───────────────────────────────────┴────────────────┴────────────┤');
		ns.print(`│ Bonus time: ${String(ns.tFormat(hq.bonusTime)).padEnd(51)} │`);
		ns.print('├───────────┬────────────────────┬─────────────┬──────────────────┤');
	} else
		ns.print('├───────────┬────────────────────┬──┴──────────┬─────┴────────────┤');

	/**
	 * Cities
	 */
	const preferredPop = 1.66e9
	for (const city of cities) {
		const name = city.name === hq.city ? bold(city.name.padEnd(9)) : city.name.padEnd(9);
		const population = colorizeGradient(ns.formatNumber(city.population).padStart(8), city.population / preferredPop) + ' synthoids';
		const chaos = colorizeGradient(ns.formatNumber(city.chaos, 0).padStart(5) + ' chaos', 30 / city.chaos);
		const communities = String(city.communities).padStart(4) + ' communities';
		ns.print(`│ ${[name, population, chaos, communities].join(' │ ')} │`);
	}

	ns.print('├───────────┼────────────────────┼─────────────┼──────────────────┤');

	const totalPop = ns.formatNumber(sum(cities.map(c => c.population))).padStart(8) + ' total pop';
	const avgChaos = ns.formatNumber(avg(cities.map(c => c.chaos)), 0).padStart(5) + ' avg  ';
	const totalCommunities = String(sum(cities.map(c => c.communities))).padStart(4) + ' communities';
	ns.print(`│ ${['Global:  ', totalPop, avgChaos, totalCommunities].join(' │ ')} │`);

	ns.print('└───────────┴────────────────────┴─────────────┴──────────────────┘');
}
