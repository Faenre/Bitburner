/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  server = ns.getServer();

  ns.write('hostname.txt',      server.hostname,          'w');
  ns.write('organization.txt',  server.organizationName,  'w');
  ns.write('cpu_cores.txt',     server.cpuCores,          'w');
  ns.write('money_max.txt',     server.moneyMax,          'w');
  ns.write('security_min.txt',  server.minDifficulty,     'w');
  ns.write('total_ram.txt',     server.maxRam,            'w');
}