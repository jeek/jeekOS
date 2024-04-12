import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";

export class Traveling {
  Game: WholeGame;
  ns: NS;

  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
  }
  async assertLocation(place: string) {
    while ((await Do(this.ns, "ns.getPlayer"))!.city != place) {
      await this.Game.crime.getMoney(200000);
      await Do(this.ns, "ns.singularity.travelToCity", place);
    }
  }
}
