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
	// ns.tail();
	const command = ns.args[0];
	const pool = RamPool.fromPServs(ns);
	({
		'do': doScript,
		'max': doScriptMax,
		'help': showHelp,
		'info': info,
		'killall': killall,
	})[command](ns, pool);
}

function doScript(ns, pool) {
	const script = ns.args[1];
	const threads = ns.args[2];
	const opts = ns.args.slice(3);
	
	pool.installScript(script);

	const threadsAssigned = pool.assignThreads(script, threads, opts);
	ns.tprint(`SUCCESS assigned ${threadsAssigned} threads`);
}

function doScriptMax(ns, pool) {
	const script = ns.args[1];
	const opts = ns.args.slice(2);

	pool.installScript(script);

	const threadsAssigned = pool.assignMaxThreads(script, opts);
	ns.tprint(`SUCCESS assigned ${threadsAssigned} threads`);
}

function showHelp(ns, _pool) {
	const name = ns.getScriptName();
	ns.tprint(`Usage: run ${name} [command] [...args]`);
	ns.tprint(```
	Available commands:
		- do
		- help
		- info
		- killall
	```);
}

function info(ns, pool) {
	ns.tprint(`INFO Pool has ${pool.servers.length} servers`);
	ns.tprint(`INFO Pool has ${pool.totalRamFree()} ram free`);
}

function killall(ns, pool) {
	pool.killAllRunningScripts();
	ns.tprint(`SUCCESS all tasks terminated.`);
}

export class RamPool {
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
		// const threads = this.servers.reduce((sum, server) => sum + server.maxThreads(script), 0);
		return this.assignThreads(script, this.ramForScript(script), Infinity, opts)
	}

	assignThreads(script, ramPerThread, threads, opts) {
		if (!threads)
			return false; 
		let threadsAssigned = 0;

		const availableServers = this.servers
			.map(server => [server, Math.floor(server.ramFree() / ramPerThread)])
			.filter(server => server[1]);
			
		for (let [server, maxThreads] of availableServers) {
			const threadsToUse = Math.min(threads - threadsAssigned, maxThreads);
			if (!threadsToUse) continue;
			server.runScript(script, threadsToUse, opts);
			threadsAssigned += threadsToUse;
		}
		return threadsAssigned;
	}

	installScript(script, force=false) {
		this.servers.forEach(server => server.installScript(script, force=force));
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

	installScript(script, force=false) {
		if (force || !this.ns.ls(this.name, script).includes(script))
			this.ns.scp(script, this.name);
	}
	runScript(script, threads, opts) {
		this.ns.exec(script, this.name, threads, ...opts);
	}
	clearRam = () => this.ns.killall(this.name);

	maxThreads = (script) => Math.floor(this.ramFree() / this.ns.getScriptRam(script));
}
