const GITHUB_SLUG = 'https://raw.githubusercontent.com/Faenre/Bitburner/main';

// Setup scripts, at /scripts/remote/
const SETUP_SCRIPTS = ['initialize.js', 'yoink.js', 'equilibrium.js'];

// Tools, at /scripts/toolbox/
const TOOLBOX = ['hack1.js', 'grow1.js', 'weaken1.js'];

/** 
 * Downloads the initializer script and the Yoink! script, plus some tools.
 * 
 * Runs them, optionally.
 * 
 * @param {NS} ns 
 * @arg {String} target host
 * @arg {Boolean} whether to start yoink
 */
export async function main(ns) {
  const host = ns.args[0];
  const startYoink = ns.args[1];

  await deliverFiles(ns, host);
  ns.exec('initialize.js', host);

  if (startYoink) {
    const threads = ns.getServerMaxRam(host) / 2.0;

    await ns.sleep(200);
    ns.exec('yoink.js', host, threads);
  }

  ns.toast('Remote Init complete!');
}

async function deliverFiles(ns, host) {
  for (let script of SETUP_SCRIPTS)
    await ns.wget(`${GITHUB_SLUG}/scripts/remote/${script}`, script, host);

  for (let script of TOOLBOX)
    await ns.wget(`${GITHUB_SLUG}/scripts/toolbox/${script}`, `/toolbox/${script}`, host);
}