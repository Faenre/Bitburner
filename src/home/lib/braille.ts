import { clamp } from './math';

const BRAILLE_START = '0x28';

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.disableLog('sleep');
	ns.clearLog();
	// const sampleBits = [true, false, false, true, false, true, false, true].reverse();
	do {
		ns.clearLog();
		const chars = [];
		for (let i=1; i < 8; i++)
			chars.push(randomBrailleForValue(i));
		ns.print(chars.join(''));
	} while (await ns.sleep(1e3));

	const exampleSleeves = [
		true, true,
		false, true,
		false, false,
		true, true,
	];
	const exampleSleeveHex = numberToHex(bitsToDecimal(repositionBitsLTR(exampleSleeves)));
	ns.print(brailleCharacter(exampleSleeveHex));
}

function repositionBitsLTR(bits) {
	// assuming 0 in the topleft place,
	// we need to swap bit locations in LTR order.
	// given: 	03142567
	// return:	01234567
	return [
		bits[0],
		bits[2],
		bits[4],
		bits[1],
		bits[3],
		bits[5],
		bits[6],
		bits[7],
	].reverse()
}

export function brailleForPercent(pct: number, random=false) {
	return brailleForValue(Math.round(pct * 8), random);
}

export function brailleForValue(value: number, random=false) {
	// fill the array with true values equal to the given number
	const bits = Array(8).fill(false);
	for (let i=0; i < clamp(0, value, 8); i++) bits[i] = true;

	if (random) shuffle(bits);

	// return braille character
	return brailleCharacter(numberToHex(bitsToDecimal(repositionBitsLTR(bits))));
}

export function randomBrailleForValue(value: number) {
	// fill the array with true values equal to the given number
	const bits = Array(8).fill(false);
	for (let i=0; i < clamp(0, value, 8); i++) bits[i] = true;

	// durstenfeld shuffle the bits around
	for (let i=7; i; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[bits[i], bits[j]] = [bits[j], bits[i]];
	}

	// return braille character
	return brailleCharacter(numberToHex(bitsToDecimal(bits)));
}

function shuffle(bits: Array<boolean>): void {
	// durstenfeld shuffle the bits around
	for (let i=7; i; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[bits[i], bits[j]] = [bits[j], bits[i]];
	}
}

// input: [false, false, true, ...]
function bitsToDecimal(bits: Array<boolean>): number {
	return parseInt(
		bits.map(b => Number(b)).join(''),
		2
	)
}

function numberToHex(number: number): string {
	return number.toString(16).padStart(2, '0');
}

/**
 * @param {String} hex A 2-decimal hex code in the range [00-FF]
 * @return {String} a single braille character
 */
function brailleCharacter(hex: string): string {
	return String.fromCharCode(parseInt(BRAILLE_START + hex));
}
