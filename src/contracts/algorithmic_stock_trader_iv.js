/*
Algorithmic Stock Trader IV

You are given the following array with two elements:

[9, [181,166,18,139,27,159,145,93,193,197,41,72,162,156,80,39]]

The first element is an integer k. The second element is an array of 
stock prices (which are numbers) where the i-th element represents 
the stock price on day i.

Determine the maximum possible profit you can earn using at most 
k transactions. A transaction is defined as buying and then selling 
one share of the stock.

Note that you cannot engage in multiple transactions at once. 
In other words, you must sell the stock before you can buy it again.

If no profit can be made, then the answer should be 0.
*/

/** @param {NS} ns */
export async function main(ns) {
	const given = [9, [181,166,18,139,27,159,145,93,193,197,41,72,162,156,80,39]];
	ns.tail();
	ns.print(solve(given) === 478);
}

/*
	This is the exact same problem as III except with a dynamic K instead of k=2.

  Basic approach:
  - Initialize 2 arrays for local minima and maxima
  - Iterating across the data set, find the minima and maxima
  - Given each maxima-minima, 

  - Iterate from left to right,
  - Keep track of each maximum,
  - At each maximum, subtract from max and add (call the solve with the counter decremented)
*/

/**
 * @param {Array<Number,Array<Number>>} inputData
 */
export default function solve(inputData) {
	const k = inputData[0];
	const prices = inputData[1];

	return recurse(prices, 0, k);
}

function recurse(prices, startAt, counter) {
  if (counter === 0 || startAt >= prices.length) return 0;

  let maximum = prices[startAt];
  let minimum = prices[startAt];
  let highestProfit = 0;

  for (let i=startAt+1; i < prices.length; i++) {
    if (prices[i] < minimum) {
      // new buying point found, ignore all prevous maximums
      maximum = prices[i];
      minimum = prices[i];
    } else if (prices[i] > maximum) {
			// new selling point found, calculate sum and scan the future
      maximum = prices[i];
      // if (i+1 < prices.length && prices[i+1] <= maximum) {
        highestProfit = Math.max(highestProfit, (maximum - minimum) + recurse(prices, i+1, counter-1));
      // }
    }
  }
  return highestProfit;
}