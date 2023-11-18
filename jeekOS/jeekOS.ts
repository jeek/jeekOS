import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";
import { Maps } from "jeekOS/Maps/maps";
import { Charts } from "jeekOS/Charts/charts";

export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["map", false],
        ["augs", false]
    ]);
    let didSomething = false;
    if (args['map']) {
        didSomething = true;
        await Maps(ns);
    }
    if (args['augs']) {
        didSomething = true;
        await ((new Charts(ns)).augList());
    }
    if (!didSomething) {
        let Game = new WholeGame(ns);
        while (Game.running == false) {
            await ns.asleep(1000);
        }
        await Game.jobs.allJobs();
        while (Game.running == true) {
            await ns.asleep(1000);
        }
    }
}
