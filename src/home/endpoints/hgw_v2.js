const STATUS_OK = 200;

/** 
 * Testing endpoint, for ensuring clients can communicate back and forth. 
 * 
 * @param {NS} ns 
 * @param {Object} data object with "target" and "host" keys
 * */
export default async function hgw2(ns, data) {
	const context = buildContext(ns, data);

	return [STATUS_OK, calcHGW(context)];
}

function buildContext(ns, data) {
	const host = data.host;
	const target = data.target;
	const hostSrv = ns.getServer(host);
	const targetSrv = ns.getServer(target);
	const player = ns.getPlayer();

	return { ns, host, hostSrv, target, targetSrv, player };
}

function calcHGW(ctx, h = 1) {
	// given an h thread, how many g threads are necessary?
	const hPct = hTakePct(ctx) * h
	const g = gNeededForPct(ctx, hPct);

	// given h + g, how many w threads are necessary?
	const w = wNeeded(ctx, h, g);

	// do we have enough memory for it?
	const threads = { h, g, w }

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

function wNeeded(ctx, h, g) {
	const hSec = ctx.ns.hackAnalyzeSecurity(h);
	const gSec = ctx.ns.growthAnalyzeSecurity(g, ctx.target, ctx.hostSrv.cpuCores);
	const wSec = ctx.ns.weakenAnalyze(1, ctx.hostSrv.cpuCores);
	return Math.ceil((hSec + gSec) / wSec);
}

const hasEnoughRam = (ctx, t) => (getRamAvailable(ctx) - calcThreadsRam(t)) > 0;
// const getRamAvailable = (ns) => ns.getServerMaxRam(HOST) - ns.getServerUsedRam(HOST);
const getRamAvailable = (ctx) => ctx.hostSrv.maxRam - ctx.hostSrv.ramUsed;
const calcThreadsRam = (t) => (1.7 * t.h) + (1.75 * (t.g + t.w));

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
		'host': 'home',
		'target': 'joesguns',
	}
	ns.print(JSON.stringify(await hgw2(ns, data)));
	ns.tail();
}