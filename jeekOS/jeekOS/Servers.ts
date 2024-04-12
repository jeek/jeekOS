import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { jFormat } from "jeekOS/jFormat";
import { WholeGame } from "jeekOS/WholeGame";
import { SimpleServer } from "jeekOS/SimpleServer";

export class Servers {
  initialized: boolean;
  ns: NS;
  Game: WholeGame;
  servers: SimpleServer[];
  log: any;
  display: any;
  displayB: boolean;
  constructor(game: WholeGame, display = false) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.initialized = false;
    this.initialize();
    this.displayB = display;
    this.servers = [];
  }

  async initialize() {
    let servers = ["home"];
    let i = 0;
    while (i < servers.length) {
      let newservers = (await Do(this.ns, "ns.scan", servers[i])) as string[];
      for (let servername of newservers) {
        if (!servers.includes(servername)) {
          servers = servers.concat(servername);
        }
      }
      i += 1;
    }
    this.servers = servers.map((x) => new SimpleServer(this.ns, x));
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".serverbox");
    this.log ??= this.Game.createSidebarItem("Servers", "", "S", "serverbox");
    this.display = this.Game.sidebar
      .querySelector(".serverbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");

    this.initialized = true;
    if (this.displayB) {
      this.displayB = false;
      this.displayLoop();
    }
  }
  async displayLoop() {
    while (true) {
      let table = "<TABLE WIDTH=100% BORDER=1 CELLPADDING=0 CELLSPACING=0>";
      let rows: any[] = [];
      for (let server of this.servers) {
        rows.push([
          (await Do(this.ns, "ns.getServer", server.name)).maxRam -
            (await Do(this.ns, "ns.getServer", server.name)).ramUsed,
          "<TR><TD>" +
            server.name +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat((await Do(this.ns, "ns.getServer", server.name)).ramUsed) +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat((await Do(this.ns, "ns.getServer", server.name)).maxRam) +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat(
              (await Do(this.ns, "ns.getServer", server.name)).moneyAvailable ??
                0
            ) +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat(
              (await Do(this.ns, "ns.getServer", server.name)).moneyMax ?? 0
            ) +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat(
              (await Do(this.ns, "ns.getServer", server.name)).minDifficulty ??
                0
            ) +
            "</TD><TD ALIGN=RIGHT>" +
            jFormat(
              (await Do(this.ns, "ns.getServer", server.name)).hackDifficulty ??
                0
            ) +
            "</TD></TR>",
        ]);
      }
      rows.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      for (let row of rows) {
        table = table + row[1];
      }
      this.display.innerHTML = table + "</TABLE>";
      this.log.recalcHeight();
      await this.ns.asleep(60000);
    }
  }
  async popall() {
    this.initialized = false;
    this.initialize();
    while (this.initialized == false) {
      await this.ns.asleep(100);
    }
    let currentfiles = (await Do(this.ns, "ns.ls", "home")) as string[];
    let portopeners =
      (currentfiles.includes("BruteSSH.exe") ? 1 : 0) +
      (currentfiles.includes("FTPCrack.exe") ? 1 : 0) +
      (currentfiles.includes("relaySMTP.exe") ? 1 : 0) +
      (currentfiles.includes("HTTPWorm.exe") ? 1 : 0) +
      (currentfiles.includes("SQLInject.exe") ? 1 : 0);
    for (let server of this.servers) {
      if (!(await server.hasAdminRights)) {
        if (((await server.numOpenPortsRequired) as number) <= portopeners) {
          await Do(this.ns, "ns.toast", "Popping " + server.name);
          if (currentfiles.includes("BruteSSH.exe")) {
            await Do(this.ns, "ns.brutessh", server.name);
          }
          if (currentfiles.includes("FTPCrack.exe")) {
            await Do(this.ns, "ns.ftpcrack", server.name);
          }
          if (currentfiles.includes("relaySMTP.exe")) {
            await Do(this.ns, "ns.relaysmtp", server.name);
          }
          if (currentfiles.includes("HTTPWorm.exe")) {
            await Do(this.ns, "ns.httpworm", server.name);
          }
          if (currentfiles.includes("SQLInject.exe")) {
            await Do(this.ns, "ns.sqlinject", server.name);
          }
          await Do(this.ns, "ns.nuke", server.name);
        }
      }
    }
  }

  async popallloop() {
    while (true) {
      this.popall();
      await this.ns.asleep(60000);
    }
  }

  async recheck() {
    this.initialized = false;
    await this.initialize();
  }
}
