import { getRequest } from '../HTTP/API';
import { BladeData } from '../HTTP/endpoints/blade';
import { BladeAction } from '../lib/BladeTask';
import { brailleForPercent } from '../lib/braille';
import { SleeveInfo } from '../lib/Sleeve';
import { segmentBar, SPINNER_FRAMES } from '../lib/textui';
import { Color, colorizeBG } from '../lib/textutils';

const CHAR_HEIGHT = 26;
const CHAR_WIDTH = 10;
const LINE_SIZE = 1;

/**
 * Displays a dashboard with current Sleeve bladeburner stats.
 *
 * @param {NS} ns
 * @arg {boolean} ns.args.0
 * */
export async function main(ns: NS) {
	/**
	 * Resize tail
	*/
	ns.disableLog('ALL');
	const cols = 14;
	const rows = 18;
	ns.tail();
	ns.resizeTail(cols*CHAR_WIDTH, rows*LINE_SIZE*CHAR_HEIGHT);

	do {
    // stuff
    const bladeData = await getRequest(ns, 'bladeburner') as BladeData;
    const sleeves = (await getRequest(ns, 'get_sleeves'))['sleeves'] as SleeveInfo[];
    const actions = getActionCounts(bladeData.actions);
    ns.clearLog();
    ns.print(`T: ${formatCount(ns, actions.T)}`);
    ns.print(`B: ${formatCount(ns, actions.B)}`);
    ns.print(`R: ${formatCount(ns, actions.R)}`);
    ns.print('—'.repeat(11));
    ns.print(`I: ${formatCount(ns, actions.I)}`);
    ns.print(`U: ${formatCount(ns, actions.U)}`);
    ns.print(`A: ${formatCount(ns, actions.A)}`);

    ns.print(' ');

    sleeves.forEach((sleeve) => {
      ns.print(sleeveRow(sleeve));
    });

    ns.print(' ');

    ns.print(ns.formatNumber(sleeves.reduce((sum, s) => sum + s.storedCycles, 0), 3, 1000, true) + ' sc');
	} while (await ns.bladeburner.nextUpdate());
}

function getActionCounts(actions: BladeAction[]): Record<string, number> {
  return {
    T: actions.find(a => a.name === 'Tracking').countRemaining,
    B: actions.find(a => a.name === 'Bounty Hunter').countRemaining,
    R: actions.find(a => a.name === 'Retirement').countRemaining,
    I: actions.find(a => a.name === 'Investigation').countRemaining,
    U: actions.find(a => a.name === 'Undercover Operation').countRemaining,
    A: actions.find(a => a.name === 'Assassination').countRemaining,
  }
}

function formatCount(ns: NS, number: number, width=8): string {
  let str = ns.formatNumber(Math.floor(number), 3, 1000, true);
  if (number < 1e3)
    str += brailleForPercent(number % 1, true);
  return str.padStart(width);
}

function sleeveRow(sleeve: SleeveInfo): string {
  let row = `${sleeve.id}: ${segmentBar(6, '%')(sleeve.storedCycles / 296)}`;

  if (sleeve.task?.type === 'INFILTRATE') {
    const currentPct = sleeve.task.cyclesWorked / sleeve.task.cyclesNeeded;
    // row = row.replace(' ', brailleForPercent(currentPct, true));
    row = row.replace(' ', SPINNER_FRAMES[Math.round(currentPct * 3)])
  }

  row = colorizeBG(row, colorForSleeve(sleeve))
  return row
}

function colorForSleeve(sleeve: SleeveInfo): Color {
  if (sleeve.task?.type === 'INFILTRATE')
    return (sleeve.storedCycles > 296) ? Color.cyan : Color.magenta;
  else if (sleeve.task?.type === 'BLADEBURNER')
    return Color.blue;
  else if (sleeve.storedCycles > 74 * 60 * 7)
    return Color.green;
  else
    return Color.default;
}
