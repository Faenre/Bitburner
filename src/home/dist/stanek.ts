/**
 * Utility to roate through stanek fragments.
 *
 * To use, click-and-drag the current Active Fragments Summary
 * and copy/paste in the below quote.
 *
 * @TODO replace the copy-paste with either a bb-http endpoint or a DOM reader
 * @TODO add visualizer
 */

const STANEK = ((`
[2,0]

+0.00% strength experience and skill level

[1,0]

+0.00% agility experience and skill level

[1,3]

+0.00% all bladeburner stats

[3,3]

+0.00% dexterity experience and skill level

`).match(/(?<=\[)[\d]+,[\d]+(?=\])/g) ?? [])	// matches [3,3] minus brackets
	.map((s: string) => s.split(','));					// turns into [x, y] pairs

/** @param {NS} ns */
export async function main(ns: NS) {
	ns.disableLog('stanek.chargeFragment');
	ns.tail();

	while (true)
		for (const [x, y] of STANEK) {
			ns.print(`INFO now charging ${x}, ${y}`);
			await ns.stanek.chargeFragment(Number(x), Number(y));
		}
}
