import { toThreshold } from './math';

/**
 * Text functions, for coloring and styling terminal output.
 */

export const COLORS = {
	'black': "\u001b[30m",
	'red': "\u001b[31m",
	'green': "\u001b[32m",
	'yellow': "\u001b[33m",
	'blue': "\u001b[34m",
	'magenta': "\u001b[35m",
	'cyan': "\u001b[36m",
	'white': "\u001b[37m",
	'reset': "\u001b[39m",
};
export const GRADIENT_CGYR = {
	'cyan': 1.00,
	'green': 0.90,
	'yellow': 0.60,
	'red': 0.0,
	'black': -Infinity,
}

export const BG_COLORS = {
	'black': "\u001b[40m",
	'red': "\u001b[41m",
	'green': "\u001b[42m",
	'yellow': "\u001b[43m",
	'blue': "\u001b[44m",
	'magenta': "\u001b[45m",
	'cyan': "\u001b[46m",
	'white': "\u001b[47m",
	'reset': "\u001b[49m",
};

/**
 * Colorizes a block of text.
 *
 * Valid colors:
 * black, red, green, yellow,
 * blue, magenta, cyan, white
 *
 * @arg {String} text The text to be colored
 * @arg {String} color The color choice
 */
export function colorize(text, color) {
	return COLORS[color] + text + COLORS.reset;
}

/**
 * Colorizes the background of a block of text.
 *
 * Valid colors:
 * black, red, green, yellow,
 * blue, magenta, cyan, white
 *
 * @arg {String} text The text to be colored
 * @arg {String} color The bg color choice
 */
export function colorizeBG(text, color) {
	return BG_COLORS[color] + text + BG_COLORS.reset;
}

/**
 * Colorizes text according to a percentage gradient.
 *
 * @param {String} text this gets colorized
 * @param {Number} pct a decimal value between 0 and 1 inclusive
 * @param {Object} gradient A color threshold gradient with color names => numbers
 */
export function colorizeGradient(text, pct, gradient=GRADIENT_CGYR) {
	return colorize(text, toThreshold(pct, gradient));
}

export const STYLES = {
	'bold': "\u001b[1m",
	'faint': "\u001b[2m",
	'italic': "\u001b[3m",
	'underline': "\u001b[4m",
	'no_bold': "\u001b[22m",
	'no_italic': "\u001b[23m",
	'no_underline': "\u001b[24m",
	'reset': "\u001b[0m",
}
export const bold = (text) => STYLES.bold + text + STYLES.no_bold;
export const italicize = (text) => STYLES.italic + text + STYLES.no_italic;
export const underline = (text) => STYLES.underline + text + STYLES.no_underline;
export const faint = (text) => STYLES.faint + text + STYLES.no_bold;

/**
 * @param {String} the string to display
 * @param {Number} the alt font digit to use, 1-9
 * @return {String}
 */
export function altFont(text, alt) {
	return `\u001b1${alt}m${text}\u001b10m`;
}


/** @param {NS} ns */
export async function main(ns) {
	for (let color of Object.keys(COLORS))
		ns.print(colorize(color, color));
	ns.print(bold('bold'));
	ns.print(italicize('italicize'));
	ns.print(underline('underline'));
	ns.tail();
}


// @deprecated use lib/textui instead
export const tabulate = () => 'tabulate() has been moved to lib/textui';
