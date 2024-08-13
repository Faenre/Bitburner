/**
 * Clamps an input number between a minimum and maximum.
 * Order of inputs is irrelevant, but one should be the
 * minimum and one should be the maximum.
 * 
 * @param {Number} n1
 * @param {Number} n2
 * @param {Number} n3
 * @return {Number} The clamped number.
 */
export const clamp = (n1, n2, n3) => [n1, n2, n3].sort((a, b) => a - b)[1];

/**
 * Clamps an input pct between 0 and 1.
 * 
 * @param {Number} a percent
 * @return {Number} a percent between 0 and 1 inclusive
 */
export const clampPct = (pct) => clamp(0, pct, 1);

/**
 * Given a number and an object of thresholds shaped as 'string': number,
 * returns the first string for which the given number
 * meets or beats the given threshold number.
 * 
 * @example
 * toThreshold(7, {'red': 0, 'yellow': 5, 'green': 10}) => 'yellow'
 * 
 * @param {Number} number to compare against
 * @param {Object <String, Number>} thresholds of String:Number pairings
 * @return {String}
 */
export const toThreshold = (number, thresholds) => (
	Object
		.entries(thresholds)
		.slice()
		.sort((a, b) => b[1] - a[1])
		.find(([_name, value]) => number >= value)
		.at(0)
);

/**
 * Find the mean average of a group of numbers.
 * 
 * @param {Array<Number>} values an array with the numbers to average.
 */
export const avg = (values) => sum(values) / (values.length || 1);

/**
 * Find the sum of a group of numbers.
 * 
 * @param {Array<Number>} values an array with the numbers to sum.
 */
export const sum = (values) => values.reduce((a, b) => a + b);
