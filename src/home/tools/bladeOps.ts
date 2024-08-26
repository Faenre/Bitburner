/**
 * Farm intelligence via Bladeburner contracts.
 */
export async function main(ns: NS) {

  // while (true)
  //   // await doInfiltrate(ns, await getNextSleeveID(ns))
  ns.print('tbd');
}

// async function doInfiltrate(ns: NS, id: number): Promise<void> {
//   do {
//     ns.sleeve.setToBladeburnerAction(id, INFILTRATE)
//     await ns.sleeve.getTask(id)['nextCompletion'];
//   } while (ns.sleeve.getSleeve(id).storedCycles > 0);
//   ns.sleeve.setToIdle(id);
// }
