/*
You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

7,41,123,117,93,77,35,157,31,195,10,32,143,88,172,199,161,89,70,10,49,147,148,138,40,61,104,124,79,145,172,147,106,13,101,12,32,104,135,194

Determine the maximum possible profit you can earn using at most two transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.

If no profit can be made, then the answer should be 0.
*/

export async function main(ns) {
  // const host = ns.args[0];
  // const filename = ns.args[1];

  // // Don't submit anything if the type is wrong:
  // if (ns.codingcontract.getContractType(filename, host) !== TYPE) return;

  // const data = ns.codingcontract.getData(filename, host);
  // const answer = solve(data);

  // const result = ns.codingcontract.attempt(answer, filename, host);
  // if (result)
  //   ns.toast(result, 'success', 5000);
  // else
  //   ns.toast('Solution failed! Double check and try again.', 'error', null);
  // return

	const given = [7,41,123,117,93,77,35,157,31,195,10,32,143,88,172,199,161,89,70,10,49,147,148,138,40,61,104,124,79,145,172,147,106,13,101,12,32,104,135,194];
	ns.tail();
	ns.print(solve(given));
}

/*
  Basic approach:
  - Initialize 2 arrays for local minima and maxima
  - Iterating across the data set, find the minima and maxima
  - Given each maxima-minima,

  - Iterate from left to right,
  - Keep track of each maximum,
  - At each maximum, subtract from max and add (call the solve with the counter decremented)
*/


/**
 * @param {Array<Number>} inputData the info given for the coding contract
 * @param {Number} startAt an internal counter; leave default
 * @param {Number} counter an internal counter; leave default
 */
export default function solve(inputData, startAt=0, counter=2) {
  if (counter === 0) return 0;
  if (startAt >= inputData.length) return 0;

  let maximum = inputData[startAt];
  let minimum = inputData[startAt];
  let highestProfit = 0;

  for (let i=startAt; i < inputData.length; i++) {
  // for (const (value, index) of inputData.slice(startAt)) {
    const value = inputData[i];
    if (value < minimum) {
      // new buying point found, ignore all prevous maximums
      maximum = value;
      minimum = value;
    } else if (value > maximum) {
      // new selling point found,compare against future
      maximum = value;
      highestProfit = Math.max(highestProfit, (maximum - minimum) + solve(inputData, i+1, counter-1));
    }
  }
  return highestProfit;
}
