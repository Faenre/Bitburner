import { ActiveFragment } from '@/NetscriptDefinitions';
import { getRequest } from './HTTP/API';

/**
 * Utility to roate through stanek fragments.
 *
 * To use, click-and-drag the current Active Fragments Summary
 * and copy/paste in the below quote.
 *
 * @TODO add visualizer
 */
export async function main(ns: NS) {
	ns.disableLog('stanek.chargeFragment');

	while (true) {
		for (let i=0; i < 100; i++)
			(await getFragmentCoords(ns)).forEach(async f => await charge(ns, f));
		await ns.sleep(1000);
	}
}

const getFragmentCoords = async (ns: NS): Promise<ActiveFragment[]> => (
	await getRequest(ns, 'stanek')['data']['fragments']
);

async function charge(ns: NS, fragment: ActiveFragment) {
	try {
		ns.print(`INFO now charging (${fragment.x}, ${fragment.y})`);
		await ns.stanek.chargeFragment(fragment.x,    fragment.y);
	} catch {
		ns.print(`WARNING fragment does not exist`);
	}
}
