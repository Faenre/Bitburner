/*
HammingCodes: Integer to Encoded Binary

You are given the following decimal value:
3

Convert it to a binary representation and encode it as an 'extended Hamming code'.
The number should be converted to a string of '0' and '1' with no leading zeroes.
Parity bits are inserted at positions 0 and 2^N.
Parity bits are used to make the total number of '1' bits in a given set of data even.
The parity bit at position 0 considers all bits including parity bits.
Each parity bit at position 2^N alternately considers N bits then ignores N bits, starting at position 2^N.
The endianness of the parity bits is reversed compared to the endianness of the data bits:
Data bits are encoded most significant bit first and the parity bits encoded least significant bit first.
The parity bit at position 0 is set last.

Examples:
8 in binary is 1000, and encodes to 11110000 (pppdpddd - where p is a parity bit and d is a data bit)
21 in binary is 10101, and encodes to 1001101011 (pppdpdddpd)

For more information on the 'rule' of encoding, refer to Wikipedia (https://wikipedia.org/wiki/Hamming_code) or the 3Blue1Brown videos on Hamming Codes. (https://youtube.com/watch?v=X8jsijhllIA)
*/

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.tprint(solve(8, ns) === '1111000');
	ns.tprint(solve(21, ns) === '1001101011');
}

/**
 * @param {Number} inputData the integer value to encode
 */
export default function solve(inputData, ns) {
	// convert input integer into decimal
	const binary = inputData.toString(2);

	// collate bits
	const bits = [];
	for (let i = 0; i < binary.length; ) {
		if (Math.log2(bits.length) % 1 == 0) 
			bits.push(parityBit(bits.length));
		else {
			bits.push(dataBit(bits.length));
			i++;
		}
	}
	ns.print(bits.map(b => b.value(bits)));
}
const parity = (bits) => String(bits.filter(bit => bit.value() === '1').length % 2);
const parityBit = (index) => {
	const n = Math.log2(index);
	const value = (bits) => parity(bitsWeCareAbout(bits, index+1))
	const bitsWeCareAbout = (bits, i) => (i < bits.length) ? bits.slice(i+1, i+n).concat(bitsWeCareAbout(bits, i + (2*n))): [];

	return { value }
}
const dataBit = (index) => {
	const value = (bits) => bits[index];
	return { value };	
}