/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  while (true) {
  	const hosts = ns.read('bots.txt').trim().split("\n");
		
    for (let host of hosts) {
			const info = JSON.parse(ns.read(`/servers/${host}.json`))
			// if (info.moneyMax)
			// 	await ns.grow(host);
			const moneyAvailable = ns.getServerMoneyAvailable(host);
			const moneyMax = info.moneyMax;
			// const moneyMax = ns.getServerMaxMoney(host);
			if (moneyAvailable >= (moneyMax * 0.8)) {
				ns.print(`INFO skipping ${host}`);
				await ns.sleep(5e3);
				continue;
			};

			const growth = await ns.grow(host);

			const moneyAfterGrow = ns.getServerMoneyAvailable(host);
			const moneyGrown = ns.formatNumber(moneyAfterGrow / growth);
			const moneyStr = ns.formatNumber(moneyAfterGrow);
			const moneyPct = (moneyAfterGrow / moneyMax * 100).toFixed(2);
			const status = (moneyAfterGrow >= moneyMax) ? 'SUCCESS' : 'WARNING';
			ns.print(`${status} ${host} grown to ${moneyStr} (+\$${moneyGrown}) (${moneyPct}%)`);
    }
  }
}
// x1 * g = x2
// x1 = x2/g