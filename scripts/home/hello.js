/** 
 * Knock on a door and say hello.
 * 
 * This runs whatever executables you have against hte server,
 * and if it's enough, then it nukes it.
 * 
 * Hot diggity dawk, Lady.
 * 
 * @param {NS} ns 
 * @param {String} target hostname
 * */
export async function main(ns) {
  const host = ns.args[0];
  const executables = ns.ls(ns.getHostname(), '.exe');

  let hacks = 0;
  for (let i=0; i < executables.length; i++) {
    hacks += await doHack(ns, host, executables[i]);
  }

  if (hacks < ns.getServerNumPortsRequired(host)) {
    rs.toast('The door is closed, Lady 62C.');
    return;
  }

  ns.nuke(host);
  ns.toast('The door is open, Lady 62C.');

  if (ns.getServerMaxMoney > 0)
    ns.write('bots.txt', `${host}\n`, 'a');

  ns.run('remote-init.js', 1, host);
}


async function doHack(ns, host, hackName) {
  switch(hackName) {
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