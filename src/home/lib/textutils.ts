import { toThreshold } from './math';

/**
 * Text functions, for coloring and styling terminal output.
 */

type ObjectValues<T> = T[keyof T];
export const Color = {
	black: 'black',
	red: 'red',
	green: 'green',
	yellow: 'yellow',
	blue: 'blue',
	magenta: 'magenta',
	cyan: 'cyan',
	white: 'white',
	default: 'default',
} as const;
export type Color = ObjectValues<typeof Color>

export const Style = {
	bold: 'bold',
	faint: 'faint',
	emphasis: 'emphasis',
	underline: 'underline',
	default: 'default',
}
export type Style = ObjectValues<typeof Style>

/**
 * @TODO define multiple gradients
 */
export const GRADIENT_CGYR = {
	'cyan': 1.00,
	'green': 0.90,
	'yellow': 0.60,
	'red': 0.0,
	'black': -Infinity,
} as const;


const ANSI_TEXT = {
	'black': "\u001b[30m",
	'red': "\u001b[31m",
	'green': "\u001b[32m",
	'yellow': "\u001b[33m",
	'blue': "\u001b[34m",
	'magenta': "\u001b[35m",
	'cyan': "\u001b[36m",
	'white': "\u001b[37m",
	'default': "\u001b[39m",
} as const;
const ANSI_BG = {
	'black': "\u001b[40m",
	'red': "\u001b[41m",
	'green': "\u001b[42m",
	'yellow': "\u001b[43m",
	'blue': "\u001b[44m",
	'magenta': "\u001b[45m",
	'cyan': "\u001b[46m",
	'white': "\u001b[47m",
	'default': "\u001b[49m",
} as const;
const ANSI_STYLE = {
	'bold': "\u001b[1m",
	'faint': "\u001b[2m",
	'emphasis': "\u001b[3m",
	'underline': "\u001b[4m",
	'no_bold': "\u001b[22m",
	'no_emphasis': "\u001b[23m",
	'no_underline': "\u001b[24m",
	'default': "\u001b[0m",
} as const;

/**
 * Colorizes a block of text.
 *
 * Valid colors:
 * black, red, green, yellow,
 * blue, magenta, cyan, white
 *
 * @arg {String} text The text to be colored
 * @arg {Color} color The color choice
 */
// typeof Color[keyof typeof Color]
export function colorize(text: string, color: Color): string {
	return ANSI_TEXT[color] + text + ANSI_TEXT.default;
}

/**
 * Colorizes the background of a block of text.
 *
 * Valid colors:
 * black, red, green, yellow,
 * blue, magenta, cyan, white
 *
 * @arg {String} text The text to be colored
 * @arg {Color} color The bg color choice
 */
export function colorizeBG(text: string, color: Color) {
	return ANSI_BG[color] + text + ANSI_BG.default;
}

/**
 * Colorizes text according to a percentage gradient.
 *
 * @param {String} text this gets colorized
 * @param {Number} pct a decimal value between 0 and 1 inclusive
 * @param {Object} gradient A color threshold gradient with color names => numbers
 */
export function colorizeGradient(text: string, pct: number, gradient: object=GRADIENT_CGYR) {
	return colorize(text, Color[toThreshold(pct, gradient)]);
}

export const bold = (text: string): string => ANSI_STYLE.bold + text + ANSI_STYLE.no_bold;
export const emphasize = (text: string): string => ANSI_STYLE.emphasis + text + ANSI_STYLE.no_emphasis;
export const underline = (text: string): string => ANSI_STYLE.underline + text + ANSI_STYLE.no_underline;
export const faint = (text: string): string => ANSI_STYLE.faint + text + ANSI_STYLE.no_bold;

/**
 *
 * @param text
 * @param style
 * @returns
 */
export function stylize(text: string, style: Style): string {
	return ANSI_STYLE[style] + text + ANSI_STYLE.default;
}

/**
 * @param {String} text the string to display
 * @param {Number} alt the alt font digit to use, 1-9
 * @return {String}
 */
export function altFont(text: string, alt: number): string {
	return `\u001b1${alt}m${text}\u001b10m`;
}


/** @param {NS} ns */
export async function main(ns: NS) {
	for (const name of Object.keys(Color))
		ns.print(colorize(name, name as Color));
	ns.print(bold('bold'));
	ns.print(emphasize('italicize'));
	ns.print(underline('underline'));
	ns.tail();
}


// @deprecated use lib/textui instead
export const tabulate = () => 'tabulate() has been moved to lib/textui';
