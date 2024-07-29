const TYPE = 'Encryption II: Vigenère Cipher';

/*
Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square to encrypt and decrypt plaintext with a keyword.

	Vigenère square:
				 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
			 +----------------------------------------------------
		 A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
		 B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
		 C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
		 D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
		 E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
								...
		 Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
		 Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y

For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:
	 Plaintext: DASHBOARD
	 Keyword:   LINUXLINU
So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.

You are given an array with two elements:
	["PRINTDEBUGARRAYLOGINMODEM", "MONITOR"]
The first element is the plaintext, the second element is the keyword.

Return the ciphertext as uppercase string.
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
// Use integer offsets. A = 0, B = 1... 
// Iterating across the plaintext indexes, add the integer offset of the next
// letter in the keyword.

const ASCII_OFFSET = 65; // 'A'

/**
 * @param {Array<String, String} inputData the info given for the coding contract
 */
export default function solve(inputData) {
	const [plaintext, keyword] = inputData;
	const chars = [];
	for (let i = 0; i < plaintext.length; i++) {
		const offset = keyword.charCodeAt(i % keyword.length) - ASCII_OFFSET;
		const charCode = plaintext.charCodeAt(i) - ASCII_OFFSET;
		const newChar = String.fromCharCode((charCode + offset) % 26 + ASCII_OFFSET);
		chars.push(newChar);
	}
	return chars.join('');
}
