/*
Compression II: LZ Decompression

Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. 
In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit 
from 1 to 9, followed by the chunk data, which is either:

1. Exactly L characters, which are to be copied directly into the uncompressed data.
2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: 
each of the L output characters is a copy of the character X places before it in the uncompressed data.

For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new 
chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.

You are given the following LZ-encoded string:
    5T7W8l429Fzy6j1CiN0355z473X2P514v238772bo74
Decode it and output the original string.

Example: decoding '5aaabb450723abb' chunk-by-chunk
    5aaabb           ->  aaabb
    5aaabb45         ->  aaabbaaab
    5aaabb450        ->  aaabbaaab
    5aaabb45072      ->  aaabbaaababababa
    5aaabb450723abb  ->  aaabbaaababababaabb

*/

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.print(solve('5aaabb45072') === 'aaabbaaababababa');
	ns.print(solve('5aaabb450723abb') === 'aaabbaaababababaabb');
}

// Basic approach:
// Two functions that reference each other: a and b
// both take previous chunk and remaining chunk data, then reference each other
export default function solve(data) {
  return a('', data);
}

function a(prev, rem) {
	if (!rem) return prev;
	const length = parseInt(rem[0]);
	const chunk = rem.slice(1, 1+length);
	return b(prev + chunk, rem.slice(1+length));
}

function b(prev, rem) {
	if (!rem) return prev;
	const length = parseInt(rem[0]);
	if (!length) return a(prev, rem.slice(1));
	const backspaces = parseInt(rem[1]);
	let chunk = '';
	for (let i=0; i < length; i++)
		chunk += (prev + chunk).at(-backspaces);
	return a(prev + chunk, rem.slice(2));
}