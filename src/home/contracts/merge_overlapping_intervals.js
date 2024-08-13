/*
Merge Overlapping Intervals

Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.

[[8,16],[23,32],[23,24],[13,20],[18,24],[1,6],[21,24],[22,30],[15,17],[22,29],[16,20],[16,18],[9,18],[9,11],[24,27]]

Example:

[[1, 3], [8, 10], [2, 6], [10, 16]]

would merge into [[1, 6], [8, 16]].

The intervals must be returned in ASCENDING order. 
You can assume that in an interval, the first number will always be smaller than the second.

*/

/** @param {NS} ns */
export async function main(ns) {
	const exampleInput = [[1, 3], [8, 10], [2, 6], [10, 16]];
	const output = solve(exampleInput);
	ns.tail();
	ns.print(JSON.stringify(output) === JSON.stringify([[1, 6], [8, 16]]));

	const actualInput = [
		[8, 16], [23, 32], [23, 24], [13, 20],
		[18, 24], [1, 6], [21, 24], [22, 30],
		[15, 17], [22, 29], [16, 20], [16, 18],
		[9, 18], [9, 11], [24, 27]
	];
	ns.print(JSON.stringify(solve(actualInput)) === JSON.stringify([[1, 6], [8, 32]]));
}

/**
 * Approach:
 * Determine a pattern of overlapping, save this to a function
 * Determine a pattern for merging, save this to a function
 * 
 * Low-effort, simple approach: 
 * 	- sort the nodes by the lower number,
 * 	- for each i, consider merging with i-1
 * O(NlogN) time complexity, O(N) space complexity
 */
/**
 * @param {Array<Array<Number, Number>>} inputData the input scenario
 */
export default function solve(inputData) {
	const overlaps = (a, b) => (a || b)[1] >= b[0];
	const merge = (a, b) => a[1] = Math.max(a[1], b[1]);

	const sortedArray = inputData.map(a => a).sort((a, b) => a[0] - b[0]);

	const mergedArrays = [sortedArray[0]];
	for (const arr of sortedArray) {
		if (overlaps(mergedArrays.at(-1), arr))
			merge(mergedArrays.at(-1), arr)
		else
			mergedArrays.push(arr)
	}
	return mergedArrays;

	// const overlap = (acc, b) => acc && (acc.at(-1)[1] >= b[0]);
	// const merge = (acc, b) => acc ? (acc.at(-1)[1] = b[1]) && acc : [b];
	// return inputData
	// 	.map(a=>a)
	// 	.sort((a, b) => a[0] - b[0])
	// 	.reduce(
	// 		(acc, b) => overlap(acc, b) ? merge(acc, b) : acc.concat([b]), 
	// 		[]
	// 	);
}