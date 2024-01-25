let NS;
let Command;
let Target;
let Botnet;

const GROW_URL = 'https://raw.githubusercontent.com/Faenre/Bitburner/main/scripts/remote/grow.js';
const WEAKEN_URL = 'https://raw.githubusercontent.com/Faenre/Bitburner/main/scripts/remote/weaken.js';
const YOINK_URL = 'https://raw.githubusercontent.com/Faenre/Bitburner/main/scripts/remote/yoink.js';

/** 
 * @param {NS} ns 
 * @param {String} a command keyword
 * @param {String} a target host (if applicable)
 * @param {Boolean} (optional) whether to keep watch and end when done
 * */
export async function main(ns) {
  NS = ns;
  Command = NS.args[0];
  Target = NS.args[1];
  Botnet = (await NS.read('bots.txt')).trim().split("\n");

  await startBotnet();

  if (NS.args[2] == true) {
  	if (Command == 'farmville') {
  		await awaitMaxMoney();

  		// now undo the security hike
	  	Command = 'beatdown';
	  	await startBotnet();
	  	await awaitMinSecurity();
  	} else if (Command == 'beatdown') {
	  	await awaitMinSecurity();
  	}

  	Command = 'piracy';
  	await startBotnet();
  }
}

async function startBotnet() {
  const command = getCommand(Command);
  for (let i=0; i < Botnet.length; i++) {
    await command(Botnet[i]);
  }
  await NS.toast('All bots active!');
}

/**
 * @param {String} a command for the switch
 * @return {Function} the function to be later invoked once per bot
 */
function getCommand(command) {
  switch (command) {
    case 'status':
      return showStatus;
    case 'farmville':
      return farmville;
    case 'beatdown':
      return beatdown;
    case 'piracy':
      return piracy;
    default:
    	return async () => await NS.print('Unknown command: ' + command)
  }
}


async function showStatus(host) {
  // @todo: summarize all bots and their current statuses

}


async function farmville(host) {
	await NS.killall(host, true)

  const threads = await calcThreads(host, 1.75);

  await NS.wget(GROW_URL, 'grow.js', host);
  await NS.exec('grow.js', host, threads, Target)
}


async function beatdown(host) {
	await NS.killall(host, true)

  const threads = await calcThreads(host, 1.75);

  await NS.wget(WEAKEN_URL, 'weaken.js', host);
  await NS.exec('weaken.js', host, threads, Target)
}


async function piracy(host) {
	await NS.killall(host, true)

  const threads = await calcThreads(host, 2.0);

  await NS.wget(YOINK_URL, 'yoink.js', host);
  await NS.exec('yoink.js', host, threads)
}


async function calcThreads(host, ramNeeded) {
	const server = await NS.getServer(host);
	const availableRam = server.maxRam - server.ramUsed;
	return Math.floor(availableRam / ramNeeded);
}


async function awaitMaxMoney() {
	let server = await NS.getServer(Target);
	const maxMoney = server.moneyMax;
	while (server.moneyAvailable < maxMoney) {
		const msg = '' + Math.floor(server.moneyAvailable) + '/' + maxMoney;
		await NS.print(msg);
		// const pct = NS.formatPercent(server.moneyAvailable / server.maxMoney, 2);
		await NS.toast(msg, 'info')
		await NS.sleep(1 * 60 * 1000);
		server = await NS.getServer(Target);
	}
}


async function awaitMinSecurity() {
	let server = await NS.getServer(Target);
	const minSecurity = server.minDifficulty;
	while (server.hackDifficulty > minSecurity) {
		const msg = '' + server.hackDifficulty + '/' + minSecurity;
		await NS.print(msg);
		await NS.toast(msg, 'info')
		await NS.sleep(1 * 60 * 1000);
		server = await NS.getServer(Target);
	}
}