export {
  getAllHostnames,
  getRootedServers,
  getHackableServers,
}

/**
 * Gets a list of all hostnames in the game, including:
 * - corps,
 * - pservs, and
 * - hacknet servers (if unlocked)
 *
 * @param ns
 * @returns
 */
function getAllHostnames(ns: NS, _host='home'): string[] {
  return ns
    .scan(_host)
    .slice(_host === 'home' ? 0 : 1)
    .reduce(
      (nodes, nextNode) => nodes.concat(getAllHostnames(ns, nextNode)), [_host]
    );
}

/**
 * @param ns
 * @returns a list of servers with root access. Includes home and pservs.
 */
function getRootedServers(ns: NS): string[] {
  return getAllHostnames(ns)
    .filter((host: string) => ns.hasRootAccess(host));
}
/**
 * @param ns
 * @returns a list of servers with root access that have money on them.
 */
function getHackableServers(ns: NS): string[] {
  return getRootedServers(ns)
    .filter((host: string) => ns.getServerMaxMoney(host) > 0);
}
