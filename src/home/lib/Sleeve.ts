import { CityName, HP, Multipliers, Skills, SleevePerson, SleeveTask } from "@/NetscriptDefinitions";

export interface SleeveInfo extends SleevePerson {
  id: number;
  task: SleeveTask | null;

  // Inherited from SleevePerson:
  memory: number;
  sync: number;
  shock: number;
  storedCycles: number;

  // Inherited from Person:
  hp: HP;
  city: CityName;
  skills: Skills;
  exp: Skills;
  mults: Multipliers;
}

export function getSleeveInfos(ns: NS, numSleeves: number=8): SleeveInfo[] {
  return Array(numSleeves)
    .fill(false)
    .map((_, i) => ns.sleeve.getSleeve(i))
    .map((sleeve, id) => ({
      ...sleeve,
      id,
      task: ns.sleeve.getTask(id)
    }));
}

// function getNumSleeves(ns: NS): number {
//   for (let i=7; i >= 0; i--)
//     try {
//       if (ns.sleeve.getSleeve(i)) return i+1;
//     } catch {;}
//   return 0;
// }
