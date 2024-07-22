const TYPE = 'Unique Paths in a Grid I';

/*

You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are in a grid with 12 rows and 4 columns, and you are positioned in the top-left corner of that grid. You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an array with the number of rows and columns:

[12, 4]

*/

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  const host = ns.args[0];
  const file = ns.args[1];

  const [x, y] = ns.codingcontract.getData(file, host);
  const answer = solve(1,1,x,y);
  ns.codingcontract.attempt(answer, file, host);
}

/**
 * Basic approach: Recursive function with memoization.
 * 
 * If x,y = xmax and ymax, return 1
 * Else, return (x+1, y) + (x, y+1)
 * 
 * 
 **/

function solve(x1, y1, x2, y2, memory={}) {
  if (memory[[x1, y1]]) return memory[[x1, y1]];
  if (x1 == x2 && y1 == y2) return 1;

  let sum = 0;
  if (x1 < x2) sum += solve(x1+1, y1, x2, y2, memory);
  if (y1 < y2) sum += solve(x1, y1+1, x2, y2, memory);
  memory[[x1,y1]] = sum;

  return sum;
}