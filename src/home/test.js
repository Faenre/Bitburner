/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.print(`INFO ==========`);
	ns.disableLog('sleep');

	ns.print(ns.sleeve.getTask(0));
	ns.print('this is a test');
	ns.print(ns.bladeburner.getBlackOpNames());
}


// class Abc {
// 	constructor(ns) {
// 		this.ns = ns;
// 	}

// 	someValue = () => [4,5,6];
// }

// class Xyz extends Abc {
// 	printThing(thing) {
// 		this.ns.print('printing a thing');
// 		this.ns.print(thing);
// 		this.ns.print(this.someValue());
// 	}
// }
