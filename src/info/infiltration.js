/**
 * Reads all possible infiltration minigame locations
 * and dumps their stats to a json file.
 *  
 * @param {NS} ns 
 * */
export async function main(ns) {
	const infos = ns
		.infiltration
		.getPossibleLocations()
		.reduce(
			(h, iLoc) => ({ ...h, [iLoc.name]: ns.infiltration.getInfiltration(iLoc.name) }),
			{}
		);
	ns.write('/info/infiltration.json', JSON.stringify(infos), 'w');
}
