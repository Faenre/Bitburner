/*
Unique Paths in a Grid II

You are located in the top-left corner of the following grid:

0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,1,
0,0,0,0,0,1,0,0,
0,0,0,0,0,0,1,0,
0,0,0,1,0,1,0,0,
0,1,0,1,1,0,1,0,

You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
*/

/** @param {NS} ns */
export async function main(ns) {
	const sample = [
		[0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,1],
		[0,0,0,0,0,1,0,0],
		[0,0,0,0,0,0,1,0],
		[0,0,0,1,0,1,0,0],
		[0,1,0,1,1,0,1,0],
	]
	ns.tail();
	ns.print(solve(sample));
}


/**
 * Basic approach: Recursive function with memoization.
 * 
 * If x,y == xmax and ymax, return 1
 * Else, return (x+1, y) + (x, y+1)
 * 
 * 
 **/

/**
 * @param {Array<Number>} inputData the info given for the coding contract
 */
export default function solve(inputData) {
	const [x1, y1] = [0, 0];
	return search(x1, y1, inputData, {});
}

function search(x, y, grid, memory) {
  memory ??= {};
  if (memory[[x,y]]) 
		return memory[[x,y]];
  if (x == grid[0].length-1 && y == grid.length-1) 
		return 1;
	if (x === grid[0].length || y === grid.length)
		return 0;
	if (grid[y][x])
		return 0;

  let sum = 0;
  sum += search(x+1, y, grid, memory);
  sum += search(x, y+1, grid, memory);
  memory[[x,y]] = sum;

  return sum;
}