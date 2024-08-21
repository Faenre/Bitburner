/**
 * Clamps an input number between a minimum and maximum.
 *
 * If all 3 values are provided, order becomes irrelevant.
 *
 * @param {number} n1 typically, the number to clamp
 * @param {number} [n2=0] default 0
 * @param {number} [n3=Number.MAX_SAFE_INTEGER] default MAX_SAFE_INTEGER
 * @return {Number} The clamped number.
 */
export function clamp(n1: number, n2: number=0, n3: number=Number.MAX_SAFE_INTEGER): number {
	return ([n1, n2, n3]
		.sort((a, b) => a - b)
	)[1];
}

/**
 * Clamps an input percent between 0 and 1.
 *
 * @param {Number} percent A decimal percentage, e.g. 0.75
 * @return {Number} a percent between 0 and 1 inclusive
 */
export function clampPct(percent: number): number {
	return clamp(0, percent, 1);
}

/**
 * Given a number and an object of thresholds shaped as 'string': number,
 * returns the first string for which the given number
 * meets or beats the given threshold number.
 *
 * @example
 * toThreshold(7, {'red': 0, 'yellow': 5, 'green': 10}) => 'yellow'
 *
 * @param {number} number to compare against
 * @param {Object <string, number>} thresholds object with String:Number pairings
 * @return {string}
 */
export function toThreshold(number: number, thresholds: object): string {
	return Object
		.entries(thresholds)
		.slice()
		.sort((a, b) => b[1] - a[1])
		.find(([_name, value]) => number >= value)
		.at(0)
};

/**
 * Find the mean average of a group of numbers.
 *
 * @param {Array<Number>} values an array with the numbers to average.
 */
export function avg(values: number[]): number {
	return sum(values) / (values.length || 1);
}

/**
 * Find the sum of a group of numbers.
 *
 * @param {Array<Number>} values an array with the numbers to sum.
 */
export function sum(values: number[]): number {
	return values.reduce((a, b) => a + b);
}

export const average = (nums: number[]): number =>
	div(
		nums.reduce(add),
		nums.length
	);
export const div = (a: number, b: number): number => a / b;
export const add = (a: number, b: number): number => a + b;

export const max = (a: number, b: number): number => a > b ? a : b;
export const min = (a: number, b: number): number => a < b ? a : b;
