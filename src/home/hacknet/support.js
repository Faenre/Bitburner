/** @param {NS} ns */
export async function main(ns) {
	const [script, ...args] = ns.args;
	const network = new Network(ns);
	network.perform(script, ...args);
}

class Network {
	constructor(ns) {
		this.ns = ns;
		this.servers = Server.getServers(ns);
	}

	perform(script, ...args) {
		let threads=0;
		for (let server of this.servers) {
			threads += server.runScript(script, ...args);
		}
		this.ns.print(`SUCCESS ${script} running on ${threads} threads!`);
		if (threads)
			this.ns.toast(`${script} running on ${threads} threads!`, 'success', 5e3);
	}
}

class Server {
	static getServers(ns) {
		const servers = [];
		for (let i=0; i < ns.hacknet.numNodes(); i++) 
			servers.push(new Server(ns, i));
		return servers;
	}
	
	constructor(ns, index) {
		this.ns = ns;
		this.index = index;
		this.hostname = `hacknet-server-${index}`;
		this.stats = this.ns.hacknet.getNodeStats(this.index);
	}

	runScript(script, ...args) {
		this.ns.scp(script, this.hostname);

		const ramNeeded = this.ns.getScriptRam(script, this.hostname);
		const ramAvailable = this.stats.ram - (this.stats.ramUsed || 0);
		const threads = Math.floor(ramAvailable / ramNeeded);
		
		if (threads)
			this.ns.exec(script, this.hostname, threads, ...args);
		return threads;
	}
}