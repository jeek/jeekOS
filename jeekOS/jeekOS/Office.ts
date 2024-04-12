import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";
import { WholeGame } from "jeekOS/WholeGame";
import { Corp } from "jeekOS/Corp";

// Janaszar - https://discord.com/channels/415207508303544321/923445881389338634/965914553479200808
let EMPLOYEERATIOS = {
  Food: 28,
  Tobacco: 9,
  Pharmaceutical: 31,
  Computer: 37,
  Robotics: 30,
  Software: 37,
  Healthcare: 27,
  RealEstate: 0,
};

export class Office {
  name: string;
  type: string;
  city:
    | "Sector-12"
    | "Aevum"
    | "Volhaven"
    | "Chongqing"
    | "New Tokyo"
    | "Ishima";
  ns: NS;
  Game: WholeGame;
  Division: Division;
  initialized: boolean;
  plunge: boolean;
  c: Corp;
  constructor(
    Game: WholeGame,
    name: string,
    city:
      | "Sector-12"
      | "Aevum"
      | "Volhaven"
      | "Chongqing"
      | "New Tokyo"
      | "Ishima",
    MyDivision: Division
  ) {
    this.type = MyDivision.type;
    this.c = MyDivision.c;
    this.name = name;
    this.Game = Game;
    this.ns = Game.ns;
    this.city = city;
    this.Division = MyDivision;
    this.initialized = false;
    this.plunge = false;
    this.start();
  }
  async start() {
    while (
      !(
        await Do(this.ns, "ns.corporation.getDivision", this.Division.name)
      ).cities.includes(this.city)
    ) {
      try {
        if (
          (await Do(this.ns, "ns.corporation.getConstants"))
            .officeInitialCost <=
          (await Do(this.ns, "ns.corporation.getCorporation")).funds
        ) {
          await Do(
            this.ns,
            "ns.corporation.expandCity",
            this.Division.name,
            this.city
          );
        } else {
          await this.ns.asleep(1000);
        }
      } catch {
        await this.ns.asleep(1000);
      }
    }
    this.initialized = true;
  }
  get state(): string {
    return this.c.state;
  }
  async isHappy() {
    return (
      (
        await Do(
          this.ns,
          "ns.corporation.getOffice",
          this.Division.name,
          this.city
        )
      ).avgEnergy > 99 &&
      (
        await Do(
          this.ns,
          "ns.corporation.getOffice",
          this.Division.name,
          this.city
        )
      ).avgMorale > 99
    );
  }
  async getHappy() {
    let happy = false;
    while (!happy) {
      happy = true;
      if (
        (
          await Do(
            this.ns,
            "ns.corporation.getOffice",
            this.Division.name,
            this.city
          )
        ).avgEnergy < 99
      ) {
        happy = false;
      }
      if (
        (
          await Do(
            this.ns,
            "ns.corporation.getOffice",
            this.Division.name,
            this.city
          )
        ).avgMorale < 99
      ) {
        happy = false;
      }
      while (this.state == "START") {
        await this.ns.asleep(0);
      }
      while (this.state != "START") {
        await this.ns.asleep(0);
      }
    }
  }
  //    getOfficeProductivity(divName, city, forProduct = false) {
  //        const opProd = this.calculateEmployeeProductivity(divName, city, Jobs.OPERATIONS)
  //        const engrProd = this.calculateEmployeeProductivity(divName, city, Jobs.ENGINEER)
  //        const mgmtProd = this.calculateEmployeeProductivity(divName, city, Jobs.MANAGEMENT)
  //        const total = opProd + engrProd + mgmtProd;
  //
  //        if (total <= 0) return 0;
  //
  //        // Management is a multiplier for the production from Operations and Engineers
  //        const mgmtFactor = 1 + mgmtProd / (1.2 * total);
  //
  //        // For production, Operations is slightly more important than engineering
  //        // Both Engineering and Operations have diminishing returns
  //        const prod = (Math.pow(opProd, 0.4) + Math.pow(engrProd, 0.3)) * mgmtFactor;

  //        // Generic multiplier for the production. Used for game-balancing purposes
  //        const balancingMult = 0.05;

