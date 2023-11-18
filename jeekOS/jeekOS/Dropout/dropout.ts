import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export class Dropout {
    done: boolean;
    Game: WholeGame;
    ns: NS;
    limit: number;

    constructor(game: WholeGame, limit: number = 200) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.done = false;
        this.limit = limit;
        this.dropout();
    }
    async dropout() {
        if ((await Do(this.ns, "ns.getPlayer"))!.skills.hacking < this.limit) {
            while (await Do(this.ns, "ns.singularity.isBusy")) {
                await this.ns.asleep(1000);
            }
            await this.Game.traveling.assertLocation("Sector-12");
            await Do(this.ns, "ns.singularity.universityCourse", "Rothman University", "Algorithms", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
            let temp = 0;
            while (((await Do(this.ns, "ns.getPlayer"))!.skills.hacking < this.limit) && (temp != (await Do(this.ns, "ns.getPlayer"))!.skills.hacking)) {
                temp = (await Do(this.ns, "ns.getPlayer"))!.skills.hacking;
                await this.ns.asleep(60000);
            }
            Do(this.ns, "ns.singularity.stopAction");
        }
        this.done = true;
    }
}