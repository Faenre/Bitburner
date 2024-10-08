const TYPE = 'Algorithmic Stock Trader I';

/* The problem:

Algorithmic Stock Trader I
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.


You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

4,51,167,179,133,88,34,183,144,154,4,171,16,42

Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it

*/

/**
 * Basic approach: anchor-runner
 * 
 * For each i, send a runner through i++ to find the greatest difference.
 */

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
	// const host = ns.args[0];
	// const file = ns.args[1];

	// const prices = ns.codingcontract.getData(file, host);
	// const answer = solve(prices);
	// ns.codingcontract.attempt(answer, file, host);
	const sample1 = [4, 51, 167, 179, 133, 88, 34, 183, 144, 154, 4, 171, 16, 42];
	ns.tail();
	ns.print(solve(sample1) === 179); // 179
	const sample2 = [191, 16, 154];
	ns.print(solve(sample2) === 138);
}

/**
 * @param {Array<Number>} inputData the info given for the coding contract
 */
export default function solve(inputData) {
	let highest = 0;
	for (let i = 0; i < inputData.length - 1; i++) {
		for (let j = i + 1; j < inputData.length; j++) {
			let difference = inputData[j] - inputData[i];
			highest = Math.max(highest, difference);
		}
	}
	return highest;
}
