import { BladeburnerCurAction, SleeveBladeburnerTask, SleeveInfiltrateTask, SleeveTask } from "@/NetscriptDefinitions";
import { avg } from './math';

export const JOBS = Object.freeze({
	'Operations': [
		'Assassination',
    /**
     * @TODO have a separate "Do These" jobs section.
     *  Right now we never ever want to perform these
     *  actions, so we're going to block them.
     */
		// 'Stealth Retirement Operation',
		// 'Raid',
		// 'Sting Operation',
		// 'Undercover Operation',
		'Investigation',
	],
	'Contracts': [
		'Retirement',
		'Bounty Hunter',
		'Tracking',
	],
	'General': [
		'Recruitment',
    'Field Analysis',
	],
  'Black Operations': [
    "Operation Typhoon",
    "Operation Zero",
    "Operation X",
    "Operation Titan",
    "Operation Ares",
    "Operation Archangel",
    "Operation Juggernaut",
    "Operation Red Dragon",
    "Operation K",
    "Operation Deckard",
    "Operation Tyrell",
    "Operation Wallace",
    "Operation Shoulder of Orion",
    "Operation Hyron",
    "Operation Morpheus",
    "Operation Ion Storm",
    "Operation Annihilus",
    "Operation Ultron",
    "Operation Centurion",
    "Operation Vindictus",
    "Operation Daedalus",
  ],
});

export function getBladeTask(ns: NS, sleeveId: number): BladeTask {
  if (sleeveId >= 0)
    return new SleeveBladeTask(ns, sleeveId);
  else
    return new PlayerBladeTask(ns);
}

export class BladeTask {
	type: string;
	name: string;
	level: number;
	timeSpent: number;
	timeNeeded: number;
  progress: number;
	successPcts: [number, number];
  successAvg: number;

	static NON_BLADE_TASK = Object.freeze({ type: 'Other', name: 'Other' });

	static getActionLevel(ns: NS, task: BladeburnerCurAction): number {
		if ([...JOBS.Operations, ...JOBS.Contracts].includes(task.name))
			return ns.bladeburner.getActionCurrentLevel(task.type, task.name);

		const blopIndex = JOBS['Black Operations'].findIndex(name => name === task.name);
		if (blopIndex >= 0)
			return blopIndex + 1;

		return -1;
	}

	static getSuccessPcts(ns: NS, task: BladeburnerCurAction, sleeveId: number=null): [number, number] {
    if (task.name === 'Infiltrating Synthdroids')
      return [1, 1];

    if (!Object.values(JOBS).flat().includes(task.name))
      return [-1, -1];

    return ns.bladeburner.getActionEstimatedSuccessChance(
      task.type, task.name, sleeveId
    );
	}
}

class PlayerBladeTask extends BladeTask {
	constructor(ns: NS) {
		super();
		const task = ns.bladeburner.getCurrentAction() || BladeTask.NON_BLADE_TASK;
		this.type = task.type;
		this.name = task.name;
		this.timeSpent = ns.bladeburner.getActionCurrentTime() || 0;
		this.timeNeeded = PlayerBladeTask.getTaskTime(ns, task) || 1;
    this.progress = this.timeSpent / this.timeNeeded;
		this.level = BladeTask.getActionLevel(ns, task);
		this.successPcts = BladeTask.getSuccessPcts(ns, task);
    this.successAvg = avg(this.successPcts);
	}

	static getTaskTime(ns: NS, task: BladeburnerCurAction): number {
		if (task.name === BladeTask.NON_BLADE_TASK.name)
			return 1;
		return ns.bladeburner.getActionTime(task.type, task.name);
	}
}

class SleeveBladeTask extends BladeTask {
	constructor(ns: NS, sleeveId: number) {
		super();
		const sleeveTask = SleeveBladeTask.getSleeveBladeburnerTask(ns, sleeveId);
		const bladeTask = { type: sleeveTask.actionType, name: sleeveTask.actionName };
		this.type = bladeTask.type;
		this.name = bladeTask.name;
		this.timeSpent = sleeveTask.cyclesWorked || 0;
		this.timeNeeded = sleeveTask.cyclesNeeded || 1;
    this.progress = this.timeSpent / this.timeNeeded;
		this.level = BladeTask.getActionLevel(ns, bladeTask);
		this.successPcts = BladeTask.getSuccessPcts(ns, bladeTask, sleeveId);
    this.successAvg = avg(this.successPcts);
	}

	static getSleeveBladeburnerTask(ns: NS, sleeveId: number): SleeveBladeburnerTask | SleeveInfiltrateTask {
		const task = ns.sleeve.getTask(sleeveId);
		if (task?.type === 'BLADEBURNER') return task;

		// If the task is not "actually" Bladeburner,
    // fake it with other answers:
		return {
			type: 'BLADEBURNER',
			actionName: SleeveBladeTask.getSleeveTaskName(task),
			actionType: 'General',
			cyclesWorked: task?.['cyclesWorked'] || 0,
			cyclesNeeded: task?.['cyclesWorked'] || 1,
			nextCompletion: new Promise(_ => null),
			tasksCompleted: 1,
		}
	}

	static getSleeveTaskName(sleeveTask: SleeveTask) {
		switch (sleeveTask?.type) {
			case 'BLADEBURNER':
				return sleeveTask.actionName;
			case 'INFILTRATE':
				return 'Infiltrating Synthdroids';
			case 'CLASS':
				if (String(typeof sleeveTask.classType) === 'GymType')
					return `Training ${sleeveTask.classType}`;
				else
					return `Studying ${sleeveTask.classType}`;
			default:
				return 'Other';
		}
	}
}
