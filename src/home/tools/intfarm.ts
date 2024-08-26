import { getRequest } from '../HTTP/API';
import { SleeveInfo } from '../lib/Sleeve';

const INFILTRATE = 'Infiltrate Synthoids';

/**
 * Farm intelligence via Bladeburner contracts.
 */
export async function main(ns: NS) {
  stopAllSleeves(ns);

  while (true)
    await doInfiltrate(ns, await getNextSleeveID(ns))
}

async function doInfiltrate(ns: NS, id: number): Promise<void> {
  do {
    ns.sleeve.setToBladeburnerAction(id, INFILTRATE)
    await ns.sleeve.getTask(id)['nextCompletion'];
  } while (ns.sleeve.getSleeve(id).storedCycles > 0);
  ns.sleeve.setToIdle(id);
}

async function stopAllSleeves(ns: NS): Promise<void> {
  ((await getRequest(ns, 'get_sleeves'))['sleeves'] as SleeveInfo[])
    .forEach(sleeve => ns.sleeve.setToIdle(sleeve.id));
}

async function getNextSleeveID(ns: NS): Promise<number> {
  // return getSleeveInfos(ns, 8).reduce(highestBonusTime).id;
  return ((await getRequest(ns, 'get_sleeves'))['sleeves'] as SleeveInfo[])
    .reduce(highestBonusTime).id;
}

const highestBonusTime = (highest: SleeveInfo, next: SleeveInfo): SleeveInfo =>
  highest.storedCycles > next.storedCycles ? highest : next;


// async function _getSleeves(ns: NS): Promise<SleeveInfo[]> {
//   const request = { endpoint: 'sleeves', callback: 2050, data: {} };

//   return (await getFromApi(ns, request)).data['sleeves'];
// }

// function getActionCount(ns: NS, type: string): number {
//   return JOBS[type]
//     .map((name: string) => Math.floor(ns.bladeburner.getActionCountRemaining(type, name)))
//     .reduce(add);
// }

// const idle = (ns: NS, id: number): void => { ns.sleeve.setToIdle(id) };
