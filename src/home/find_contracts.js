import { tabulate } from './lib/textutils';
import { SOLVERS } from './contracts/solutions';

/** @param {NS} ns */
export async function main(ns) {
  const hosts = ns.read('hosts.txt').trim().split("\n");

	const knownContracts = [];
  for (let host of hosts) {
    let contracts = ns.ls(host, 'cct');
    // if (files.length == 0)
		for (let filename of contracts) {
			const contractType = ns.codingcontract.getContractType(filename, host);
			knownContracts.push([host, filename, contractType])
			ns.print(`${contractType in SOLVERS ? 'INFO' : 'WARNING'} [${contractType}] contract on ${host}`);
		}
  }
	ns.print(tabulate(knownContracts));
	ns.tail();
}