  //        if (forProduct) {
  //            // Products are harder to create and therefore have less production
  //            return 0.5 * balancingMult * prod;
  //        } else {
  //            return balancingMult * prod;
  //       }
  //   }
  get goalSize() {
    return this.Division.goalSize;
  }
  async jobfair() {
    let JOBS: string[] = [];
    while (
      (
        await Do(
          this.ns,
          "ns.corporation.getOffice",
          this.Division.name,
          this.city
        )
      ).numEmployees <
      (
        await Do(
          this.ns,
          "ns.corporation.getOffice",
          this.Division.name,
          this.city
        )
      ).size
    ) {
      await Do(
        this.ns,
        "ns.corporation.hireEmployee",
        this.Division.name,
        this.city,
        "Unassigned"
      );
    }
    switch (this.Division.type) {
      case "Energy":
      case "Utilities":
      case "Fishing":
      case "Agriculture":
      case "Mining":
      case "Chemical":
        if ((await this.c.currentround()) < 3) {
          JOBS = [
            "Operations",
            "Engineer",
            "Business",
            "Management",
            "Operations",
            "Management",
            "Management",
            "Business",
            "Research & Development",
            "Research & Development",
          ];
        } else {
          JOBS = [
            "Operations",
            "Engineer",
            "Business",
            "Management",
            "Operations",
            "Engineer",
            "Management",
            "Business",
            "Research & Development",
            "Research & Development",
          ];
        }
        break;
      case "Food":
      case "Tobacco":
      case "Pharmaceutical":
      case "Computer":
      case "Robotics":
      case "Software":
      case "Healthcare":
      case "RealEstate":
        if (this.city != "Sector-12") {
          // todo: Big Harry: I go 1/1/1/1 +11, 2/1/3/2 + 22, then 6/3/8/6 + 22, then all into r&d after
          JOBS = ["Operations", "Engineer", "Business", "Management"];
          for (let i = 0; i < 11; i++) {
            JOBS.push("Research & Development");
          }
          JOBS = JOBS.concat([
            "Operations",
            "Business",
            "Management",
            "Business",
          ]);
          for (let i = 0; i < 11; i++) {
            JOBS.push("Research & Development");
          }
          JOBS = JOBS.concat([
            "Operations",
            "Operations",
            "Operations",
            "Operations",
            "Engineer",
            "Engineer",
            "Business",
            "Business",
            "Business",
            "Business",
            "Business",
            "Management",
            "Management",
            "Management",
            "Management",
          ]);
          JOBS = JOBS.concat(["Intern"]);
          if (
            (
              await Do(
                this.ns,
                "ns.corporation.getDivision",
                this.Division.name
              )
            ).cities.includes(this.city)
          ) {
            while (
              JOBS.length <
              (
                await Do(
                  this.ns,
                  "ns.corporation.getOffice",
                  this.Division.name,
                  this.city
                )
              ).size
            ) {
              JOBS.push("Research & Development");
            }
          }
        } else {
          JOBS = ["Operations", "Intern"];
          while (JOBS.length < 204) {
            if (
              JOBS.filter((x) => x == "Engineer").length / JOBS.length <
              EMPLOYEERATIOS[this.Division.type] / 100
            ) {
              JOBS.push("Engineer");
            } else {
              JOBS.push("Management");
            }
          }
        }
        break;
    }
    let office = await Do(
      this.ns,
      "ns.corporation.getOffice",
      this.Division.name,
      this.city
    );
    while (JOBS.length < office.numEmployees) {
      JOBS = JOBS.concat(JOBS);
    }
    JOBS = JOBS.slice(0, office.numEmployees);
    let assignable: any[] = [];
    if (this.rd) {
      assignable = [
        [1, 0, "Operations"],
        [1, 0, "Engineer"],
        [1, 0, "Business"],
        [1, 0, "Intern"],
        [1, 0, "Management"],
        [2, office.numEmployees, "Research & Development"],
      ];
    } else {
      for (let job of [
        "Operations",
        "Engineer",
        "Business",
        "Intern",
        "Management",
        "Research & Development",
      ]) {
        assignable.push([
          JOBS.filter((x) => x == job).length -
            office.employeeJobs[
              job as
                | "Operations"
                | "Engineer"
                | "Business"
                | "Intern"
                | "Management"
                | "Research & Development"
            ],
          JOBS.filter((x) => x == job).length,
          job,
        ]);
      }
    }
    for (let i of assignable
      .sort((a: any, b: any) => {
        return a[0] - b[0];
      })
      .filter((x: any) => x[0] != 0)) {
      await Do(
        this.ns,
        "ns.corporation.setAutoJobAssignment",
        this.Division.name,
        this.city,
        i[2],
        i[1]
      );
    }
    return true;
  }
  get rd() {
    return this.Division.rd;
  }
  async stateSTART() {}
  async statePURCHASE() {}
  async statePRODUCTION() {}
  async stateEXPORT() {}
  async stateSALE() {
    let me = await Do(
      this.ns,
      "ns.corporation.getOffice",
      this.Division.name,
      this.city
    );
    if (me.avgEnergy <= 98) {
      Do(this.ns, "ns.corporation.buyTea", this.Division.name, this.city);
    }
    if (me.avgMorale < 99) {
      Do(
        this.ns,
        "ns.corporation.throwParty",
        this.Division.name,
        this.city,
        500000
      );
    }
    if (me.size < this.goalSize) {
      //            this.ns.tprint("Upgrade Attempt: ", this.Division.name, " ", this.city, " ", await Do(this.ns, "ns.corporation.getOfficeSizeUpgradeCost", this.Division.name, this.city, 1));
      await Do(
        this.ns,
        "ns.corporation.upgradeOfficeSize",
        this.Division.name,
        this.city,
        1
      );
    }
  }
}
