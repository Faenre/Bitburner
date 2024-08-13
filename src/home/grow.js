/** 
 * Grows a target.
 * @param {NS} ns 
 * @arg {Boolean} Repeat infinitely? Default is false (ends when target is full)
 * */
export async function main(ns) {
	const target = ns.args[0];
  const alwaysRepeat = ns.args[1] || false;
  let growth;
  
  do {
  	growth = await ns.grow(target);
  } while (alwaysRepeat || (growth == 1.00)) 
}