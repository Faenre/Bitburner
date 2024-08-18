import { getFromApi } from './HTTP/API';

/**
 * Get HGW thread counts to hack current server with its own ram/cores.
 *
 * @param ns
 */
export async function main(ns: NS) {
  const threads = await getHgwThreads(ns);
  ns.print(threads);
  ns.tail();
}

async function getHgwThreads(ns: NS): Promise<object> {
  const hostname = ns.getHostname();
  const request = {
    endpoint: 'calc_hgw',
    callback: hostname,
    data: { target: hostname, ram: ns.getServerMaxRam(hostname), cores: 1 },
  }
  const response = await getFromApi(ns, request);
  return response.data;
}
