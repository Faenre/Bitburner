import { Network } from 'lib/hacknet';

const WALLET_PCT_DEFAULT = 0.4;
const MAX_HOURS_DEFAULT = 24;

/** 
 * Manages Hacknet servers, by selling hashes and 
 * automatically purchasing upgrades within a specified
 * budget of the player's active funds.
 * 
 * Requires Bitnode 9.1 and Formulas API to use.
 * See the v1 version for hacknet servers without the Formulas API.
 * 
 * @param {NS} ns 
 * @arg {number} What decimal percentage of the wallet is considered viable? Default 0.4 (40%)
 * @arg {number} How many hours' worth of growth should we cap it at?
 * */
export async function main(ns) {
  ns.disableLog('sleep');
  ns.tail();
  const walletPct = ns.args[0] || WALLET_PCT_DEFAULT;
  const maxHours = ns.args[1] || MAX_HOURS_DEFAULT;

  const network = new Network(
    ns,
    () => ns.getPlayer().money * walletPct,
    maxHours
  );

  do {
    network.buyMoney();

    // @TODO: add some logic *here* to disable this after some point
    network.buyServers();
    network.buyUpgrades();
  } while (await ns.sleep(15e3));
}
