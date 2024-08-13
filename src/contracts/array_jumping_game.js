/*
Array Jumping Game

You are given the following array of integers:

7,0,5,2,0,1,0,3,7,4,4,7,6,2,2,9,0,1,10,5,4,0

Each element in the array represents your MAXIMUM jump length at that position. 
This means that if you are at position i and your maximum jump length is n, you 
can jump to any position from i to i+n.

Assuming you are initially positioned at the start of the array, determine 
whether you are able to reach the last index.

Your answer should be submitted as 1 or 0, representing true and false respectively.
*/

/** @param {NS} ns */
export async function main(ns) {
	const sample1 = [3,0,0,2,0,5,0];
	const answer1 = 1;
	const sample2 = [0, 1];
	const answer2 = 0;
	ns.print(solve(sample1) === answer1);
	ns.print(solve(sample2) === answer2);
	ns.tail();
}

/**
 * Approach:
 * - Starting from i=0, scan as long as n is positive
 * - If the number at index i is greater than n, set n to that number
 * - return 1 if it reaches the end, or 0 otherwise
 */

/**
 * @arg {Array<Number>} inputData
 */
export default function solve(inputData) {
	return inputData
		.reduce((a, b) => a && Math.max(a, b)) ? 1 : 0;
}

// export default function solve2(inputData) {
// 	let n = 0;
// 	for (let i=0; i < inputData.length; i++) {
// 		if (inputData[i] > n) n = inputData[i];
// 		if (n === 0) return 0;
// 		n--;
// 	}
// 	return 1;
// }