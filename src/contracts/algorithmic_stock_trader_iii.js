const TYPE = 'Algorithmic Stock Trader III';

/*
You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

7,41,123,117,93,77,35,157,31,195,10,32,143,88,172,199,161,89,70,10,49,147,148,138,40,61,104,124,79,145,172,147,106,13,101,12,32,104,135,194

Determine the maximum possible profit you can earn using at most two transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you buy it again.

If no profit can be made, then the answer should be 0.
*/


export async function main(ns) {
  const host = ns.args[0];
  const filename = ns.args[1];

  // Don't submit anything if the type is wrong:
  if (ns.codingcontract.getContractType(filename, host) !== TYPE) return;

  const data = ns.codingcontract.getData(filename, host);
  const answer = solve(data);

  const result = ns.codingcontract.attempt(answer, filename, host);
  if (result) 
    ns.toast(result, 'success', 5000);
  else
    ns.toast('Solution failed! Double check and try again.', 'error', null);
  return
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
function solve(data, startAt=0, counter=2) {
  if (counter === 0 || startAt >= data.length) return 0;
  console.log('starting at i=' + startAt);

  let maximum = data[startAt];
  let minimum = data[startAt];
  let highestProfit = 0;

  for (let i=startAt+1; i < data.length; i++) {
    if (data[i] < minimum) {
      console.log('- minimum found: ' + data[i]);
      // new buying point found, ignore all prevous maximums
      maximum = data[i];
      minimum = data[i];
    } else if (data[i] > maximum) {
      console.log('+ maximum found: ' + data[i]);
      maximum = data[i];
      if (i+1 < data.length && data[i+1] <= maximum) {
        console.log(`${counter==2 ? 'TOP' : 'bot'} ${maximum} - ${minimum} = ${maximum - minimum}`)
        highestProfit = Math.max(highestProfit, (maximum - minimum) + solve(data, i+1, counter-1));
      }
    }
  }
  console.log('Highest profit at counter ' + counter + ' is ' + highestProfit);
  return highestProfit;
}
