import { getHosts } from './lib/servers';
import { colorize, bold } from './lib/textutils';
import { SOLVERS } from './contracts/solutions';

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail();
	const contracts = Contract.getAllContracts(ns);

	function logResult(c, result) {
		if (result)
			ns.print(`SUCCESS solved ${bold(c.type)} on ${c.host}: ${colorize(result, 'cyan')}`);
		else
			ns.print(`ERROR solver FAILED for ${c.host}:${c.filename}! (${c.type})`);
	}

	// solve contracts that we can solve
	contracts
		.filter(c => c.canSolve())
		.forEach(c => logResult(c, c.solve()));

	// print the ones we can't
	// @TODO aggregate these into a hash and print as a "bounty board"
	contracts
		.filter(c => !c.canSolve())
		.forEach(c => ns.print(`INFO skipping ${c.host}:${c.filename} (${c.type})`));
}

class Contract {
	static getAllContracts = (ns) =>
		getHosts(ns).flatMap(host =>
			ns.ls(host, '.cct').map(filename =>
				new Contract(ns, host, filename)));

	constructor(ns, host, filename) {
		this.ns = ns;
		this.host = host;
		this.filename = filename;
		this.type = ns.codingcontract.getContractType(filename, host);
	}

	canSolve = () => (this.type in SOLVERS);
	solve = () => this.ns.codingcontract.attempt(this.getSolution(), this.filename, this.host);
	getSolution = () => SOLVERS[this.type](this.getContractData());
	getContractData = () => this.ns.codingcontract.getData(this.filename, this.host);
}
