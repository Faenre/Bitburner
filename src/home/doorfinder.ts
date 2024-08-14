import { getAllHostnames } from './lib/servers';

/**
 * Cycles through all hosts and launches 'initialize.js'
 * if the server's minimum level is less than the
 * player's level.
 *
 * @TODO Handle server initialization via pubsub instead
 *
 * @TODO [BP-44] Remove file i/o on bots.txt
 *
 * @param {NS} ns
 * */
export async function main(ns: NS): Promise<void> {
	ns.rm('bots.txt'); // @TODO [BP-44]
	const rootedServers = new Set();
	const hosts = new Set(getAllHostnames(ns));

  do {
    const currentSkill = ns.getPlayer().skills.hacking;

    for (const host of hosts) {
			if (currentSkill < ns.getServerRequiredHackingLevel(host)) continue;

			const rooted = ns.hasRootAccess(host) || enableRootAccessOnServer(ns, host);
			if (!rooted) continue;

			rootedServers.add(host);
			hosts.delete(host);

			// TODO send a pubsub message instead
			ns.run('initialize.js', 1, host);

			// TODO [BP-44]
			await ns.sleep(0.5e3);
		}
  } while (await ns.sleep(30e3));
}

function enableRootAccessOnServer(ns: NS, host: string): boolean {
	const portOpeners = {
		'BruteSSH.exe': ns.brutessh,
		'FTPCrack.exe': ns.ftpcrack,
		'HTTPWorm.exe': ns.httpworm,
		'relaySMTP.exe': ns.relaysmtp,
		'SQLInject.exe': ns.sqlinject,
	};

	const openPorts = ns
		.ls('home', '.exe')
		.filter(exeName => portOpeners[exeName]?.(host))
		.length;

  if (openPorts < ns.getServerNumPortsRequired(host)) {
		const message = `Not enough port openers available for ${host}`
		ns.print('WARNING ' + message);
		ns.toast(message, 'warning');
    return false;
	}

  ns.nuke(host);
	ns.print(`SUCCESS Root acquired on ${host}`);
  ns.toast(`Root acquired on ${host}`, 'success');
	ns.write('bots.txt', `${host}\n`, 'a'); // @TODO [BP-44]
	return true;
}
