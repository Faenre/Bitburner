/** 
 * Given a list of hostnames, cycle through all of them
 * and launch 'hello.js' if the server's minimum level is
 * less than the player's level.
 * 
 * Then, wait 30 seconds and try again.
 */

/** @param {NS} ns */
export async function main(ns) {
	ns.rm('bots.txt');
	const rootedServers = {};

  do {
  	const hosts = ns.read('hosts.txt').trim().split('\n');
    let currentSkill = ns.getPlayer().skills.hacking;

    for (let host of hosts) {
			if (rootedServers[host]) continue;
			const server = ns.getServer(host);
			if (currentSkill >= server.requiredHackingSkill){
				rootedServers[host] = enableRootAccessOnServer(ns, host)
				await ns.sleep(0.5e3);
			}
    }
  } while (await ns.sleep(30e3));
}

function enableRootAccessOnServer(ns, host) {
	const portOpeners = {
		'BruteSSH.exe': ns.brutessh,
		'FTPCrack.exe': ns.ftpcrack,
		'HTTPWorm.exe': ns.httpworm,
		'relaySMTP.exe': ns.relaysmtp,
		'SQLInject.exe': ns.sqlinject,
	};
  const executables = ns.ls('home', '.exe');

  let ports = 0;
  for (let exe of executables) {
		const openPort = portOpeners[exe];
		if (!openPort) continue;
		openPort(host);
		ports += 1;
  }

  if (ports < ns.getServerNumPortsRequired(host)) {
		ns.print(`WARNING Not enough hacking scripts available for ${host}`);
    return false;
	}

  ns.nuke(host);
	ns.print(`SUCCESS Root acquired on ${host}`);
  ns.toast(`Root acquired on ${host}`, 'success');
	ns.write('bots.txt', `${host}\n`, 'a');
  ns.run('initialize.js', 1, host);
	return true;
}
