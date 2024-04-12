import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";

export class Focus {
  ns: NS;
  Game: WholeGame;
  initialized: boolean;
  focus: any[];
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.focus = [];
    this.initialized = false;
    this.initialize();
  }
  async initialize() {
    this.initialized = true;
    while (true) {
      await this.backdoorscan();
    }
  }
  async backdoorscan() {
    let playerlocation = "home";
    let servers = ["home"];
    let connected = new Map<string, string>();
    let i = 0;
    while (i < servers.length) {
      if ((await Do(this.ns, "ns.getServer", servers[i])).isConnectedTo) {
        playerlocation = servers[i];
      }
      let scanResult = await Do(this.ns, "ns.scan", servers[i]);
      for (let server of scanResult) {
        if (!servers.includes(server)) {
          connected.set(server, servers[i]);
          servers = servers.concat(server);
        }
      }
      i += 1;
    }
    i = 0;
    servers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"].concat(
      servers
    );
    if (servers.includes("w0r1d_d43m0n")) {
      servers = ["w0r1d_d43m0n"].concat(servers);
    }
    while (i < servers.length) {
      if (!(await Do(this.ns, "ns.getServer", servers[i])).backdoorInstalled) {
        if ((await Do(this.ns, "ns.getServer", servers[i])).hasAdminRights) {
          if (
            (await Do(this.ns, "ns.getServer", servers[i]))
              .requiredHackingSkill <=
            (await Do(this.ns, "ns.getPlayer")).skills.hacking
          ) {
            let path = [servers[i]];
            while (path[path.length - 1] != "home") {
              path = path.concat(connected.get(path[path.length - 1])!);
              await this.ns.asleep(0);
            }
            await Do(this.ns, "ns.singularity.connect", "home");
            while (path.length > 0) {
              await Do(this.ns, "ns.singularity.connect", path.pop()!);
              await this.ns.asleep(0);
            }
            if (servers[i] == "w0r1d_d43m0n") {
              this.ns.toast("Goodbye.");
              await Do(
                this.ns,
                "ns.singularity.destroyW0r1dD43m0n",
                12,
                "jeekOS.js"
              );
            } else {
              await Do(this.ns, "await ns.singularity.installBackdoor");
            }
            await Do(this.ns, "ns.singularity.connect", "home");
            return;
          }
        }
      }
      i += 1;
    }
    await this.ns.asleep(60000);
  }
}
