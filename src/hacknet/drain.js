const HASH_SELL_FOR_MONEY = "Sell for Money";

/** 
 * This sells hacknet hashes for money (typically, 4.00 hashes == 1 mil).
 * It can optionally repeat every 30 seconds.
 * 
 * @param {NS} ns 
 * @arg {boolean} whether to perform once or loop
 * */
export async function main(ns) {
  do {
    const hashes = ns.hacknet.numHashes();
    const cost = ns.hacknet.hashCost(HASH_SELL_FOR_MONEY);
    const timesToBuy = Math.floor(hashes / cost);
    ns.hacknet.spendHashes(HASH_SELL_FOR_MONEY, '', timesToBuy);
  } while (ns[0] && await ns.sleep(30e3));
}
