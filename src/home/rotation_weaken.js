/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  while (true) {
  	const hosts = ns.read('bots.txt').trim().split("\n");
		
    for (let host of hosts) {
			const info = JSON.parse(ns.read(`/servers/${host}.json`));
			const secMinimum = info.minDifficulty;
			// if (info.moneyMax)
			// 	await ns.weaken(host);
			// const secMinimum = ns.getServerMinSecurityLevel(host);
			let secCurrent = ns.getServerSecurityLevel(host);
			if (secCurrent > secMinimum * 1.2) {
				const effect = await ns.weaken(host);
				secCurrent = ns.getServerSecurityLevel(host);
				const status = (secCurrent == secMinimum) ? 'SUCCESS' : 'WARNING';
				ns.print(`${status} ${host} weakened by ${effect} to ${secCurrent.toFixed(3)} (min. ${secMinimum})`);
			} else 
				ns.print(`INFO skipping ${host}`);
				await ns.sleep(5e3);
    }
  }
}