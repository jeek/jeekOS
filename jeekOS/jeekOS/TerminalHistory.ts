import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { getTruePlayer } from "jeekOS/TruePlayer";

export class terminalHistory {
  Game: WholeGame;
  ns: NS;
  log: any;
  display: any;

  constructor(Game: WholeGame) {
    this.Game = Game;
    this.ns = Game.ns;
    this.log = {};
    this.display = {};
    this.start();
  }
  async start() {
    await this.ns.asleep(1000);
    let done = false;
    while (!done) {
      try {
        this.log = this.Game.doc.querySelector(".sb")!.querySelector(".thbox");
        this.log ??= this.Game.createSidebarItem(
          "TerminalHistory",
          "",
          "T",
          "thbox"
        );
        done = true;
      } catch {
      }
    }
    this.display = this.Game.sidebar
      .querySelector(".thbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    let player = getTruePlayer();
    while (true) {
      this.display.innerHTML = player["terminalCommandHistory"].join("<BR>");
      this.log.recalcHeight();
      await this.ns.asleep(1000);
    }
  }
}
