const STATUS_OK = 200;

/** 
 * Testing endpoint, for ensuring clients can communicate back and forth. 
 * 
 * Requires Formulas.
 * 
 * @param {NS} ns 
 * @param {Object} data object: 
 * 	"target": target hostname
 * 	"host": hostname of where the script will be run
 * 	"ram": GB ram allocated to budget (default is server max)
 * */
export default async function hwgw(ns, data) {
	const context = buildContext(ns, data);

	return [STATUS_OK, calcHGW(context)];
}

function buildContext(ns, data) {
	const host = data.host;
	const hostSrv = ns.getServer(host);
	const hostRam = data.ram || hostSrv.maxRam;
	const target = data.target;
	const targetSrv = ns.getServer(target);
	const player = ns.getPlayer();

	return { ns, host, hostSrv, hostRam, target, targetSrv, player };
}

function calcHGW(ctx, h = 1) {
	// given an h thread, how many g threads are necessary?
	const hPct = hTakePct(ctx) * h
	const g = gNeededForPct(ctx, hPct);

	// given h + g, how many w threads are necessary?
	const w1 = w1Needed(ctx, h);
	const w2 = w2Needed(ctx, g);

	// do we have enough memory for it?
	const threads = { h, g, w1, w2 }

	if (!hasEnoughRam(ctx, threads))
		return false;
	return calcHGW(ctx, h + 1) || threads;
}

const hTakePct = (ctx) => ctx.ns.formulas.hacking.hackPercent(ctx.targetSrv, ctx.player);

function gNeededForPct(ctx, pct) {
	const server = ctx.ns.getServer(ctx.target); // explicitly create a copy
	server.moneyAvailable = server.moneyMax * (1 - pct);
	return ctx.ns.formulas.hacking.growThreads(server, ctx.player, server.moneyMax, ctx.hostSrv.cpuCores);
}

// @TODO: remove
function wNeeded(ctx, h, g) {
	const hSec = ctx.ns.hackAnalyzeSecurity(h);
	const gSec = ctx.ns.growthAnalyzeSecurity(g, ctx.target, ctx.hostSrv.cpuCores);
	const wSec = ctx.ns.weakenAnalyze(1, ctx.hostSrv.cpuCores);
	return Math.ceil((hSec + gSec) / wSec);
}

function w1Needed(ctx, h) {
	const hSec = ctx.ns.hackAnalyzeSecurity(h);
	const wSec = ctx.ns.weakenAnalyze(1, ctx.hostSrv.cpuCores);
	return Math.ceil(hSec / wSec);
}

function w2Needed(ctx, g) {
	const gSec = ctx.ns.growthAnalyzeSecurity(g, ctx.target, ctx.hostSrv.cpuCores);
	const wSec = ctx.ns.weakenAnalyze(1, ctx.hostSrv.cpuCores);
	return Math.ceil(gSec / wSec);
}

const hasEnoughRam = (ctx, t) => (ctx.hostRam - calcThreadsRam(t)) > 0;
const calcThreadsRam = (t) => (1.7 * t.h) + (1.75 * (t.g + t.w1 + t.w2));

// function expandMillis(ms) {
// 	let seconds = Math.round(ms / 1000);
// 	let minutes = Math.floor(seconds / 60);
// 	seconds %= 60;
// 	let hours = Math.floor(minutes / 60);
// 	minutes %= 60;

// 	return [
// 		`${hours ? hours + 'h ' : ''}`,
// 		`${minutes ? minutes + 'm ' : ''}`,
// 		`${seconds ? seconds + 's ' : ''}`,
// 	].join('');
// }

export async function main(ns) {
	const data = {
		'host': ns.args[0] || 'home',
		'target': ns.args[1] || 'joesguns',
		'ram': ns.args[2] || 32,
	}
	ns.print(JSON.stringify(await hgw2(ns, data)));
	ns.tail();
}