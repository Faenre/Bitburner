/** @param {NS} ns */
export async function main(ns) {
	const getKarma = () => ns.getPlayer().karma;

	let oldKarma = getKarma();
	do {
		const newKarma = getKarma();
		ns.toast(`Now at ${newKarma.toFixed(2)} karma (${(newKarma - oldKarma).toFixed(2)}/min)`, 'info', 60e3);
		oldKarma = newKarma;
	} while (await ns.sleep(60e3));
}

function getKarma(ns) {
	const player = ns.getPlayer();
	return player.karma;
}