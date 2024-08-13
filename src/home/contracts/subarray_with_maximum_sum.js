/*
Subarray with Maximum Sum

Given the following integer array, find the contiguous subarray (containing 
at least one number) which has the largest sum and return that sum. 
'Sum' refers to the sum of all the numbers in the subarray.

2,-1,-3,8,7,6,-9,-3,-7,-4,-1,-10,-10,8,-6,-4,-3,-3,7,9,-5,7

*/

/** @param {NS} ns */
export async function main(ns) {
	const sample = [2,-1,-3,8,7,6,-9,-3,-7,-4,-1,-10,-10,8,-6,-4,-3,-3,7,9,-5,7];
	ns.tail();
	ns.print(solve(sample));
}

/**
 * Approach:
 * Anchor+Runner
 * Starting with an anchor at 0,
 * maxSum of inputData[0],
 * currentSum of inputData[0],
 * 
 * Iterate through the array:
 * if (currentSum + new number) > maxSum,
 * 	update maxSum
 */
/**
 * 
 * @TODO NOT FINISHED
 * 
 * @param {Array<Number>} the array of numbers
 * @return {Number} the solution
 */
export default function solve(inputData) {
	let anchor = 0;
	let	currentSum = inputData[0];
	let maxSum = currentSum;
	for (let i=1; i < inputData.length; i++) {
		if (inputData[i] < 0){
			currentSum -= (inputData[anchor++]);
		}
		currentSum += inputData[i];
		maxSum = Math.max(currentSum, maxSum);
	}
	return maxSum;
}