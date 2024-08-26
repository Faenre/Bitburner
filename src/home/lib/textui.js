import { clamp, clampPct } from './math';

export const SPINNER_FRAMES = '|/—\\';
const _DOTTED_GRADIENT = '░▒▓'
const _BOX_DRAW = {
	'single': '│└┬┤┌┼┐├┴─┘',
	'double': '╝╗╔╚╣╩╦╠═║╬',
}
/**
 * Returns a spinner function.
 * Each call of that function returns the next frame.
 *
 * @return {function} A spinner function that rotates
 * 	around |, /, —, \\
 */
export const newSpinner = () => {
	let counter = 0;
	return () => SPINNER_FRAMES[(counter++) % 4];
}

// @TODO: fix the partial segment
const PROGRESS_8_BARS = ' ▏▎▍▌▋▊▉█';
export const solidProgressBar = (width) => {
	const fullSegments = (pct) => '█'.repeat(pct * width);
	const partialSegment = (pct) => (pct * width % 1 > 0) ? PROGRESS_8_BARS[Math.round(pct * width % 1 * 8)] : '';

	// const spaces = (pct) => ' '.repeat(Math.max(0, width - Math.ceil(pct * width)));
	return (p) => `${fullSegments(clampPct(p)) + partialSegment(clampPct(p))}`.padEnd(width);
}
/**
 * Single-call wrapper for solidProgressBar.
 *
 * @param {Number} pct the percentage to gauge
 * @param {Number} width the number of characters to use
 * @return {String} a progress bar.
 */
export const SolidProgressBar = (pct, width, full='=', empty=' ') =>
	solidProgressBar(width, full, empty)(pct);

export const segmentBar = (width, full='=', empty=' ') => {
	const fullSegments = (pct) => full.repeat(clamp(0, width, Math.floor(pct * width)));
	const marker = (pct) => (pct >= 1.00) ? '' : '>';
	const emptySegments = (pct) => empty.repeat(clamp(0, width, width - Math.floor(pct * width) - 1));

	return (p) => `[${fullSegments(p)}${marker(p)}${emptySegments(p)}]`
}

export class TerminalUI {
	TAIL_SIZE = 51;

	constructor(ns) {
		this.ns = ns;
		this.lines = [];
	}

	add(line, print=true) {
		this.lines.unshift(line);
		if (this.lines.length > TerminalUI.TAIL_SIZE)
			this.lines.pop();
		if (print) this.ns.print(line);
	}

	render() {
		this.ns.clearLog();
		for (let line of this.lines.map(l=>l).reverse())
			this.ns.print(line);
	}

	/**
	 * Replace an entire line
	 * (useful for progress bars and spinners)
	 */
	replace(line, i=0, print=true) {
		this.lines[i] = line;
		if (print) this.render();
	}
}

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
