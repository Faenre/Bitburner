/*
Generate IP Addresses

Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:

1795911525

Note that an octet cannot begin with a '0' unless the number itself is exactly '0'. For example, '192.168.010.1' is not a valid IP.

Examples:

25525511135 -> ["255.255.11.135", "255.255.111.35"]
1938718066 -> ["193.87.180.66"]
*/

/** @param {NS} ns */
export async function main(ns) {
	const sample1 = '25525511135';
	const sample2 = '1938718066';
	ns.tail();
	ns.print(JSON.stringify(solve(sample1)) === JSON.stringify(["255.255.11.135", "255.255.111.35"]));
	ns.print(JSON.stringify(solve(sample2)) === JSON.stringify(["193.87.180.66"]));
}

/**
 * 
 * Approach:
 * - looping 3 times, construct strings and compare their validity.
 * 
 * This is a very naive approach, and is ripe for cleanup.
 */

/**
 * @param {String} inputData a string of digits
 * @return {Array<String>}
 */
export default function solve(inputData) {
	const answers = [];

	for (let j = 1; j < inputData.length-2; j++) {
		for (let k = j+1; k < inputData.length-1; k++) {
			for (let l = k+1; l < inputData.length; l++) {
				const slices = [
					[0, j], [j, k], [k, l], [l, inputData.length]
				].map(([start, end]) => inputData.slice(start, end)
				)
				if (slices.some((octet) => (octet[0] === '0') || (parseInt(octet) > 255)))
					continue;
				answers.push(slices.join('.'));
			}
		}
	}

	return answers;
}