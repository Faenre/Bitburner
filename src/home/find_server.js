import { colorize, colorizeBG } from './lib/textutils';
import { randomBrailleForValue } from './lib/braille';

const BRAILLE_8 = randomBrailleForValue(8);

/**
 * Finds the given server in the network and prints the
 * path to get there, in both colored text and in a
 * connection-string that can be copied and pasted.
 *
 * @param {NS} ns
 * @arg {string} name of a server to search for
 * */
export async function main(ns) {
	const searchFor = ns.args[0];
	const startingFrom = 'home';

	// find the path to get there from home
	const path = searchForServer(ns, startingFrom, searchFor).reverse();

	// print in order
	const decoratedNames = path.map(name => decorateServer(ns, name));
	ns.tprint(decoratedNames.join(' > '));

	// print the connect-string
	const hasBackdoor = (hostname) => (hostname == 'home') || ns.getServer(hostname).backdoorInstalled;
	const pathFromLastBackdoor = path.slice(path.findLastIndex(hasBackdoor));
	const connectString = '\nconnect ' + pathFromLastBackdoor.join('; connect ');
	ns.tprint(colorizeBG(connectString, 'black'));
}

function searchForServer(ns, current, target) {
	if (target === current)
		return [current];

	const results = ns
		.scan(current)
		.slice(current === 'home' ? 0 : 1)	// index=0 is the homeward-facing node
		.reduce(
			(path, neighbor) => (path.length && path) || searchForServer(ns, neighbor, target),
			[]
		)
	// Append the current node to the path
	// Return nothing if target is not found along this path
	return results.length ? results.concat([current]) : [];
}


function decorateServer(ns, name) {
	const server = ns.getServer(name);
	const player = ns.getPlayer();
	const color = chooseColor(server, player);
	const coloredName = colorize(name, color);
	const connections = connectionsStr(ns.scan(name).length);
	const difficulty = colorize(getDifficulty(server), color);
	const rooted = server.hasAdminRights;
	return `[${coloredName} ${connections}${rooted ? '' : ' ' + difficulty }]`;
}

function chooseColor(server, player) {
	if (server.hostname == 'home') return 'green';
	if (server.backdoorInstalled) return 'green';
	if (server.hasAdminRights) return 'cyan';
	if (player.skills.hacking > server.requiredHackingSkill) return 'yellow';
	return 'red';
}

function connectionsStr(count) {
	// return colorize(':'.repeat(count / 2) + (count % 2 ? '.' : ''), 'yellow');
	return colorize(BRAILLE_8.repeat(count/8) + (count % 8 ? randomBrailleForValue(count % 8) : ''), 'yellow');
}

function getDifficulty(server) {
	const skill = server.requiredHackingSkill;
	const ports = server.numOpenPortsRequired;
	return `${skill}.${ports}`;
}
