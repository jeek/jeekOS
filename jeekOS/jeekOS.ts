import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export async function main(ns: NS): Promise<void> {
    let Game = new WholeGame(ns);
    while (Game.running) {
        await ns.asleep(1000);
    }
}
