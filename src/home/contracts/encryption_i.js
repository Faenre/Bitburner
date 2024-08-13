const TYPE = 'Encryption I: Caesar Cipher';

/*
Caesar cipher is one of the simplest encryption technique. It is a type of substitution cipher in which each letter in the plaintext is replaced by a letter some fixed number of positions down the alphabet. For example, with a left shift of 3, D would be replaced by A, E would become B, and A would become X (because of rotation).

You are given an array with two elements:
	["ARRAY CACHE LOGIC PRINT PASTE", 1]
The first element is the plaintext, the second element is the left shift value.

Return the ciphertext as uppercase string. Spaces remains the same.
/*

const TYPE = 'Algorithmic Stock Trader I';

/* The problem:

Algorithmic Stock Trader I
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.


You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

4,51,167,179,133,88,34,183,144,154,4,171,16,42

Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it

*/

/**
 * Basic approach: anchor-runner
 * 
 * For each i, send a runner through i++ to find the greatest difference.
 */

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
	const host = ns.args[0];
	const file = ns.args[1];

	const data = ns.codingcontract.getData(file, host);
	const answer = solve(data);
	ns.codingcontract.attempt(answer, file, host);
}

/**
 * @param {String} inputData the info given for the coding contract
 */
export default function solve(inputData) {
	const [phrase, shift] = inputData;

	return phrase.split('').map(char => encrypt(char, shift)).join('');
}

const ASCII_OFFSET = 65; // 'A'.charCodeAt(0);

function encrypt(char, shift) {
	const charCode = char.charCodeAt(0) - ASCII_OFFSET;
	if ((charCode < 0) || (charCode > 26))
		return char;
	const newCharCode = (26 + charCode - shift) % 26 + ASCII_OFFSET;
	return String.fromCharCode(newCharCode);
}

/* Notes, pasted from terminal:
// Convert a character to ASCII
let char = 'A';
let ascii = char.charCodeAt(0);
console.log(ascii);  // Outputs: 65

// Convert ASCII back to character
let asciiValue = 65;
let character = String.fromCharCode(asciiValue);
console.log(character);  // Outputs: A
*/