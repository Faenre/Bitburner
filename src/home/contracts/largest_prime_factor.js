const TYPE = 'Find Largest Prime Factor';

/*
A prime factor is a factor that is a prime number. 

What is the largest prime factor of 28068376?
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

// Approach:
// Starting from i=2, attempt modulo division until i > the current value (decreasing it with each div)
// On a very large prime, this could be slow, but without a constraint, this works


/**
 * @param {Number} inputData the info given for the coding contract
 */
export default function solve(inputData) {
  let current = inputData;
  let largest_prime = 0;

  for (let i = 2; i <= current; i++) {
    while (current % i === 0) {
      current /= i;
      largest_prime = i;
    }
  }

  return largest_prime;
}