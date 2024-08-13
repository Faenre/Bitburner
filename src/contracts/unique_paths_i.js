/*
Unique Paths in a Grid I

You are in a grid with 12 rows and 4 columns, and you are positioned in the top-left 
corner of that grid. You are trying to reach the bottom-right corner of the grid, but 
you can only move down or right on each step. 
Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an array with the number of rows and columns:

[12, 4]

*/

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  // const host = ns.args[0];
  // const file = ns.args[1];

  // const [x, y] = ns.codingcontract.getData(file, host);
  // const answer = solve(1,1,x,y);

  // ns.toast(ns.codingcontract.attempt(answer, file, host),'info', null);
	ns.tail();
	const sampleData = [12, 4];
	ns.print(solve(sampleData));
}


/**
 * @param {Array<Number>} inputData the info given for the coding contract
 */
export default function solve(inputData) {
	const [x1, y1] = [1, 1];
	const [x2, y2] = inputData;
	return search(x1, y1, x2, y2, {});
}

function search(x1, y1, x2, y2, memory) {
  if (memory == null) memory = {};
  if (memory[[x1,y1]]) return memory[[x1,y1]];
  if (x1 == x2 && y1 == y2) return 1;

  let sum = 0;
  if (x1 < x2) sum += search(x1+1, y1, x2, y2, memory);
  if (y1 < y2) sum += search(x1, y1+1, x2, y2, memory);
  memory[[x1,y1]] = sum;

  return sum;
}

/**
 * Basic approach: Recursive function with memoization.
 * 
 * If x,y = xmax and ymax, return 1
 * Else, return (x+1, y) + (x, y+1)
 * 
 * 
 **/