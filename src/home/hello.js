/**
 * Knock on a door and say hello.
 *
 * This runs whatever executables you have against the server,
 * and if it's enough, then it nukes it.
 *
 * @param {NS} ns
 * @param {String} target hostname
 * */
export async function main(ns) {
  const host = ns.args[0];
  const executables = ns.ls(ns.getHostname(), '.exe');

  let hacks = 0;
  for (let i = 0; i < executables.length; i++)
    hacks += await doHack(ns, host, executables[i]);

  if (hacks < ns.getServerNumPortsRequired(host))
    return;

  ns.nuke(host);
  ns.toast(`Root acquired on ${host}`);

  ns.run('initialize.js', 1, host);
}


async function doHack(ns, host, hackName) {
  switch (hackName) {
    case 'BruteSSH.exe':
      await ns.brutessh(host);
      return 1;
    case 'FTPCrack.exe':
      await ns.ftpcrack(host);
      return 1;
    case 'HTTPWorm.exe':
      await ns.httpworm(host);
      return 1;
    case 'relaySMTP.exe':
      await ns.relaysmtp(host);
      return 1;
    case 'SQLInject.exe':
      await ns.sqlinject(host);
      return 1;
    default:
      return 0;
  }
}
