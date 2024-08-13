/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	buy(ns, 256);
	for (let i=1; i < 20; i++)
		ns.print(
			`2**${i} => `
			+ ns.formatRam(2**i)
			+ ' => '
			+ ns.formatNumber(ns.getPurchasedServerCost(2**i))
		);
}

function buy(ns, ram) {
	ns.purchaseServer('pserv-0', ram);
}
