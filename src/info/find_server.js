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
  const path = searchForServer(ns, searchFor, startingFrom).reverse();

  // print in order
  const decoratedNames = pathWithDecorations(ns, path);
  ns.tprint(decoratedNames.join(' > '));

  // print the connect-string
  const hasBackdoor = (hostname) => (hostname == 'home') || ns.getServer(hostname).backdoorInstalled;
  const pathFromLastBackdoor = path.slice(path.findLastIndex(hasBackdoor));
  ns.tprint('\nconnect ' + pathFromLastBackdoor.join('; connect '));
}

function searchForServer(ns, target, current) {
  // Return if target is found (i.e. target = current)
  if (target === current) return [current];

  // Get all nodes connected to current node, minus where we came from.
  // The slice(1) means we skip index=0, which is the homeward-facing node.
  const neighbors = ns.scan(current).slice(1);

  // Recursively search until we find the first match, if it exists.
  const recurse = (c) => c.reduce((a, n) => a || searchForServer(ns, target, n), false)
  const searchResult = recurse(neighbors);
  if (searchResult) return searchResult.concat([current]);
  return false;
}

// Custom color coding
const CYAN = "\u001b[36m";
const GREEN = "\u001b[32m";
const RED = "\u001b[31m";
const RESET = "\u001b[0m";
// ns.print(`${red}Ugh! What a mess.${reset}`);
// ns.print(`${green}Well done!${reset}`);
// ns.print(`${cyan}ERROR Should this be in red?${reset}`);
// ns.tail();

function pathWithDecorations(ns, path) {
  const decorate = (name) => `[${colorServerName(ns.getServer(name))} ${connectionsStr(ns.scan(name).length)}]`;
  return path.map(decorate);
}

function colorServerName(server) {
  const color = chooseColor(server);
  return `${color}${server.hostname}${RESET}`;
}

function chooseColor(server) {
  if (server.backdoorInstalled) return GREEN;
  if (server.hasAdminRights) return CYAN;
  return RED;
}

function connectionsStr(count) {
  return (':'.repeat(count / 2)) + (count % 2 ? '.' : '');
}

// ---- UNUSED ----

function _getAllServers(ns, host = 'home') {
  return ns.scan(host)
    .slice(host === 'home' ? 0 : 1)
    .reduce((acc, conn) => acc.concat(getAllServers(ns, conn)), [host]);
}
