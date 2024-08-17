/**
 * Prints player karma gain rate at the bottom right of the screen.
 *
 * @param {NS} ns
 * */
export async function main(ns) {
	let oldKarma = ns.getPlayer().karma;
	ns.toast(`Starting watcher at ${oldKarma.toFixed(2)} karma`, 'info', 60e3)

	while (await ns.sleep(60e3)) {
		const newKarma = ns.getPlayer().karma;
		ns.toast(`Now at ${newKarma.toFixed(2)} karma (${(newKarma - oldKarma).toFixed(2)}/min)`, 'info', 60e3);
		oldKarma = newKarma;
	}
}
