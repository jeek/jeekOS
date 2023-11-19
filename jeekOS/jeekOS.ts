import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";
import { Maps } from "jeekOS/Maps/maps";
import { Charts } from "jeekOS/Charts/charts";

let gangMemberNames: string[] = [
    ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Saggitarius","Capricorn","Aquarius","Pisces"],
    ["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"],
    ["Lion","Hydra","Hind","Boar","Stables","Birds","Bull","Horses","Belt","Cattle","Apples","Cerebrus"]
][Math.floor(Math.random()*3)];

export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["map", false],
        ["augs", false],
        ["gangToJoin", "Slum Snakes"],
        ["gangMemberNames", gangMemberNames]
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
        let Game = new WholeGame(ns, args['gangToJoin'] as string, args['gangMemberNames'] as string[]);
        while (Game.running == false) {
            await ns.asleep(1000);
        }
        await Game.jobs.allJobs();
        while (Game.running == true) {
            await ns.asleep(1000);
        }
    }
}
