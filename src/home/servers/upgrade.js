/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const ram = ns.args[1];

  validateInputs(ns, target, ram);

  const success = ns.upgradePurchasedServer(target, ram);

  if (success) {
    ns.toast('Server upgrade successful.');
  } else {
    ns.alert('Something went wrong!');
  }
}

function validateInputs(ns, target, ram) {
  if (!serverIsUpgradable(ns, target)) {
    ns.alert('Server not upgradable!');
    ns.exit();
  }

  if (!ramAmountIsOkay(ram)) {
    ns.alert('Bad RAM amount!');
    ns.exit();
  }
}

function serverIsUpgradable(ns, target) {
  for (let server of ns.getPurchasedServers())
    if (server == target) return true;
  return false;
}

function ramAmountIsOkay(amount, i = 20) {
  if (amount == 2 ** i) return true;
  if (i == 0) return false;

  return ramAmountIsOkay(amount, i - 1);
}