/*
Shortest Path in a Grid

You are located in the top-left corner of the following grid:

	[[0,0,1,1,1,1,0],
	 [1,0,0,0,1,0,0],
	 [1,0,1,1,0,1,0],
	 [0,0,0,0,1,0,1],
	 [0,0,0,1,1,0,0],
	 [0,0,0,1,0,0,0],
	 [0,0,0,0,1,0,0],
	 [0,1,0,1,0,0,0],
	 [1,0,0,0,0,0,0],
	 [1,0,0,0,1,0,0],
	 [0,1,0,1,0,0,0]]

You are trying to find the shortest path to the bottom-right corner of the grid, but 
there are obstacles on the grid that you cannot move onto. These obstacles are denoted 
by '1', while empty spaces are denoted by 0.

Determine the shortest path from start to finish, if one exists. The answer should be 
given as a string of UDLR characters, indicating the moves along the path

NOTE: If there are multiple equally short paths, any of them is accepted as answer. If 
there is no path, the answer should be an empty string.
NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

Examples:

		[[0,1,0,0,0],
		 [0,0,0,1,0]]

Answer: 'DRRURRD'

		[[0,1],
		 [1,0]]
*/

/** @param {NS} ns */
export async function main(ns) {
	const sampleInput =
		[[0, 1, 0, 0, 0],
		[0, 0, 0, 1, 0]];
	const expectedOutput = 'DRRURRD';
	ns.tail();
	ns.print(solve(sampleInput) === expectedOutput);
}

/**
 * Basic approach: 
 * Using a hash for memoization, with (x,y) => depth,
 * Recursively search and return the minimum depth.
 */

/**
 * @param {Array<Array<Number>>} inputData the 2d input grid supplied by the contract
 */
export default function solve(inputData) {
	return search(0, 0, inputData, 0, {})[0];
}

const BAD_PATH = ['', false];

function search(x, y, grid, depth, mem) {
	if (y < 0 || y >= grid.length) return BAD_PATH;
	if (x < 0 || x >= grid[0].length) return BAD_PATH;
	if (grid[y][x] === 1) return BAD_PATH;
	if (depth > mem[`${x},${y}`]) return BAD_PATH;

	mem[`${x},${y}`] = depth;
	if ((y === grid.length - 1) && (x === grid[0].length - 1))
		return ['', depth];

	const bestPath = [
		['U', ...search(x, y - 1, grid, depth + 1, mem)],
		['D', ...search(x, y + 1, grid, depth + 1, mem)],
		['L', ...search(x - 1, y, grid, depth + 1, mem)],
		['R', ...search(x + 1, y, grid, depth + 1, mem)],
	].filter(d => d[2]).sort((a, b) => a[2] - b[2])[0] || ['','', false];

	return [bestPath[0] + bestPath[1], bestPath[2]];
}