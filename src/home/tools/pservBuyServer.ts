import { bold } from '../lib/textutils';

/**
 * Buys or upgrades ram 'r' onto pserv 'p'
 *
 * @param {NS} ns
 * @param {Number} ns.args.0 The 2^p exponent (64gb == 2**6, p=6)
 * @param {String} ns.args.1 The pserv to buy (otherwise, default to i=0)
 * */
export async function main(ns: NS): Promise<{ return: never; }> {
  const ramExponent = Number(ns.args[0]);
  if (!ramExponent) {
    ns.tprint(`INFO Please consult the below list:`);
    for (let i=1; i < 21; i++) {
      const cost = ns.getPurchasedServerCost(2**i);
      ns.tprint(''
        + bold(`(2**${String(i)})`.padStart(7))
        + ' == '
        + ns.formatRam(2**i, 0).padStart(5)
        + ' for $ '
        + bold(ns.formatNumber(cost).padStart(8))
      );
    }
    return;
  }
  const servers = ns.getPurchasedServers();
  const serverName = String(ns.args[1] || servers[0] || 'pserv-0');
  let result: boolean;
  if (servers.includes(serverName))
    result = ns.upgradePurchasedServer(serverName, 2**ramExponent);
  else
    result = ns.purchaseServer(serverName, 2**ramExponent) === serverName;

  ns.tprint(`${result ? 'SUCCESS' : 'ERROR'}`);
  return;
}
