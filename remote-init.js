let NS;
let Host;
let Server;

const INIT_URL = 'https://raw.githubusercontent.com/Faenre/Bitburner/main/initialize.js';
const YOINK_URL = 'https://raw.githubusercontent.com/Faenre/Bitburner/main/yoink.js';

/** 
 * Downloads the initializer script and the Yoink! script to the target.
 * 
 * Runs them, too.
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
  NS = ns;
  Host = ns.args[0];
  Server = ns.getServer(Host);

  await deliverFiles();
  await startYoinker();
}

async function deliverFiles() {
  await NS.wget(INIT_URL, 'initialize.js', Host);
  await NS.wget(YOINK_URL, 'yoink.js', Host);
}

async function startYoinker() {
  const threads = Server.maxRam / 2.0;
  await NS.exec('initialize.js', Host);
  await NS.sleep(1000);
  await NS.exec('yoink.js', Host, threads);
}