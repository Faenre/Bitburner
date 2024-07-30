/*
Algorithmic Stock Trader II

You are given the following array of stock prices (which are numbers) where 
the i-th element represents the stock price on day i:

51,5,28,131,109,85,95

Determine the maximum possible profit you can earn using as many transactions 
as you'd like. A transaction is defined as buying and then selling one share of 
the stock. Note that you cannot engage in multiple transactions at once. In 
other words, you must sell the stock before you buy it again.

If no profit can be made, then the answer should be 0.

/*

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();
  const sample = [5,4,6,2];
  ns.print(solve(sample) === 5);
  const sample2 = [51,5,28,131,109,85,95];
  ns.print(solve(sample2));
}

/**
 * Basic approach:
 * Iterating through the list,
 * If the current value is higher than the previous, sum the difference and set the current value
 * If it's lower, then update the current lowest
 */

/**
 * @param {Array<Number>} inputData the stock prices
 */
export default function solve(inputData) {
  return inputData.reduce(
    (mem, price) => (price > mem[1]) ? [mem[0] + price - mem[1], price] : [mem[0], price],
    [0, inputData[0]]
  )[0];
}
