import { ActiveFragment } from '@/NetscriptDefinitions';
import { getFromApi } from './HTTP/API';

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
		const fragments = await getFragmentCoords(ns);
		for (let i=0; i < 100; i++)
			for (const f of fragments)
				await chargeFragment(ns, f);
		await ns.sleep(1000);
	}
}

async function getFragmentCoords(ns: NS): Promise<ActiveFragment[]> {
	const request = {endpoint: 'stanek', callback: 2130, data: {} }
	const fragments = (await getFromApi(ns, request)).data['fragments'];
	return fragments;
}

async function chargeFragment(ns: NS, fragment: ActiveFragment) {
	try {
		ns.print(`INFO now charging (${fragment.x}, ${fragment.y})`);
		await ns.stanek.chargeFragment(fragment.x,    fragment.y);
	} catch {
		ns.print(`WARNING fragment does not exist`);
	}
}
