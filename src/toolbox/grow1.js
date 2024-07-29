/** 
 * Grows a target, once (per thread)
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} (optional) delay in ms before beginning
 * */
export async function main(ns) {
  const target = ns.args[0];
  const delay = ns.args[1];
  if (delay) await ns.sleep(delay);
  await ns.grow(target);
}