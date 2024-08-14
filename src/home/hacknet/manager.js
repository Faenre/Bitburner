import { Network } from '../lib/hacknet';
import { bold } from '../lib/textutils';
import { segmentBar } from '../lib/textui';

const WALLET_PCT_DEFAULT = 0.3;
const MAX_HOURS_DEFAULT = 12;

/**
 * Manages Hacknet servers, by selling hashes and
 * automatically purchasing upgrades within a specified
 * budget of the player's active funds.
 *
 * Requires Bitnode 9.1 and Formulas API to use.
 * See the v1 version for hacknet servers without the Formulas API.
 *
 * @param {NS} ns
 * @arg {number} How many hours' worth of growth should we cap it at?
 * */
export async function main(ns) {
	ns.disableLog('sleep');
	ns.tail();
	const walletPct = WALLET_PCT_DEFAULT;
	const maxHours = ns.args[0] || MAX_HOURS_DEFAULT;
	// const timeRemaining = () => (maxHours * 3600) - (ns.getTimeSinceLastAug() / 1000)
	const getBudget = () => ns.getPlayer().money * walletPct;

	const secondsInNode = () => (Date.now() - ns.getResetInfo().lastAugReset) / 1e3
	const secondsRemaining = () => (maxHours * 3600) - (secondsInNode());
	const timer = segmentBar(40);

	const network = new Network(ns, secondsRemaining);

	do {
		network.buyMoney();

		if (secondsRemaining() > 0){
			ns.print(`INFO Remaining time: ${bold((secondsRemaining()/3600).toFixed(1) + "h")} remaining`);
			ns.print(timer(secondsInNode() / (maxHours * 3600)));
			network.buyServers(getBudget(), secondsRemaining());
			network.buyUpgrades(getBudget(), secondsRemaining());
		} else
			ns.print(`INFO Maximum time exceeded; no more upgrades will be purchased`);

		// @TODO: add some logic *here* to disable this after some point
	} while (await ns.sleep(15e3));
}
