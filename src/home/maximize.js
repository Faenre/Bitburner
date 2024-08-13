import { colorizeBG, bold } from './lib/textutils';

/**
 * This will use all available RAM to run the given script.
 * @param {NS} ns
 * @param {String} script name
 * @param {String} target hostname
 * */
export async function main(ns) {
  const script = ns.args[0];
  const target = ns.args[1] ?? null;

  const server = ns.getServer();
  const ramFree = server.maxRam - server.ramUsed;
  const ramNeeded = ns.getScriptRam(script)
  const threads = Math.floor(ramFree / ramNeeded);

  const pid = ns.run(script, threads, target);
  ns.tprint(`INFO Maximized ${script} successful (PID=${colorizeBG(pid, 'black')}, ${bold(threads)} threads)`);
}
