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
export const colorize = (text, color) => COLORS[color] + text + COLORS.reset;

export const STYLES = {
	'bold': "\u001b[1m",
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

/**
 * Given an array of arrays of string data, pad each column into a spreadsheet grid.
 * 
 * @param {Array<string>} table 2d data structure, 
 * 		with each row having the same type of data.
 * @param {string} colSeparator Column Separator
 * @param {string} colSeparator Row Separator
 * 
 * @return {string} the tabulated, table-ized content, newline-separated
 * 
 * @TODO: add support for header row
 * @TODO: add support for styled text
 */
export const tabulate = (table, colSeparator = ' | ', rowSeparator = '\n') =>
	(widths =>
		table.map(
			row => row.map(
				(text, i) => text.padEnd(widths[i])
			).join(colSeparator)
		).join(rowSeparator)
	)(columnMaxWidths(table));

const columnMaxWidths = (table) =>
	table[0].map(
		(_, col) => Math.max(...table.map(row => String(row[col]).length))
	);

/** @param {NS} ns */
export async function main(ns) {
	for (let color of Object.keys(COLORS))
		ns.print(colorize(color, color));
	ns.print(bold('bold'));
	ns.print(italicize('italicize'));
	ns.print(underline('underline'));
	ns.tail();
}