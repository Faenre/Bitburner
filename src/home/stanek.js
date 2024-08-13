// @TODO replace this with bb-http endpoint
const STANEK = (`

[2,0]

+45.13% strength experience and skill level

[0,0]

+41.02% defense experience and skill level

[1,0]

+8.93% all bladeburner stats

[3,3]

+0.00% agility experience and skill level

[0,3]

+0.00% dexterity experience and skill level

`).match(/(?<=\[)[\d]+,[\d]+(?=\])/g)		// matches [3,3] without the brackets
	.map(s => s.split(','));							// turns into [x, y] pairs

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('stanek.chargeFragment');
	ns.tail();

	while (true)
		for (let [x, y] of STANEK) {
			ns.print(`INFO now charging ${x}, ${y}`);
			await ns.stanek.chargeFragment(x, y);
		}
}
