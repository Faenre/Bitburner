/** 
 * Copy a script to all pservs and execute it with N number of threads.
 * 
 * @param {NS} ns 
 * @arg {string} script name
 * @arg {number} number of threads to use (0 or false to use maximum)
 * @arg {...} any options to provide each script
 * */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();
  const command = ns.args[0];
  ({
    'doScript': doScript,
    'info': info,
    'killall': killall,
  })[command](ns);
}

function doScript(ns, pool) {
  const script = ns.args[1];
  const threads = ns.args[2];
  const opts = ns.args.slice(3);

  pool.assignThreads(script, threads, opts);
  ns.print(`SUCCESS all threads assigned`);
}

function info(ns, pool) {
  ns.print(`INFO Pool has ${pool.servers.length} servers`);
  ns.print(`INFO Pool has ${pool.totalRamFree()} ram free`);
}

function killall(ns, pool) {
  pool.killAllRunningScripts();
  ns.print(`SUCCESS all tasks terminated.`);
}

class RamPool {
  static fromPServs = (ns) => new RamPool(ns, ns.getPurchasedServers());

  constructor(ns, hostnames) {
    this.ns = ns;
    this.servers = hostnames.map(hostname => new Server(ns, hostname));
  }

  addServers = (newServers) => newServers.forEach(server => this.servers.push(server));
  sortByRamFree = (s1, s2) => s1.ramFree - s2.ramFree;
  totalRamFree = () => this.servers.reduce((a, b) => a + b.ramFree(), 0);
  ramForScript = (script) => this.ns.getScriptRam(script);
  killAllRunningScripts = () => this.servers.forEach(server => server.clearRam());

  assignMaxThreads(script, opts) {
    this.killAllRunningScripts();
    const threads = this.servers.reduce((sum, server) => sum + server.maxThreads(script), 0);
    return this.assignThreads(script, threads, opts)
  }

  assignThreads(script, threads, opts) {
    if (!threads)
      return this.assignMaxThreads(script, opts);
    let threadsRemaining = threads;
    for (let server of this.servers.sort(this.sortByRamFree)) {
      if (!threadsRemaining)
        return true;
      const threadsToUse = Math.min(threadsRemaining, server.maxThreads(script));
      server.runScript(script, threadsToUse, opts);
      threadsRemaining -= threadsToUse;
    }
    return false;
  }
}

class Server {
  constructor(ns, hostname) {
    this.ns = ns;
    this.name = hostname;
  }

  ramFree = () => this.ramMax() - this.ramUsed();
  ramMax = () => this.ns.getServerMaxRam(this.name);
  ramUsed = () => this.ns.getServerUsedRam(this.name);

  runScript(script, threads, opts) {
    this.ns.scp(script, this.name);
    this.ns.exec(script, this.name, threads, ...opts);
  }
  clearRam = () => this.ns.killall(this.name);

  maxThreads = (script) => Math.floor(this.ramFree() / this.ns.getScriptRam(script));
}
