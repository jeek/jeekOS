import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { Office } from "jeekOS/Office";
import { Corp } from "jeekOS/Corp";
import { Warehouse } from "jeekOS/Warehouse";
import { WholeGame } from "jeekOS/WholeGame";
import { agriculture } from "jeekOS/Agriculture";
import { chemical } from "jeekOS/Chemical";
import { tobacco } from "jeekOS/Tobacco";

export class Division {
  name: string;
  type: string;
  ns: NS;
  Game: WholeGame;
  c: Corp;
  o: { [key: string]: Office };
  w: { [key: string]: Warehouse };
  goalSize: number;
  ding: boolean;
  rd: boolean;
  indData: any;
  log: any;
  display: any;
  constructor(corp: Corp, name: string, type: string) {
    this.c = corp;
    this.Game = corp.Game;
    this.ns = corp.ns;
    this.type = type;
    this.name = name;
    this.goalSize = 0;
    this.o = {};
    this.w = {};
    this.ding = false;
    this.rd = false;
    this.indData = {};
    this.log = {};
    this.display = {};
    this.start();
  }
  get state() {
    return this.c.state;
  }
  async start() {
    this.log = this.Game.doc
      .querySelector(".sb")!
      .querySelector("." + this.type + "box");
    this.log ??= this.Game.createSidebarItem(
      this.name,
      "",
      this.name[0],
      this.type + "box"
    );
    this.display = this.Game.sidebar
      .querySelector("." + this.type + "box")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    //        this.ns.tprint("Division start: ", this.name);
    this.indData = await Do(
      this.ns,
      "ns.corporation.getIndustryData",
      this.type
    );
    (
      Object.values(this.ns.enums.CityName) as (
        | "Sector-12"
        | "Aevum"
        | "Volhaven"
        | "Chongqing"
        | "New Tokyo"
        | "Ishima"
      )[]
    ).map(
      (
        city:
          | "Sector-12"
          | "Aevum"
          | "Volhaven"
          | "Chongqing"
          | "New Tokyo"
          | "Ishima"
      ) =>
        (this.o[city as string] = new Office(this.Game, this.name, city, this))
    );
    (
      Object.values(this.ns.enums.CityName) as (
        | "Sector-12"
        | "Aevum"
        | "Volhaven"
        | "Chongqing"
        | "New Tokyo"
        | "Ishima"
      )[]
    ).map(
      (
        city:
          | "Sector-12"
          | "Aevum"
          | "Volhaven"
          | "Chongqing"
          | "New Tokyo"
          | "Ishima"
      ) =>
        (this.w[city as string] = new Warehouse(
          this.Game,
          this.name,
          city,
          this
        ))
    );
    while (!this.initialized) {
      await this.ns.asleep(0);
    }
    switch (this.type) {
      case "Agriculture":
        agriculture(this);
        break;
      case "Chemical":
        chemical(this);
        break;
      case "Tobacco":
        tobacco(this);
        break;
      default:
        agriculture(this);
        break;
    }
    let state = "";
    while (true) {
      while (this.c.state == state) {
        await this.ns.asleep(0);
      }
      state = this.c.state;
      this.display.innerHTML = "Boobs";
      this.log.recalcHeight();
    }
  }
  get initialized() {
    if (Object.values(this.o).length < 6) {
      return false;
    }
    if (Object.values(this.w).length < 6) {
      return false;
    }
    try {
      return (
        Object.values(this.o)
          .map((x: any) => x.initialized)
          .reduce((a: any, b: any) => a && b) &&
        Object.values(this.w)
          .map((x: any) => x.initialized)
          .reduce((a: any, b: any) => a && b)
      );
    } catch {
      return false;
    }
  }
  async isHappy() {
    for (let city of Object.values(this.o)) {
      if (!(await city.isHappy())) {
        this.ns.print(city.city, " is not happy");
        return false;
      }
      this.ns.print(city.city, " is happy");
    }

    return true;
  }
  get plunge() {
    try {
      return (
        Object.values(this.o)
          .map((x: any) => x.plunge)
          .reduce((a: any, b: any) => a && b) &&
        Object.values(this.w)
          .map((x: any) => x.plunge)
          .reduce((a: any, b: any) => a && b)
      );
    } catch {
      return false;
    }
  }
  async getHappy() {
    await Promise.all(
      (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
        this.o[city as string].getHappy()
      )
    );
  }
  async jobfair() {
    await Promise.all(
      (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
        this.o[city as string].jobfair()
      )
    );
  }
  async WarehouseSet(material: string, level: number) {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].WarehouseSet(material, level)
    );
  }
  async stateSTART() {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.o[city as string].stateSTART()
    );
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].stateSTART()
    );
  }
  async statePURCHASE() {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.o[city as string].statePURCHASE()
    );
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].statePURCHASE()
    );
  }
  async statePRODUCTION() {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.o[city as string].statePRODUCTION()
    );
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].statePRODUCTION()
    );
    if (this.indData.makesProducts) {
      if (
        (await Do(this.ns, "ns.corporation.getDivision", this.name)).products
          .length == 3
      ) {
        if (
          99 <
          (
            await Do(
              this.ns,
              "ns.corporation.getProduct",
              this.name,
              "Sector-12",
              (
                await Do(this.ns, "ns.corporation.getDivision", this.name)
              ).products[2]
            )
          ).developmentProgress
        ) {
          await Do(
            this.ns,
            "ns.corporation.discontinueProduct",
            this.name,
            (
              await Do(this.ns, "ns.corporation.getDivision", this.name)
            ).products[0]
          );
        }
      }
      if (this.initialized) {
        if (
          (await Do(this.ns, "ns.corporation.getDivision", this.name)).products
            .length == 0 ||
          99 <
            (
              await Do(
                this.ns,
                "ns.corporation.getProduct",
                this.name,
                "Sector-12",
                (
                  await Do(this.ns, "ns.corporation.getDivision", this.name)
                ).products[
                  (
                    await Do(this.ns, "ns.corporation.getDivision", this.name)
                  ).products.length - 1
                ]
              )
            ).developmentProgress
        ) {
          if (await this.o["Sector-12"].isHappy()) {
            let funds = (await Do(this.ns, "ns.corporation.getCorporation"))
              .funds;
            if ((await this.plunge) && funds > 2000000000) {
              Do(
                this.ns,
                "ns.corporation.makeProduct",
                this.name,
                "Sector-12",
                (
                  await Do(this.ns, "ns.corporation.getCorporation")
                ).funds.toString(),
                Math.floor(funds / 2),
                Math.floor(funds / 2)
              );
            }
          }
        }
      }
    }
  }
  async stateEXPORT() {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.o[city as string].stateEXPORT()
    );
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].stateEXPORT()
    );
  }
  async stateSALE() {
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.o[city as string].stateSALE()
    );
    (Object.values(this.ns.enums.CityName) as string[]).map((city: string) =>
      this.w[city as string].stateSALE()
    );
    this.jobfair();
    this.researchLoop();
  }
  async warehouseLevel(level: number) {
    await Promise.all(
      Object.values(this.w).map((x: Warehouse) => x.warehouseLevel(level))
    );
  }
  async upgradeIt(upgrade: string, level: number) {
    this.c.upgradeIt(upgrade, level);
  }
  get researchPoints() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.corporation.getDivision", this.name))
          .researchPoints;
      } catch (e) {
        return false;
      }
    })();
  }
  async researchLoop() {
    let queue = [["Hi-Tech R&D Laboratory"]];
    if (this.indData.makesProducts) {
      queue.push(["Market-TA.I", "Market-TA.II"]);
    }
    queue.push(["Overclock"]);
    queue.push(["Automatic Drug Administration", "Go-Juice", "AutoBrew"]);
    queue.push(["Sti.mu"]);
    queue.push(["CPH4 Injections"]);
    queue.push(["AutoPartyManager"]);
    if (this.indData.makesProducts) {
      queue.push(["uPgrade: Fulcrum"]);
    }
    queue.push(["Drones", "Drones - Assembly"]);
    queue.push(["Self-Correcting Assemblers"]);
    queue.push(["Drones - Transport"]);
    for (let line of queue) {
      let cost = 0;
      let unknownStuff: string[] = [];
      for (let item of line) {
        if (
          !(await Do(this.ns, "ns.corporation.hasResearched", this.name, item))
        ) {
          unknownStuff.push(item);
          cost += await Do(
            this.ns,
            "ns.corporation.getResearchCost",
            this.name,
            item
          );
        }
      }
      if (cost > 0) {
        if (
          (await Do(this.ns, "ns.corporation.getDivision", this.name))
            .researchPoints >
          cost * 2
        ) {
          unknownStuff.map((x: string) =>
            Do(this.ns, "ns.corporation.rese" + "arch", this.name, x)
          );
        }
        return;
      }
    }
  }
}
