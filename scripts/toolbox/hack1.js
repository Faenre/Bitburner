/** 
 * Hacks a target, once (per thread)
 * @param {NS} ns 
 * @arg {String} (required) target hostname
 * @arg {Number} (optional) delay in ms before beginning
 * @arg {Number} (optional) Maximum number of retries allowed (default 0)
 * */
export async function main(ns) {
  const target = ns.args[0];
  const delay = ns.args[1];
  const retries = ns.args[2] || 0;

  if (delay) await ns.sleep(delay);

  await doHack(ns, target, retries);
}

async function doHack(ns, target, retries=0) {
  const result = await ns.hack(target);
  if (result)       return;
  if (retries == 0) return;

  ns.print('Retrying...')
  return doHack(ns, retries-1);
}