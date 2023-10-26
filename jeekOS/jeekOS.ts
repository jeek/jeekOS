import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export async function main(ns: NS): Promise<void> {
    let Game = new WholeGame(ns);
    while (Game.running == false) {
        await ns.asleep(1000);
    }
    while (Game.running == true) {
        await ns.asleep(1000);
    }

}
