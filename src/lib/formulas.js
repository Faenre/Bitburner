/** @param {NS} ns */
export async function main(ns) {

}

/**
 * @param {Number} intelligence
 * @param {Number} weight
 */
export function calculateIntelligenceBonus(intelligence, weight = 1) {
  return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}