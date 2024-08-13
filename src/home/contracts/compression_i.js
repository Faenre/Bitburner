const TYPE = 'Compression I: RLE Compression'

/*
Run-length encoding (RLE) is a data compression technique which encodes data as a series of runs of a repeated single character. Runs are encoded as a length, followed by the character itself. Lengths are encoded as a single ASCII digit; runs of 10 characters or more are encoded by splitting them into multiple runs.

You are given the following input string:
    000000000BB7777lccUHbbTTTTGNS66WWWWWWPWccZhddddRRRRR22oVVVVVVVVVVVVVV66EEEEL
Encode it using run-length encoding with the minimum possible output length.

Examples:
    aaaaabccc            ->  5a1b3c
    aAaAaA               ->  1a1A1a1A1a1A
    111112333            ->  511233
    zzzzzzzzzzzzzzzzzzz  ->  9z9z1z  (or 9z8z2z, etc.)


If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
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

// Basic approach:
// 1. prepare an array to collect results,
// 2. at a given index, start a counter and move forward
// 3. using state detection, tally a value
// 3a. end a sequence at count = 9
// 4. join the results together

/**
 * @param {String} inputData the info given for the coding contract
 */
export default function solve(inputData) {
  const results = [];

  let currentChar = inputData[0];
  let streak = 0;

  for (let newChar of inputData) {
    if (newChar != currentChar) {         // Reset a streak to 0 if the sequence is broken
      results.push(streak + currentChar); // (the streak increments later)
      currentChar = newChar;
      streak = 0;
    } else if (streak == 9) {             // If incrementing would increase the streak to 10,
      results.push(9 + currentChar);      // push the 9 now before incrementing
      streak -= 9
    }
    streak += 1;  
  }
  results.push(streak + currentChar);     // Push the final streak

  return results.join('');
}