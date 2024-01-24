/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  const server = ns.getServer();

  ns.write('/local/hostname.txt',      server.hostname,          'w');
  ns.write('/local/organization.txt',  server.organizationName,  'w');
  ns.write('/local/cpu_cores.txt',     server.cpuCores,          'w');
  ns.write('/local/money_max.txt',     server.moneyMax,          'w');
  ns.write('/local/security_min.txt',  server.minDifficulty,     'w');
  ns.write('/local/total_ram.txt',     server.maxRam,            'w');
}