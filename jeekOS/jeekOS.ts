import { NS, Player, Server, ResetInfo } from "@ns";
import { Weather } from "jeekOS/Weather";

let gangMemberNames: string[] = [
  [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Saggitarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ],
  [
    "Rat",
    "Ox",
    "Tiger",
    "Dragon",
    "Rabbit",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
  ],
  [
    "Lion",
    "Hydra",
    "Hind",
    "Boar",
    "Stables",
    "Birds",
    "Bull",
    "Horses",
    "Belt",
    "Cattle",
    "Apples",
    "Cerebrus",
  ],
  [
    "Oral",
    "Anal",
    "Vaginal",
    "Fourthhole",
    "Donkeypunch",
    "Armpit",
    "Ear",
    "Eyesocket",
    "Boobs",
    "Handy",
    "Footy",
    "Nostril",
  ], // additional names provided by infundimueslicybe (mushroom.botherer on Discord)
  [
    "Peter",
    "Andrew",
    "James",
    "John",
    "Philip",
    "Bartholomew",
    "Thomas",
    "Matthew",
    "The Publican",
    "Thaddaeus",
    "Simon",
    "Judas Iscariot",
  ],
][Math.floor(Math.random() * 5)];
let FACTIONS: string[] = [
  "Illuminati",
  "Daedalus",
  "The Covenant",
  "ECorp",
  "MegaCorp",
  "Bachman & Associates",
  "Blade Industries",
  "NWO",
  "Clarke Incorporated",
  "OmniTek Incorporated",
  "Four Sigma",
  "KuaiGong International",
  "Fulcrum Secret Technologies",
  "BitRunners",
  "The Black Hand",
  "NiteSec",
  "Aevum",
  "Chongqing",
  "Ishima",
  "New Tokyo",
  "Sector-12",
  "Volhaven",
  "Speakers for the Dead",
  "The Dark Army",
  "The Syndicate",
  "Silhouette",
  "Tetrads",
  "Slum Snakes",
  "Netburners",
  "Tian Di Hui",
  "CyberSec",
  "Bladeburners",
  "Church of the Machine God",
  "Shadows of Anarchy",
];
let FACTIONS2: any = {
  EARLY: [
    "CyberSec",
    "Tian Di Hui",
    "NiteSec",
    "The Black Hand",
    "BitRunners",
    "Netburners",
  ],
  CITY: ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"],
  CRIME: [
    "Slum Snakes",
    "Tetrads",
    "Speakers for the Dead",
    "The Syndicate",
    "Silhouette",
    "The Dark Army",
  ],
  COMPANIES: [
    "ECorp",
    "MegaCorp",
    "KuaiGong International",
    "Four Sigma",
    "NWO",
    "Blade Industries",
    "OmniTek Incorporated",
    "Bachman & Associates",
    "Clarke Incorporated",
    "Fulcrum Secret Technologies",
  ],
  ENDGAME: ["Daedalus", "Illuminati", "The Covenant"],
  SPECIAL: ["Bladeburners", "Church of the Machine God", "Shadows of Anarchy"],
};
let RESTAURANTS = [
  "Taco Smell",
  "Pizza Slut",
  "Bourgeoisie King",
  "Udder Queen",
  "McDonnell's",
  "Bluto's",
  "Temple's Turkey",
  "Schlut Skis",
  "LAVA",
  "Aurora's",
  "Borderrunner's",
  "Wandering Zax",
  "Dave's",
  "Papa Juan's",
  "Deadpool's",
  "Inflation",
  "Softee's",
];

export function jFormat(number: number, format: string = " ") {
  if (number === null) {
    return "null";
  }
  if (number === 0) {
    return "0.000";
  }
  let sign = number < 0 ? "-" : "";
  if (number < 0) {
    number = -number;
  }
  let exp = Math.floor(Math.log(number) / Math.log(10));
  while (10 ** exp <= number) {
    exp += 3 - (exp % 3);
  }
  exp -= 3;
  while (number >= 1000) {
    number /= 1000;
    if (number > 1e309 || number == Infinity) {
      return "Inf";
    }
    if (number < -1e309 || number == -Infinity) {
      return "-Inf";
    }
  }
  exp = Math.max(exp, 0);
  return (
    (format.toString().includes("$") ? "$" : "") +
    sign +
    number.toFixed(3).toString() +
    (exp < 33
      ? ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n"][
          Math.floor(exp / 3)
        ]
      : "e" + exp.toString())
  );
}

export class Corp {
  Game: WholeGame;
  ns: NS;
  name: string;
  divisions: { [key: string]: Division };
  state: string;
  needsExporty: boolean;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.name = "JeekCo";
    this.divisions = {};
    this.state = "TACO";
    this.needsExporty = false;
    this.start();
  }
  get initialized() {
    return false;
  }
  async assignDivs() {
    let corpData = await Do(this.ns, "ns.corporation.getCorporation");
    for (let div of corpData.divisions) {
      if (!Object.keys(this.divisions).includes(div)) {
        if (
          (await Do(this.ns, "ns.corporation.getDivision", div)).type !=
          "Restaurant"
        ) {
          this.divisions[div] = new Division(
            this,
            div,
            (await Do(this.ns, "ns.corporation.getDivision", div)).type
          );
        }
      }
    }
  }
  async stateLOOP() {
    while (await Do(this.ns, "await ns.corporation.nextUpdate")) {
      this.state = (
        await Do(this.ns, "ns.corporation.getCorporation")
      ).prevState;
      //            this.ns.tprint(this.state);
      switch (this.state) {
        case "START":
          Object.values(this.divisions).map((x: Division) => x.stateSTART());
          break;
        case "PRODUCTION":
          Object.values(this.divisions).map((x: Division) =>
            x.statePRODUCTION()
          );
          break;
        case "SALE":
          Object.values(this.divisions).map((x: Division) => x.stateSALE());
          break;
        case "EXPORT":
          Object.values(this.divisions).map((x: Division) => x.stateEXPORT());
          break;
        case "PURCHASE":
          Object.values(this.divisions).map((x: Division) => x.statePURCHASE());
          if (this.needsExporty) {
            this.needsExporty = false;
            await this.exporty();
          }
          break;
      }
    }
  }
  async currentround() {
    if ((await Do(this.ns, "ns.corporation.getCorporation")).public) {
      return 5;
    }
    return null ===
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round
      ? 1
      : (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round;
  }
  async bribes() {
    while (true) {
      for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
        if (
          !(await Do(this.ns, "ns.gang.inGang")) ||
          (await Do(this.ns, "ns.gang.getGangInformation")).faction != faction
        ) {
          while (
            (await Do(this.ns, "ns.corporation.getCorporation")).funds >
              1000000000 &&
            (await Do(this.ns, "ns.singularity.getFactionFavor", faction)) +
              (await Do(
                this.ns,
                "ns.singularity.getFactionFavorGain",
                faction
              )) <
              (await Do(this.ns, "ns.getFavorToDonate"))
          ) {
            await Do(
              this.ns,
              "ns.corporation.bribe",
              faction,
              Math.max(
                1000000000,
                (await Do(this.ns, "ns.corporation.getCorporation")).funds / 100
              )
            );
          }
          for (let aug of await Do(
            this.ns,
            "ns.singularity.getAugmentationsFromFaction",
            faction
          )) {
            if (
              !(
                await Do(this.ns, "ns.singularity.getOwnedAugmentations", true)
              ).includes(aug)
            ) {
              let price = await Do(
                this.ns,
                "ns.singularity.getAugmentationRepReq",
                aug
              );
              while (
                (await Do(this.ns, "ns.corporation.getCorporation")).funds >
                  1000000000 &&
                (await Do(this.ns, "ns.singularity.getFactionRep", faction)) <
                  price
              ) {
                await Do(
                  this.ns,
                  "ns.corporation.bribe",
                  faction,
                  Math.max(
                    1000000000,
                    (await Do(this.ns, "ns.corporation.getCorporation")).funds /
                      100
                  )
                );
              }
            }
          }
        }
      }
      await this.ns.asleep(60000);
    }
  }
  async start() {
    let divs = Math.floor(
      20 * (await Do(this.ns, "ns.getBitNodeMultipliers")).CorporationDivisions
    );
    while (!(await Do(this.ns, "ns.corporation.hasCorporation"))) {
      if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 3) {
        await Do(this.ns, "ns.corporation.createCorporation", this.name, false);
      } else {
        if (
          !(await Do(this.ns, "ns.corporation.createCorporation", this.name))
        ) {
          await this.ns.asleep(60000);
        }
      }
    }
    this.stateLOOP();
    let corpData: any = await Do(this.ns, "ns.corporation.getCorporation");
    if (corpData.divisions.length == 0) {
      await Do(
        this.ns,
        "ns.corporation.expandIndustry",
        "Agriculture",
        "Farmy"
      );
    }
    await this.assignDivs();
    while (
      !Object.keys(this.divisions).includes("Farmy") ||
      !this.divisions["Farmy"].initialized
    ) {
      await this.ns.asleep(100);
    }
//    this.Game.traveling.assertLocation("New Tokyo");
    while (
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 1 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds <
        431000000000 -
          (await Do(this.ns, "ns.corporation.getCorporation")).funds
    ) {
//      await Do(this.ns, "ns.run", "noodles.js", {preventDuplicates:true});
      while ("START" != (await Do(this.ns, "await ns.corporation.nextUpdate")));
      //            this.ns.tprint(await Do(this.ns, "ns.corporation.getInvestmentOffer"));
    }
    if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 1) {
      await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
    }
    corpData = await Do(this.ns, "ns.corporation.getCorporation");
    if (
      corpData.divisions.length == 1 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 2
    ) {
      await Do(this.ns, "ns.corporation.expandIndustry", "Chemical", "Chemy");
    }
    await this.assignDivs();
    while (
      !Object.keys(this.divisions).includes("Chemy") ||
      !this.divisions["Chemy"].initialized
    ) {
      await this.ns.asleep(100);
    }
    this.needsExporty = true;
    //        while (!this.divisions["Farmy"].ding) {
    //            await this.ns.asleep(100);
    //        }
    //        while (!this.divisions["Chemy"].ding) {
    //            await this.ns.asleep(100);
    //        }
    corpData = await Do(this.ns, "ns.corporation.getCorporation");
    while (
      corpData.divisions.length < divs - 1 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round >= 2
    ) {
      while (
        (await Do(this.ns, "ns.corporation.getCorporation")).funds <
        (await Do(this.ns, "ns.corporation.getIndustryData", "Restaurant"))
          .startingCost
      ) {
        await this.ns.asleep(0);
      }
      this.ns.tprint(
        corpData.divisions.length - 2,
        " ",
        RESTAURANTS[corpData.divisions.length - 2]
      );
      await Do(
        this.ns,
        "ns.corporation.expandIndustry",
        "Restaurant",
        RESTAURANTS[corpData.divisions.length - 2]
      );
      corpData = await Do(this.ns, "ns.corporation.getCorporation");
    }
    while (
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 2 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds <
        27000000000000
    ) {
//      await Do(this.ns, "ns.run", "noodles.js", {preventDuplicates:true});
      while ("START" != (await Do(this.ns, "await ns.corporation.nextUpdate")));
      //            this.ns.tprint(await Do(this.ns, "ns.corporation.getInvestmentOffer"));
    }
    if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 2) {
      await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
    }
    await this.ns.asleep(100);
    corpData = await Do(this.ns, "ns.corporation.getCorporation");
    if (
      corpData.divisions.length == divs - 1 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round > 2
    ) {
      await Do(this.ns, "ns.corporation.expandIndustry", "Tobacco", "Smoky");
    }
    corpData = await Do(this.ns, "ns.corporation.getCorporation");
    await this.assignDivs();
    while (
      !Object.keys(this.divisions).includes("Smoky") ||
      !this.divisions["Smoky"].initialized
    ) {
      await this.ns.asleep(100);
    }
    this.needsExporty = true;
    while (
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 3 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds < 1e16
    ) {
//      await Do(this.ns, "ns.run", "noodles.js", {preventDuplicates:true});
      while ("START" != (await Do(this.ns, "await ns.corporation.nextUpdate")));
      let offer = (await Do(this.ns, "ns.corporation.getInvestmentOffer"))
        .funds;
      //            this.ns.tprint(offer, " ", offer/1e16);
    }
    if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 3) {
      await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
    }
    while (
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 4 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds < 1e16
    ) {
//      await Do(this.ns, "ns.run", "noodles.js", {preventDuplicates:true});
      while ("START" != (await Do(this.ns, "await ns.corporation.nextUpdate")));
      let offer = (await Do(this.ns, "ns.corporation.getInvestmentOffer"))
        .funds;
      //            this.ns.tprint(offer, " ", offer/1e16);
    }
    if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 4) {
      await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
    }
    if (!(await Do(this.ns, "ns.corporation.getCorporation")).public) {
      await Do(
        this.ns,
        "ns.corporation.goPublic",
        (await Do(this.ns, "ns.corporation.getCorporation")).numShares - 1
      );
    }
    this.bribes();
    await Do(this.ns, "ns.corporation.issueDividends", 0.01);
    while (true) {
      if (
        !(await Do(this.ns, "ns.corporation.hasUnlock", "Shady Accounting")) &&
        (await Do(this.ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            this.ns,
            "ns.corporation.getUnlockCost",
            "Shady Accounting"
          ))
      )
        await Do(this.ns, "ns.corporation.purchaseUnlock", "Shady Accounting");
      if (
        !(await Do(
          this.ns,
          "ns.corporation.hasUnlock",
          "Government Partnership"
        )) &&
        (await Do(this.ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            this.ns,
            "ns.corporation.getUnlockCost",
            "Government Partnership"
          ))
      )
        await Do(
          this.ns,
          "ns.corporation.purchaseUnlock",
          "Government Partnership"
        );
      if (
        (await Do(this.ns, "ns.corporation.getCorporation"))
          .issueNewSharesCooldown == 0
      ) {
        Do(this.ns, "ns.corporation.issueNewShares");
      }
      //            this.ns.tprint(await Do(this.ns, "ns.corporation.getInvestmentOffer"));
      await this.ns.asleep(60000);
    }
  }
  async getHappy() {
    await Promise.all(
      Object.values(this.divisions).map((div) => div.getHappy())
    );
  }
  async upgradeIt(upgrade: string, level: number) {
    let z = 0;
    while (
      (await Do(this.ns, "ns.corporation.getUpgradeLevel", upgrade)) < level
    ) {
      if (
        (await Do(this.ns, "ns.corporation.getUpgradeLevelCost", upgrade)) <
        (await Do(this.ns, "ns.corporation.getCorporation")).funds
      ) {
        await Do(this.ns, "ns.corporation.levelUpgrade", upgrade);
      } else {
        await Do(this.ns, "await ns.corporation.nextUpdate");
        z += 1;
      }
    }
  }
  async warehouseLevel(div: string, city: string, amount: number) {
    while (
      (await Do(this.ns, "ns.corporation.getWarehouse", div, city)).level <
      amount
    ) {
      if (await Do(this.ns, "ns.corporation.upgradeWarehouse", div, city, 1)) {
      } else {
        await Do(this.ns, "await ns.corporation.nextUpdate");
      }
    }
  }
  async exporty() {
    if (!(await Do(this.ns, "ns.corporation.hasUnlock", "Export"))) {
      await this.ns.asleep(0);
      if (
        (await Do(this.ns, "ns.corporation.getUnlockCost", "Export")) <
        (await Do(this.ns, "ns.corporation.getCorporation")).funds
      ) {
        await Do(this.ns, "ns.corporation.purchaseUnlock", "Export");
      }
    }
    if (!(await Do(this.ns, "ns.corporation.hasUnlock", "Export"))) {
      this.needsExporty = true;
      return;
    }
    for (let div of (await Do(this.ns, "ns.corporation.getCorporation"))
      .divisions) {
      if (
        Object.keys(
          await Do(
            this.ns,
            "ns.corporation.getIndustryData",
            (
              await Do(this.ns, "ns.corporation.getDivision", div)
            ).type
          )
        ).includes("producedMaterials")
      ) {
        for (let mat of (
          await Do(
            this.ns,
            "ns.corporation.getIndustryData",
            (
              await Do(this.ns, "ns.corporation.getDivision", div)
            ).type
          )
        ).producedMaterials) {
          for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            for (let exports of (
              await Do(this.ns, "ns.corporation.getMaterial", div, city, mat)
            ).exports) {
              await Do(
                this.ns,
                "ns.corporation.cancelExportMaterial",
                div,
                city,
                exports.division,
                exports.city,
                mat,
                exports.amount
              );
            }
          }
        }
      }
    }
    for (let div1 of (await Do(this.ns, "ns.corporation.getCorporation"))
      .divisions) {
      if (
        Object.keys(
          await Do(
            this.ns,
            "ns.corporation.getIndustryData",
            (
              await Do(this.ns, "ns.corporation.getDivision", div1)
            ).type
          )
        ).includes("producedMaterials")
      ) {
        for (let mat1 of (
          await Do(
            this.ns,
            "ns.corporation.getIndustryData",
            (
              await Do(this.ns, "ns.corporation.getDivision", div1)
            ).type
          )
        ).producedMaterials) {
          for (let div2 of (await Do(this.ns, "ns.corporation.getCorporation"))
            .divisions) {
            for (let mat2 of Object.keys(
              (
                await Do(
                  this.ns,
                  "ns.corporation.getIndustryData",
                  (
                    await Do(this.ns, "ns.corporation.getDivision", div2)
                  ).type
                )
              ).requiredMaterials
            )) {
              if (
                mat1 === mat2 &&
                div1 != div2 &&
                (await Do(this.ns, "ns.corporation.getDivision", div1)).type !=
                  "Restaurant" &&
                (await Do(this.ns, "ns.corporation.getDivision", div2)).type !=
                  "Restaurant"
              ) {
                for (let city of Object.values(
                  this.ns.enums.CityName
                ) as string[]) {
                  if (
                    (await Do(
                      this.ns,
                      "ns.corporation.hasWarehouse",
                      div1,
                      city
                    )) &&
                    (await Do(
                      this.ns,
                      "ns.corporation.hasWarehouse",
                      div2,
                      city
                    ))
                  ) {
                    Do(
                      this.ns,
                      "ns.corporation.exportMaterial",
                      div1,
                      city,
                      div2,
                      city,
                      mat1,
                      "-IPROD-(IINV/10)"
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export async function agriculture(divObj: Division) {
  let ns = divObj.ns;
  let div = divObj.name;
  while (!divObj.initialized) {
    await divObj.ns.asleep(0);
  }
  await divObj.warehouseLevel(6);
  divObj.goalSize = Math.max(divObj.goalSize, 3);
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    for (let mat of divObj.indData.producedMaterials) {
      Do(ns, "ns.corporation.sellMaterial", div, city, mat, "MAX", "MP");
    }
  }
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 3
    ) {
      while (divObj.c.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.c.state != "START") {
        await divObj.ns.asleep(0);
      }
    }
  }
  while ((await Do(ns, "ns.corporation.getHireAdVertCount", div)) < 2) {
    if (await Do(ns, "ns.corporation.hireAdVert", div)) {
      await divObj.ns.asleep(0);
    } else {
      while (divObj.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.state != "START") {
        await divObj.ns.asleep(0);
      }
    }
  }
  await divObj.upgradeIt("Smart Storage", 9);
  divObj.rd = true;
  while (
    (await Do(ns, "ns.corporation.getDivision", div)).researchPoints < 30
  ) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  if (
    (await Do(ns, "ns.corporation.getInvestmentOffer")).round == 1 ||
    (
      await Do(
        ns,
        "ns.corporation.getMaterial",
        divObj.name,
        "Sector-12",
        "AI Cores"
      )
    ).stored < 1109
  ) {
    divObj.WarehouseSet("AI Cores", 2114);
    divObj.WarehouseSet("Hardware", 2404);
    divObj.WarehouseSet("Real Estate", 124904);
    divObj.WarehouseSet("Robots", 24);
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.warehouseLevel(10);
  if ((await Do(ns, "ns.corporation.getCorporation")).funds > 0) {
    await divObj.getHappy();
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.goalSize = Math.max(divObj.goalSize, 6);
  divObj.upgradeIt("Smart Storage", 17);
  divObj.upgradeIt("Smart Factories", 9);
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 6
    ) {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = true;
  while ((await divObj.researchPoints) < 245) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  while (
    Object.keys(
      (await Do(divObj.ns, "ns.corporation.getCorporation")).divisions
    ).length < 19
  ) {
    await divObj.ns.asleep(0);
  }
  if ((await Do(ns, "ns.corporation.getInvestmentOffer")).round >= 1) {
    divObj.WarehouseSet("AI Cores", 4419);
    divObj.WarehouseSet("Hardware", 4966);
    divObj.WarehouseSet("Real Estate", 235632);
    divObj.WarehouseSet("Robots", 484);
  }
  divObj.ding = true;
  while ((await divObj.c.currentround()) < 3) {
    await divObj.ns.asleep(0);
  }
  await divObj.warehouseLevel(15);
  await Promise.all([
    divObj.upgradeIt("Smart Storage", 25),
    divObj.upgradeIt("Smart Factories", 16),
  ]);
  await divObj.getHappy();
  divObj.goalSize = 9;
  while (
    !(await Do(divObj.ns, "ns.corporation.getCorporation")).divisions.includes(
      "Smoky"
    )
  ) {
    await divObj.ns.asleep(100);
  }
  while (
    (await Do(divObj.ns, "ns.corporation.getDivision", "Smoky")).products
      .length < 2
  ) {
    await divObj.ns.asleep(100);
  }
  ["Sector-12", "Ishima", "New Tokyo", "Volhaven", "Chongqing", "Aevum"].map(
    (x: string) =>
      Do(
        divObj.ns,
        "ns.corporation.limitMaterialProduction",
        "Farmy",
        x,
        "Food",
        0
      )
  );
}

export async function chemical(divObj: Division) {
  let ns = divObj.ns;
  let div = divObj.name;
  while (!divObj.initialized) {
    await divObj.ns.asleep(0);
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  let divData: any = await Do(ns, "ns.corporation.getDivision", div);
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 3
    ) {
      while (divObj.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.state != "START") {
        await divObj.ns.asleep(0);
      }
      await Do(
        ns,
        "ns.corporation.hireEmployee",
        div,
        city,
        "Research & Development"
      );
    }
    divObj.rd = true;
  }
  await divObj.upgradeIt("Smart Storage", 15);
  await divObj.upgradeIt("Smart Factories", 9);
  await divObj.getHappy();
  while (
    (await Do(divObj.ns, "ns.corporation.getDivision", div)).researchPoints <
    150
  ) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  let divs = Math.floor(
    20 * (await Do(divObj.ns, "ns.getBitNodeMultipliers")).CorporationDivisions
  );
  while (
    Object.keys(
      (await Do(divObj.ns, "ns.corporation.getCorporation")).divisions
    ).length <
    divs - 1
  ) {
    await divObj.ns.asleep(0);
  }
  if ((await Do(ns, "ns.corporation.getInvestmentOffer")).round >= 2) {
    divObj.WarehouseSet("AI Cores", 543);
    divObj.WarehouseSet("Hardware", 1238);
    divObj.WarehouseSet("Real Estate", 25577);
    divObj.WarehouseSet("Robots", 0);
  }
  divObj.ding = true;
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    divObj.warehouseLevel(3);
  }
  while ((await divObj.c.currentround()) < 3) {
    await divObj.ns.asleep(0);
  }
  divObj.goalSize = 9;
  while (!(await Do(ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
    if (
      (await Do(ns, "ns.corporation.getUnlockCost", "Smart Supply")) <
      (await Do(ns, "ns.corporation.getCorporation")).funds
    ) {
      await Do(ns, "ns.corporation.purchaseUnlock", "Smart Supply");
    }
  }
}

export async function tobacco(div: Division) {
  let ns = div.ns;
  while (!div.initialized) {
    await ns.asleep(0);
  }
  //    while (!div.c.divisions["Farmy"].ding || !div.c.divisions["Chemy"].ding) {
  //        await ns.asleep(1000);
  //    }
  div.ding = true;
  while (
    (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12"))
      .numEmployees < 45 &&
    (await Do(ns, "ns.corporation.getCorporation")).funds >
      (await Do(
        ns,
        "ns.corporation.getOfficeSizeUpgradeCost",
        div.name,
        "Sector-12",
        15
      ))
  ) {
    if (
      (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size <
      45
    ) {
      await Do(
        ns,
        "ns.corporation.upgradeOfficeSize",
        div.name,
        "Sector-12",
        3
      );
    }
    await Do(
      ns,
      "ns.corporation.hireEmployee",
      div.name,
      "Sector-12",
      "Research & Development"
    );
    await ns.asleep(0);
  }
  while (
    (await Do(ns, "ns.corporation.getDivision", div.name)).products.length == 0
  ) {
    if ((await Do(ns, "ns.corporation.getCorporation")).funds < 2000000000) {
      await ns.asleep(0);
    } else {
      await Do(
        ns,
        "ns.corporation.makeProduct",
        div.name,
        "Sector-12",
        "Tobaccy!",
        1e9,
        1e9
      );
      await ns.asleep(100);
    }
  }
  while (
    (await Do(ns, "ns.corporation.getUpgradeLevelCost", "Wilson Analytics")) <=
      (await Do(ns, "ns.corporation.getCorporation")).funds &&
    ((await Do(ns, "ns.corporation.getDivision", div.name)).products.length >
      1 ||
      (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics")) < 10)
  ) {
    await Do(ns, "ns.corporation.levelUpgrade", "Wilson Analytics");
    await ns.asleep(0);
  }
  while (
    (await Do(ns, "ns.corporation.getCorporation")).funds >
    (await Do(
      ns,
      "ns.corporation.getOfficeSizeUpgradeCost",
      div.name,
      "Sector-12",
      15
    ))
  ) {
    await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, "Sector-12", 15);
  }
  let smallCity = true;
  while (smallCity) {
    smallCity = false;
    for (let city of [
      "Sector-12",
      "Aevum",
      "Volhaven",
      "Chongqing",
      "New Tokyo",
      "Ishima",
    ]) {
      if (
        (await Do(ns, "ns.corporation.getOffice", div.name, city)).size + 30 <
        (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size
      ) {
        if (
          (await Do(ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            ns,
            "ns.corporation.getOfficeSizeUpgradeCost",
            div.name,
            city,
            1
          ))
        ) {
          await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, city, 3);
          smallCity = true;
        }
      }
    }
  }
  while (true) {
    while (div.c.state == "START") {
      await ns.asleep(0);
    }
    while (div.c.state != "START") {
      await ns.asleep(0);
    }
    let didsomething = false;
    let warehouse = true;
    while (
      (await Do(
        ns,
        "ns.corporation.getUpgradeLevelCost",
        "Wilson Analytics"
      )) <= (await Do(ns, "ns.corporation.getCorporation")).funds &&
      ((await Do(ns, "ns.corporation.getDivision", div.name)).products.length >
        0 ||
        (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics")) <
          10)
    ) {
      await Do(ns, "ns.corporation.levelUpgrade", "Wilson Analytics");
      didsomething = true;
      await ns.asleep(0);
    }
    while (
      (await Do(ns, "ns.corporation.getCorporation")).funds >
      Math.min(
        await Do(ns, "ns.corporation.getHireAdVertCost", div.name),
        await Do(
          ns,
          "ns.corporation.getOfficeSizeUpgradeCost",
          div.name,
          "Sector-12",
          15
        )
      )
    ) {
      if (
        (await Do(ns, "ns.corporation.getHireAdVertCost", div.name)) <
        (await Do(
          ns,
          "ns.corporation.getOfficeSizeUpgradeCost",
          div.name,
          "Sector-12",
          15
        ))
      ) {
        await Do(ns, "ns.corporation.hireAdVert", div.name);
      } else {
        if (
          (await Do(ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            ns,
            "ns.corporation.getOfficeSizeUpgradeCost",
            div.name,
            "Sector-12",
            15
          ))
        ) {
          await Do(
            ns,
            "ns.corporation.upgradeOfficeSize",
            div.name,
            "Sector-12",
            15
          );
        }
      }
    }
    let smallCity = true;
    while (smallCity) {
      smallCity = false;
      for (let city of [
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
      ]) {
        if (
          (await Do(ns, "ns.corporation.getOffice", div.name, city)).size + 30 <
          (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size
        ) {
          if (
            (await Do(ns, "ns.corporation.getCorporation")).funds >
            (await Do(
              ns,
              "ns.corporation.getOfficeSizeUpgradeCost",
              div.name,
              city,
              1
            ))
          ) {
            await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, city, 3);
            smallCity = true;
          }
        }
      }
    }
    while (
      (await Do(ns, "ns.corporation.getUpgradeLevelCost", "Project Insight")) <=
        (await Do(ns, "ns.corporation.getCorporation")).funds &&
      (await Do(ns, "ns.corporation.getUpgradeLevel", "Project Insight")) <
        10 *
          (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics"))
    ) {
      await Do(ns, "ns.corporation.levelUpgrade", "Project Insight");
      //            ns.tprint("Project Insight", ": ", await Do(ns, "ns.corporation.getUpgradeLevel", "Project Insight"));
    }
    let di = await Do(div.ns, "ns.corporation.getDivision", div.name);
    //        div.ns.tprint((await Do(div.ns, "ns.corporation.getProduct", div.name, "Sector-12", di.products[di.products.length - 1])).developmentProgress);
    let upgraded =
      99 >
      (
        await Do(
          div.ns,
          "ns.corporation.getProduct",
          div.name,
          "Sector-12",
          di.products[di.products.length - 1]
        )
      ).developmentProgress;
    while (upgraded) {
      upgraded = false;
      for (let upgrade of [
        "FocusWires",
        "Neural Accelerators",
        "Speech Processor Implants",
        "Nuoptimal Nootropic Injector Implants",
        "Project Insight",
        "Smart Factories",
        "Smart Storage",
        "ABC SalesBots",
      ]) {
        if (
          (await Do(ns, "ns.corporation.getUpgradeLevel", upgrade)) <
            [0, 2, 20, 100, 150, 200][await div.c.currentround()] &&
          (await Do(ns, "ns.corporation.getUpgradeLevelCost", upgrade)) <=
            (await Do(ns, "ns.corporation.getCorporation")).funds
        ) {
          await Do(ns, "ns.corporation.levelUpgrade", upgrade);
          //                    ns.tprint(upgrade, ": ", await Do(ns, "ns.corporation.getUpgradeLevel", upgrade));
          upgraded = true;
        }
      }
    }
    ["Sector-12", "Aevum", "Volhaven", "Chongqing", "Ishima", "New Tokyo"].map(
      (x: string) => (div.o[x].plunge = true)
    );
    ["Sector-12", "Aevum", "Volhaven", "Chongqing", "Ishima", "New Tokyo"].map(
      (x: string) => (div.w[x].plunge = true)
    );
  }
}

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
        3
      );
    }
  }
}

export class Warehouse {
  name: string;
  type: string;
  city: string;
  ns: NS;
  Game: WholeGame;
  Division: Division;
  initialized: boolean;
  plunge: boolean;
  goalSize: Number;
  goalLevel: Number;
  c: Corp;
  prices: { [key: string]: number[] };
  phase: { [key: string]: number };
  constructor(
    Game: WholeGame,
    name: string,
    city: string,
    MyDivision: Division
  ) {
    this.name = name;
    this.type = MyDivision.type;
    this.c = MyDivision.c;
    this.Game = Game;
    this.ns = Game.ns;
    this.city = city;
    this.Division = MyDivision;
    this.initialized = false;
    this.plunge = false;
    this.goalSize = 0;
    this.goalLevel = 0;
    this.phase = {};
    this.prices = {};
    this.start();
  }
  get state(): string {
    return this.c.state;
  }
  async start() {
    //        this.ns.tprint("Warehouse start: ", this.city);
    while (
      !(
        await Do(this.ns, "ns.corporation.getDivision", this.Division.name)
      ).cities.includes(this.city)
    ) {
      try {
        await this.ns.asleep(0);
      } catch {
        await this.ns.asleep(1000);
      }
    }
    while (
      !(await Do(
        this.ns,
        "ns.corporation.hasWarehouse",
        this.Division.name,
        this.city
      ))
    ) {
      try {
        if (
          (await Do(this.ns, "ns.corporation.getConstants"))
            .warehouseInitialCost <=
          (await Do(this.ns, "ns.corporation.getCorporation")).funds
        ) {
          await Do(
            this.ns,
            "ns.corporation.purchaseWarehouse",
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
    this.smartSupply();
    while (this.Division.indData == null) {
      await this.ns.asleep(0);
    }
    if (this.Division.indData.makesMaterials) {
      for (let mat of this.Division.indData.producedMaterials) {
        Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.Division.name,
          this.city,
          mat,
          "MAX",
          "MP"
        );
      }
    }
    this.initialized = true;
  }
  async warehouseLevel(level: number) {
    while (
      level >
      (
        await Do(
          this.ns,
          "ns.corporation.getWarehouse",
          this.Division.name,
          this.city
        )
      ).level
    ) {
      try {
        await Do(
          this.ns,
          "ns.corporation.upgradeWarehouse",
          this.Division.name,
          this.city,
          1
        );
      } catch {}
      await this.ns.asleep(0);
    }
  }
  // based on SomeoneCrazy2's https://discord.com/channels/415207508303544321/923445881389338634/1180942656239583312
  async smartSupply() {
    let full = 1;
    while (!(await Do(this.ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
      let industryData = this.Division.indData;
      let divisionData = await Do(
        this.ns,
        "ns.corporation.getDivision",
        this.name
      );
      let productionMultScalar = divisionData.productionMult / 50;
      let requiredMaterials = industryData.requiredMaterials;
      for (let material of Object.keys(requiredMaterials)) {
        let materialData = await Do(
          this.ns,
          "ns.corporation.getMaterial",
          this.name,
          this.city,
          material
        );
        let materialProduction = -materialData.productionAmount;
        let materialImports = -materialData.exports;
        let materialStored = materialData.stored;

        let purchaseAmount =
          materialProduction - materialImports / 10 - materialStored / 10;

        let minimalMaterialBeingUsed = materialProduction < 10;
        let minimalMaterialStored = materialStored <= 5;

        if (minimalMaterialBeingUsed && minimalMaterialStored) {
          purchaseAmount =
            materialProduction -
            materialImports / 10 -
            materialStored / 10 +
            productionMultScalar * 5;
        } else {
          if (materialStored >= Math.abs(11 * materialProduction)) {
            purchaseAmount =
              materialProduction - materialImports / 10 - materialStored / 10;
          } else {
            purchaseAmount =
              materialProduction * 1.2 -
              materialImports / 10 -
              materialStored / 10 +
              productionMultScalar;
          }
        }
        if (purchaseAmount >= 0) {
          await Do(
            this.ns,
            "ns.corporation.buyMaterial",
            this.name,
            this.city,
            material,
            purchaseAmount * full
          );
        } else {
          await Do(
            this.ns,
            "ns.corporation.buyMaterial",
            this.name,
            this.city,
            material,
            0
          );
        }
      }
      while (this.state == "START") {
        await this.ns.asleep(0);
      }
      while (this.state != "PRODUCTION") {
        await this.ns.asleep(0);
      }
      let wh = await Do(
        this.ns,
        "ns.corporation.getWarehouse",
        this.name,
        this.city
      );
      if (wh.sizeUsed + 1 > wh.size) {
        full *= 0.99;
      } else {
        full /= 0.99;
        full = Math.min(full, 1);
      }
      while (this.state == "PRODUCTION") {
        await this.ns.asleep(0);
      }
      while (this.state != "START") {
        await this.ns.asleep(0);
      }
    }
    await Do(
      this.ns,
      "ns.corporation.setSmartSupply",
      this.name,
      this.city,
      true
    );
  }
  async WarehouseSet(material: string, amount: number) {
    let data: any = await Do(
      this.ns,
      "ns.corporation.getMaterial",
      this.name,
      this.city,
      material
    );
    let done = false;
    while (!done) {
      done = true;
      data = await Do(
        this.ns,
        "ns.corporation.getMaterial",
        this.name,
        this.city,
        material
      );
      if (data.stored < amount) {
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          Math.abs(data.stored - amount) / 10.0
        );
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          0,
          0
        );
        while (this.state == "START") {
          await this.ns.asleep(0);
        }
        while (this.state != "START") {
          await this.ns.asleep(0);
        }
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          0
        );
        done = false;
      }
      if (data.stored > amount) {
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          0
        );
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          Math.abs(amount - data.stored) / 10.0,
          0
        );
        while (this.state == "START") {
          await this.ns.asleep(0);
        }
        while (this.state != "START") {
          await this.ns.asleep(0);
        }
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          0,
          0
        );
        done = false;
      }
    }
  }

  async stateSTART() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async statePURCHASE() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async statePRODUCTION() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async stateEXPORT() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async stateSALE() {
    if (
      await Do(
        this.ns,
        "ns.corporation.hasResearched",
        this.name,
        "Market-TA.II"
      )
    ) {
      for (let product of (
        await Do(this.ns, "ns.corporation.getDivision", this.name)
      ).products) {
        await Do(
          this.ns,
          "ns.corporation.sellProduct",
          this.name,
          this.city,
          product,
          "MAX",
          "0",
          true
        );
        Do(
          this.ns,
          "ns.corporation.setProductMarketTA2",
          this.name,
          product,
          true
        );
      }
    } else {
      for (let product of (
        await Do(this.ns, "ns.corporation.getDivision", this.name)
      ).products) {
        let me = await Do(
          this.ns,
          "ns.corporation.getProduct",
          this.name,
          this.city,
          product
        );
        if (me.developmentProgress > 99) {
          if (!Object.keys(this.phase).includes(product)) {
            this.prices[product] = [1, 1];
            this.phase[product] = 1;
            await Do(
              this.ns,
              "ns.corporation.sellProduct",
              this.name,
              this.city,
              product,
              "MAX",
              "MP",
              true
            );
          }
        }
      }
      for (let product of Object.keys(this.phase)) {
        if (
          !(
            await Do(this.ns, "ns.corporation.getDivision", this.name)
          ).products.includes(product)
        ) {
          delete this.phase[product];
        } else {
          let me = await Do(
            this.ns,
            "ns.corporation.getProduct",
            this.name,
            this.city,
            product
          );
          if (me.developmentProgress > 99) {
            if (me.actualSellAmount < me.productionAmount) {
              if (this.phase[product] == 1) {
                this.phase[product] = 2;
              }
              if (this.phase[product] == 2) {
                this.prices[product][1] =
                  (this.prices[product][1] +
                    (this.prices[product][0] + this.prices[product][1]) / 2) /
                  2;
                if (this.prices[product][0] + 1 > this.prices[product][1]) {
                  this.phase[product] = 3;
                }
              }
              if (this.phase[product] == 3) {
                this.prices[product][0] = Math.max(
                  1,
                  this.prices[product][0] - 1
                );
                this.prices[product][1] = Math.max(
                  1,
                  this.prices[product][1] - 1
                );
              }
            } else {
              if (this.phase[product] == 1) {
                this.prices[product][1] *= 2;
              }
              if (this.phase[product] == 2) {
                this.prices[product][0] =
                  (this.prices[product][0] +
                    (this.prices[product][0] + this.prices[product][1]) / 2) /
                  2;
                if (this.prices[product][0] + 1 > this.prices[product][1]) {
                  this.phase[product] = 3;
                }
              }
              if (this.phase[product] == 3) {
                this.prices[product][0] = Math.max(
                  1,
                  this.prices[product][0] + 1
                );
                this.prices[product][1] = Math.max(
                  1,
                  this.prices[product][1] + 1
                );
              }
            }
            await Do(
              this.ns,
              "ns.corporation.sellProduct",
              this.name,
              this.city,
              product,
              "MAX",
              (
                (this.prices[product][0] + this.prices[product][1]) /
                2
              ).toString() + "*MP",
              false
            );
          }
        }
      }
      let x = await Do(
        this.ns,
        "ns.corporation.getWarehouse",
        this.name,
        this.city
      );
      if (x.sizeUsed + 1 > x.size) {
        await Do(
          this.ns,
          "ns.corporation.upgradeWarehouse",
          this.name,
          this.city
        );
      }
    }
    if (this.Division.indData.makesMaterials) {
      for (let material of this.Division.indData.producedMaterials) {
        let matData = await Do(
          this.ns,
          "ns.corporation.getMaterial",
          this.name,
          this.city,
          material
        );
        if (
          matData.stored + matData.actualSellAmount < 0.001 &&
          matData.productionAmount > 10
        ) {
          await Do(
            this.ns,
            "ns.corporation.upgradeOfficeSize",
            this.name,
            this.city,
            3
          );
        }
      }
    }
  }
}

export class Checkout {
  Game: WholeGame;
  ns: NS;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.installLoop();
    this.buyLoop();
    this.gangLoop();
  }
  async gangLoop() {
    if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode != 2) {
      return;
    }
    let favorToDonate = 150;

    while (true) {
      if (
        (await Do(this.ns, "ns.getPlayer"))!.money > 1e9 &&
        (await Do(this.ns, "ns.singularity.getFactionFavor", "CyberSec"))! >=
          favorToDonate &&
        (await Do(this.ns, "ns.singularity.getFactionRep", "CyberSec"))! <
          (await Do(
            this.ns,
            "ns.singularity.getAugmentationRepReq",
            "NeuroFlux Governor"
          ))!
      ) {
        await Do(this.ns, "ns.singularity.donateToFaction", "CyberSec", 1e9);
      } else {
        if (
          await Do(
            this.ns,
            "ns.singularity.purchaseAugmentation",
            "CyberSec",
            "NeuroFlux Governor"
          )
        ) {
        } else {
          await this.ns.asleep(10000);
        }
      }
      await this.ns.asleep(0);
    }
  }
  async installLoop() {
    if (
      (await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2 &&
      (await Do(this.ns, "ns.gang.inGang"))
    ) {
      while (true) {
        await Do(this.ns, "ns.singularity.installAugmentations", "jeekOS.js");
        await this.ns.asleep(60000);
      }
    }
    let favorToDonate = 150;
    let multy = 1;

    while (
      (await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!
        .length +
        (12 -
          Math.ceil(
            (Date.now() - (await Do(this.ns, "ns.getResetInfo")).lastAugReset) /
              60 /
              60 /
              1000
          )) >=
        (await Do(this.ns, "ns.singularity.getOwnedAugmentations", true))!
          .length &&
      ((await Do(this.ns, "ns.singularity.getCurrentWork"))! == null ||
        (await Do(this.ns, "ns.singularity.getCurrentWork"))!.type !=
          "FACTION" ||
        ((await Do(this.ns, "ns.singularity.getCurrentWork"))!.type ==
          "FACTION" &&
          ((await Do(
            this.ns,
            "ns.singularity.getFactionFavor",
            (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName
          )) >= favorToDonate ||
            ((await Do(
              this.ns,
              "ns.singularity.getFactionFavor",
              (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName
            )) < favorToDonate &&
              (await Do(
                this.ns,
                "ns.singularity.getFactionFavor",
                (await Do(this.ns, "ns.singularity.getCurrentWork"))!
                  .factionName
              )) +
                (await Do(
                  this.ns,
                  "ns.singularity.getFactionFavorGain",
                  (await Do(this.ns, "ns.singularity.getCurrentWork"))!
                    .factionName
                )) <
                favorToDonate))))
    ) {
      await this.ns.asleep(60000);
    }
    let augList = await this.Game.augmentations.augList();
    augList = augList.sort((a: any, b: any) => {
      return -a[3] + b[3];
    });
    let i = 0;
    while (i < augList.length) {
      if (
        await Do(
          this.ns,
          "ns.singularity.purchaseAugmentation",
          augList[i][1],
          augList[i][2]
        )
      ) {
        augList = augList.filter((x: any) => x[2] != augList[i][2]);
        i = -1;
      }
      i += 1;
    }
    for (let faction of (await Do(this.ns, "ns.getPlayer"))!.factions) {
      this.ns.tprint(faction);
      await this.ns.asleep(0);
      let startTime = Math.floor(Date.now());
      while (
        (await Do(this.ns, "ns.getPlayer"))!.money >
          Math.max(1e9 * multy, 10 ** ((1 + Date.now() - startTime) / 1000)) &&
        (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >=
          favorToDonate &&
        (await Do(this.ns, "ns.singularity.getFactionRep", faction))! <
          (await Do(
            this.ns,
            "ns.singularity.getAugmentationRepReq",
            "NeuroFlux Governor"
          ))!
      ) {
        multy *= 1.001;
        await Do(
          this.ns,
          "ns.singularity.donateToFaction",
          faction,
          Math.max(1e9 * multy, Math.floor(10 ** ((1 + Date.now() - startTime) / 1000)))
        );
      }
      let z = Math.max(
        1e9,
        Math.floor(10 ** ((1 + Date.now() - startTime) / 1000))
      );
      while (z > 1e9 * multy) {
        z = Math.floor(z / 10) + 1;
        while (
          (await Do(this.ns, "ns.getPlayer"))!.money > Math.max(1e9 * multy, z) &&
          (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >=
            favorToDonate &&
          (await Do(this.ns, "ns.singularity.getFactionRep", faction))! <
            (await Do(
              this.ns,
              "ns.singularity.getAugmentationRepReq",
              "NeuroFlux Governor"
            ))!
        ) {
          await Do(
            this.ns,
            "ns.singularity.donateToFaction",
            faction,
            Math.max(1e9 * multy, z)
          );
          multy *= 1.0001;
        }
      }
      while (
        (await Do(this.ns, "ns.getPlayer"))!.money > 1e9 * multy &&
        (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >=
          favorToDonate &&
        (await Do(this.ns, "ns.singularity.getFactionRep", faction))! <
          (await Do(
            this.ns,
            "ns.singularity.getAugmentationRepReq",
            "NeuroFlux Governor"
          ))!
      ) {
        await Do(this.ns, "ns.singularity.donateToFaction", faction, 1e9 * multy);
        multy *= 1.001;
      }
      while (
        await Do(
          this.ns,
          "ns.singularity.purchaseAugmentation",
          faction,
          "NeuroFlux Governor"
        )
      ) {
        await this.ns.asleep(0);
      }
    }
    let finalLoop: any[] = [];
    for (let faction of (await Do(this.ns, "ns.getPlayer"))!.factions) {
      for (let aug of await Do(
        this.ns,
        "ns.singularity.getAugmentationsFromFaction",
        faction
      )) {
        finalLoop = finalLoop.concat([
          [
            faction,
            aug,
            await Do(this.ns, "ns.singularity.getAugmentationPrice", aug),
          ],
        ]);
      }
    }
    finalLoop = finalLoop.sort((a: any, b: any) => {
      return -a[2] + b[2];
    });
    i = 0;
    while (i < finalLoop.length) {
      if (
        await Do(
          this.ns,
          "ns.singularity.purchaseAugmentation",
          finalLoop[i][0],
          finalLoop[i][1]
        )
      ) {
        i = -1;
      }
      i += 1;
    }
    if (await Do(this.ns, "ns.gang.inGang")) {
      let members = await Do(this.ns, "ns.gang.getMemberNames");
      let gear = await Do(this.ns, "ns.gang.getEquipmentNames");
      await Promise.all(
        members
          .map((x: string) =>
            gear.map((y: string) =>
              Do(this.ns, "ns.gang.purchaseEquipment", x, y)
            )
          )
          .flat()
      );
    }
    await Do(this.ns, "ns.singularity.installAugmentations", "jeekOS.js");
    this.ns.tprint("installed?");
    await Do(this.ns, "ns.singularity.softReset", "jeekOS.js");
  }
  async buyLoop() {
    while (true) {
      let augList = await this.Game.augmentations.augList();
      if (augList.length == 0) {
        let i = 0;
        while (i < augList.length) {
          let prereqs = await Do(
            this.ns,
            "ns.singularity.getAugmentationPrereq",
            augList[i][2]
          );
          let good = true;
          let j = 0;
          let alreadyOwned = (await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            true
          ))!;
          while (j < prereqs.length) {
            if (!alreadyOwned.includes(prereqs[j])) {
              good = false;
            }
            j += 1;
          }
          if (!good) {
            augList.splice(i, 1);
          } else {
            i += 1;
          }
        }
        augList = augList.filter((x: any) => x[1] == augList[0][1]);
        augList = augList.sort((a: any, b: any) => {
          return -a[3] + b[3];
        });
        let element =
          14 -
          Math.ceil(
            (Date.now() - (await Do(this.ns, "ns.getResetInfo")).lastAugReset) /
              60 /
              60 /
              1000
          );
        while (element + 1 > augList.length) {
          element -= 1;
        }
        if (element >= 0) {
          let record: any = augList[element];
          let faction = record[1];
          let aug = record[2];
          while (
            (await Do(this.ns, "ns.getPlayer"))!.factions.includes(faction) &&
            (await Do(this.ns, "ns.getPlayer"))!.money > 1e9 &&
            (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >=
              150 &&
            (await Do(this.ns, "ns.singularity.getFactionRep", faction))! <
              (await Do(
                this.ns,
                "ns.singularity.getAugmentationRepReq",
                aug
              ))! &&
            (await Do(this.ns, "ns.singularity.donateToFaction", faction, 1e9))
          ) {}
          if (
            await Do(
              this.ns,
              "ns.singularity.purchaseAugmentation",
              faction,
              aug
            )
          ) {
          } else {
            await this.ns.asleep(60000);
          }
        } else {
          await this.ns.asleep(60000);
        }
        await this.ns.asleep(0);
      } else {
        if (
          (await Do(this.ns, "ns.getPlayer"))!.money > 1e9 &&
          (await Do(this.ns, "ns.singularity.getFactionFavor", "CyberSec"))! >=
            150 &&
          (await Do(this.ns, "ns.singularity.getFactionRep", "CyberSec"))! <
            (await Do(
              this.ns,
              "ns.singularity.getAugmentationRepReq",
              "NeuroFlux Governor"
            ))!
        ) {
          await Do(this.ns, "ns.singularity.donateToFaction", "CyberSec", 1e9);
        }
        if (
          Date.now() - (await Do(this.ns, "ns.getResetInfo")).lastAugReset >
          6 * 3600000
        ) {
          await Do(
            this.ns,
            "ns.singularity.purchaseAugmentation",
            "CyberSec",
            "NeuroFlux Governor"
          );
        }
        await this.ns.asleep(0);
      }
    }
  }
}

let workerCode = `
function minpathsum(data) {
	while (data.length > 1) {
		for (let i = 0; i < (data[data.length - 2]).length; i++) {
			data[data.length - 2][i] += Math.min(data[data.length - 1][i], Math.min(data[data.length - 1][i + 1]));
		}
		data.pop();
	}
	return data[0][0];
}

function uniquepathsI(data) {
	let numbers = []
	for (let i = 0; i < data[0]; i++) {
		numbers.push([]);
		for (let j = 0; j < data[1]; j++) {
			numbers[numbers.length - 1].push(1);
			if (i > 0 && j != 0) {
				numbers[i][j] = numbers[i - 1][j] + numbers[i][j - 1];
			}
		}
	}
	return numbers[data[0] - 1][data[1] - 1];
}

function uniquepathsII(data) {
	let answer = [];
	for (let i = 0; i < data.length; i++) {
		answer.push(new Array(data[0].length).fill(0));
	}
	for (let i = data.length - 1; i >= 0; i--) {
		for (let j = data[0].length - 1; j >= 0; j--) {
			if (data[i][j] == 0) {
				answer[i][j] = (i + 1 < data.length ? answer[i + 1][j] : 0) + (j + 1 < data[0].length ? answer[i][j + 1] : 0);
				answer[data.length - 1][data[0].length - 1] = 1;
			}
		}
	}
	return answer[0][0];
}

function largestprimefactor(data) {
	let i = 2;
	while (data > 1) {
		while (data % i == 0) {
			data /= i;
		}
		i += 1;
	}
	return i - 1;
}

function mergeoverlappingintervals(data) {
	let intervals = (new Array(data.map(x => x[1]).reduce((a, b) => { return Math.max(a, b) }))).fill(0);
	for (let interval of data) {
		for (let i = interval[0]; i < interval[1]; i++) {
			intervals[i] = 1;
		}
	}
	if (intervals.indexOf(1) == -1) {
		return [];
	}
	let answer = [[intervals.indexOf(1), intervals.indexOf(0, intervals.indexOf(1))]];
	while ((answer[answer.length - 1][0] != -1) && (answer[answer.length - 1][1] != -1)) {
		let a = intervals.indexOf(1, 1 + answer[answer.length - 1][1]);
		answer.push([a, intervals.indexOf(0, a)]);
	}
	if (answer[answer.length - 1][1] == -1) {
		answer[answer.length - 1][1] = intervals.length;
	}
	if (answer[answer.length - 1][0] == -1) {
		answer.pop();
	}
	return answer;
}

function caesarcipher(data) {
	return data[0].split("").map(x => { return x === " " ? " " : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 26 - data[1]) % 26)] }).join("");
	// return data[0].split("").map(x => x.charCodeAt(0)).map(x => x == 32 ? 32 : (x + 65 - data[1])%26 + 65).map(x => String.fromCharCode(x)).join("");
}

function vigenere(data) {
	return data[0].split("").map((x, i) => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 13 + data[1].charCodeAt(i % data[1].length))) % 26] }).join("");
}

function totalwaystosum(data) {
	let answer = [1].concat((new Array(data + 1)).fill(0));
	for (let i = 1; i < data; i++) {
		for (let j = i; j <= data; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data];
}

function totalwaystosumII(data) {
	let answer = [1].concat((new Array(data[0])).fill(0));
	for (let i of data[1]) {
		for (let j = i; j <= data[0]; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data[0]];
}

function spiralizematrix(data) {
	let answer = [];
	while (data.length > 0 && data[0].length > 0) {
		answer = answer.concat(data.shift());
		if (data.length > 0 && data[0].length > 0) {
			answer = answer.concat(data.map(x => x.pop()));
			if (data.length > 0 && data[0].length > 0) {
				answer = answer.concat(data.pop().reverse());
				if (data.length > 0 && data[0].length > 0) {
					answer = answer.concat(data.map(x => x.shift()).reverse());
				}
			}
		}
	}
	return answer;
}

function subarraywithmaximumsum(data) {
	let answer = -1e308;
	for (let i = 0; i < data.length; i++) {
		for (let j = i; j < data.length; j++) {
			answer = Math.max(answer, data.slice(i, j + 1).reduce((a, b) => { return a + b }));
		}
	}
	return answer;
}

function twocolor(data) {
	for (let i = 0; i < 2 ** data[0]; i++) {
		let answer = [];
		for (let j = 0; j < data[0]; j++) {
			answer[j] = (2 ** j & i) > 0 ? 1 : 0;
		}
		if (data[1].map(x => answer[x[0]] != answer[x[1]]).reduce((a, b) => { return a + b }) == data[1].length) {
			return answer;
		}
	}
	return [];
}

function rlecompression(data) {
	let answer = "";
	data = data.split("");
	while (data.length > 0) {
		let z = data.splice(0, 1);
		let i = 1;
		while (i < 9 && data[0] == z & data.length > 0) {
			i += 1;
			data.splice(0, 1);
		}
		answer = answer.concat(i.toString()).concat(z);
	}
	return answer;
}

function lzdecompression(data) {
	if (data.length == 0) {
		return "";
	}
	data = data.split("");
	let answer = "";
	while (data.length > 0) {
		let chunklength = parseInt(data.shift());
		if (chunklength > 0) {
			answer = answer.concat(data.splice(0, chunklength).join(""));
		}
		if (data.length > 0) {
			chunklength = parseInt(data.shift());
			if (chunklength != 0) {
				let rewind = parseInt(data.shift());
				for (let i = 0; i < chunklength; i++) {
					answer = answer.concat(answer[answer.length - rewind]);
				}
			}
		}
	}
	return answer;
}

function lzcompression(data) {
	let z = 0;
	let queue = [[], [], []];
	while (queue[1].length <= data.length) {
		queue[1].push([]);
	}
	while (queue[2].length <= data.length) {
		queue[2].push([]);
	}
	for (let i = 0; i <= 9 && i < data.length; i++) {
		queue[1][i].push(i.toString() + data.substring(0, i));
		queue[2][i].push(i.toString() + data.substring(0, i));
	}
	while (queue[1][data.length].length == 0 && queue[2][data.length].length == 0) {
		let i = (new Array(data.length)).fill(0).map((_, i) => i).map(i => [i, queue[1][i].length + queue[2][i].length]).filter(x => x[1] > 0).reduce((a, b) => b)[0];
		if (queue[2][i].length > 0) queue[2][i].map(x => queue[1][i].push(x + "0"));
		if (queue[1][i].length > 0) queue[1][i].map(x => queue[2][i].push(x + "0"));
		queue[1][i] = Array.from(...new Set([queue[1][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[2][i] = Array.from(...new Set([queue[2][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[1][i] = queue[1][i].sort((a, b) => { return a.length - b.length; });
		queue[2][i] = queue[2][i].sort((a, b) => { return a.length - b.length; });
		ns.tprint(i, " ", queue[1][i], " ", queue[2][i]);
		if (queue[1][i].length > 0) {
			for (let current of queue[1][i].splice(0, 10)) {
				for (let l = 0; l <= 10; l++) {
					for (let j = 0; j <= 10; j++) {
						let temp = lzdecompression(current.concat(l.toString()).concat(j.toString()));
						if (temp === data.substring(0, temp.length)) {
							queue[2][temp.length].push(current.concat(l.toString()).concat(j.toString()));
						}
					}
				}
			}
			//			queue[1][i] = [];
		}
		if (queue[2][i].length > 0) {
			for (let current of queue[2][i].splice(0, 10)) {
				for (let j = 0; j <= 10; j++) {
					let temp = lzdecompression(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					if (temp === data.substring(0, temp.length)) {
						queue[1][temp.length].push(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					}
				}
			}
			//			queue[2][i] = [];
		}
	}
	queue[1][data.length] = queue[1][data.length].sort((a, b) => { return a.length - b.length; });
	queue[2][data.length] = queue[2][data.length].sort((a, b) => { return a.length - b.length; });
}

function stonks1(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
		}
	}
	return best;
}

function stonks2(data) {
	let best = 0;
	let queue = {};
	queue[JSON.stringify(data)] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		let stonks = JSON.parse(current);
		for (let i = 0; i < stonks.length; i++) {
			for (let j = i + 1; j < stonks.length; j++) {
				best = Math.max(best, value + stonks[j] - stonks[i]);
				let remaining = stonks.slice(j + 1);
				if (remaining.length > 0) {
					if (!Object.keys(queue).includes(JSON.stringify(remaining))) {
						queue[JSON.stringify(remaining)] = -1e308;
					}
					queue[JSON.stringify(remaining)] = Math.max(queue[JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
				}
			}
		}
	}
	return best;
}

function stonks3(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
			for (let k = j + 1; k < data.length; k++) {
				for (let l = k + 1; l < data.length; l++) {
					best = Math.max(best, data[j] - data[i] + data[l] - data[k]);
				}
			}
		}
	}
	return best;
}

function stonks4(data) {
	let best = 0;
	let queue = {};
	queue[0] = {};
	queue[0][JSON.stringify(data[1])] = 0;
	for (let ii = 0; ii < data[0]; ii++) {
		queue[ii + 1] = {};
		while (Object.keys(queue[ii]).length > 0) {
			let current = Object.keys(queue[ii])[0];
			let value = queue[ii][current];
			delete queue[ii][current];
			let stonks = JSON.parse(current);
			for (let i = 0; i < stonks.length; i++) {
				for (let j = i + 1; j < stonks.length; j++) {
					best = Math.max(best, value + stonks[j] - stonks[i]);
					let remaining = stonks.slice(j + 1);
					if (remaining.length > 0) {
						if (!Object.keys(queue[ii + 1]).includes(JSON.stringify(remaining))) {
							queue[ii + 1][JSON.stringify(remaining)] = -1e308;
						}
						queue[ii + 1][JSON.stringify(remaining)] = Math.max(queue[ii + 1][JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
					}
				}
			}
		}
	}
	return best;
}

function generateips(data) {
	let answer = [];
	for (let i = 1; i + 1 < data.length; i++) {
		for (let j = i + 1; j + 1 < data.length; j++) {
			for (let k = j + 1; k < data.length; k++) {
				answer.push([data.substring(0, i), data.substring(i, j), data.substring(j, k), data.substring(k)]);
			}
		}
	}
	for (let i = 0; i < 4; i++) {
		answer = answer.filter(x => 0 <= parseInt(x[i]) && parseInt(x[i]) <= 255 && (x[i] == "0" || x[i].substring(0, 1) != "0"));
	}
	return answer.map(x => x.join("."));
}

function arrayjumpinggame(data) {
	let queue = new Set();
	if (data[0] == 0) {
		return 0;
	}
	queue.add("[" + data.toString() + "]");
	while (queue.size > 0) {
		let current = Array.from(queue)[0];
		queue.delete(current);
		current = JSON.parse(current);
		if (current[0] != 0) {
			if (current[0] + 1 > current.length) {
				return 1;
			}
			for (let i = 1; i <= current[0] && i < current.length; i++) {
				queue.add(("[".concat(current.slice(i)).toString()).concat("]"));
			}
		}
	}
	return 0;
}

function arrayjumpinggameII(data) {
	let queue = {};
	let best = 1e308;
	queue[data.toString()] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		current = current.split(",").map(i => parseInt(i));
		if (current[0] + 1 >= current.length) {
			best = Math.min(best, value + 1);
		} else {
			for (let i = 1; i <= current[0]; i++) {
				let newIndex = current.slice(i).toString();
				if (!Object.keys(queue).includes(newIndex)) queue[newIndex] = 1e308;
				queue[newIndex] = Math.min(queue[newIndex], value + 1);
			}
		}
	}
	return best == 1e308 ? 0 : best;
}

function hammingencode(data) {
	let answer = [];

	// Convert the data to a bit array. Can't use & due to data possibly being larger than a 32-bit int.
	let encoded = [];
	let remaining = data;
	while (remaining > 0) {
		encoded = [remaining % 2].concat(encoded);
		remaining = Math.floor((remaining - remaining % 2) / 2 + .4);
	}

	// Set up the answer array, skipping over the entries with an index that is a power of 2, as they'll be the parity bits
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let a_i = 0; let e_i = 0;
	for (let e_i = 0; e_i < encoded.length; e_i++) {
		a_i += 1;
		while (powersoftwo.includes(a_i)) {
			a_i += 1;
		}
		answer[a_i] = encoded[e_i];
	}

	// Calculate the parity bits
	for (let i of powersoftwo.filter(x => x < answer.length)) {
		// Generate a list of indexes from 0 to answer.length-1
		answer[i] = (new Array(answer.length)).fill(0).map((_, i) => i);
		// Keep only the indexes that share a bit with i, which is a power of 2
		answer[i] = answer[i].filter(x => x > i && (i & x));
		// Map the indexes onto the values the represent
		answer[i] = answer[i].map(x => answer[x]);
		// Bitwise XOR reduction to a single value
		answer[i] = answer[i].reduce((a, b) => a ^ b, 0);
	}

	// Calculate the final parity bit and send it home
	answer[0] = answer.slice(1).reduce((a, b) => a ^ b);
	return answer.map(x => x.toString()).join("");
}

function hammingdecode(data) {
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let badbits = [];
	for (let i of powersoftwo.filter(x => x < data.length)) {
		let checksum = (new Array(data.length)).fill(0).map((_, i) => i).filter(x => x > i && (i & x)).map(x => parseInt(data.substring(x, x + 1))).reduce((a, b) => a ^ b);
		if (parseInt(data.substring(i, i + 1)) != checksum) {
			badbits.push(i);
		}
	}
	if (badbits.length == 0) { // No error in the data
		let checksum = data.substring(1).split("").map(x => parseInt(x)).reduce((a, b) => a ^ b);
		if (checksum == parseInt(data.substring(0, 1))) {
			let number = data.split("").map(x => parseInt(x));
			for (let i of powersoftwo.filter(x => x < data.length).reverse()) {
				number.splice(i, 1);
			}
			number.splice(0, 1);
			return number.reduce((a, b) => a * 2 + b);
		}
	}
	let badindex = badbits.reduce((a, b) => a | b, 0);
	return hammingdecode(data.substring(0, badindex).concat(data.substring(badindex, badindex + 1) == "0" ? "1" : "0").concat(data.substring(badindex + 1)));
}

function findallvalidmathexpressions(data) {
	let queue = new Set();
	queue.add(data[0]);
	for (let current of queue) {
		let splitted = current.split("");
		for (let i = 1; i < splitted.length; i++) {
			if (!("+-*".includes(splitted[i - 1])) && !("+-*".includes(splitted[i]))) {
				queue.add((splitted.slice(0, i).concat("+").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("-").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("*").concat(splitted.slice(i))).join(""));
				//				queue.add((splitted.slice(0, i).concat("*-").concat(splitted.slice(i))).join(""));
			}
		}
	}
	let zeroes = Array.from(queue) //.concat(Array.from(queue).map(x => "-".concat(x)));
	for (let i = 0; i < 10; i++) {
		zeroes = zeroes.filter(x => !x.includes("+0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("-0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("*0".concat(i.toString())));
		zeroes = zeroes.filter(x => x.substring(0, 1) != "0" || "+-*".includes(x.substring(1, 2)));
	}
	return zeroes.filter(x => eval(x) == data[1]);
}

function sanitizeparentheses(data) {
	let queue = new Set();
	queue.add(data);
	while (Array.from(queue).length > 0 && (Array.from(queue)[0].split("").includes("(") || Array.from(queue)[0].split("").includes(")"))) {
		let answer = [];
		let nextqueue = new Set();
		for (let current of Array.from(queue)) {
			let good = true;
			let goodsofar = 0;
			for (let i = 0; i < current.length; i++) {
				if (current.substring(i, i + 1) == "(") {
					goodsofar += 1;
				}
				if (current.substring(i, i + 1) == ")") {
					goodsofar -= 1;
				}
				if (goodsofar < 0) {
					good = false;
				}
			}
			if (goodsofar != 0) {
				good = false;
			}
			if (good) {
				answer.push(current);
			}
			for (let i = 0; i < current.length; i++) {
				if ("()".includes(current.substring(i, i + 1))) {
					nextqueue.add(current.substring(0, i).concat(current.substring(i + 1)));
				}
			}
		}
		if (answer.length > 0) {
			return answer;
		}
		queue = JSON.parse(JSON.stringify(Array.from(nextqueue)));
	}
	return [Array.from(queue)[0]];
}

function shortestpathinagrid(data) {
	let solutions = { "0,0": "" };
	let queue = new Set();
	queue.add("0,0");
	for (let current of queue) {
		let x = parseInt(current.split(",")[0]);
		let y = parseInt(current.split(",")[1]);
		if (x > 0) {
			if (data[x - 1][y] == 0) {
				let key = (x - 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "U";
					queue.add(key);
				}
			}
		}
		if (x + 1 < data.length) {
			if (data[x + 1][y] == 0) {
				let key = (x + 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "D";
					queue.add(key);
				}
			}
		}
		if (y > 0) {
			if (data[x][y - 1] == 0) {
				let key = x.toString().concat(",").concat((y - 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "L";
					queue.add(key);
				}
			}
		}
		if (y + 1 < data[0].length) {
			if (data[x][y + 1] == 0) {
				let key = x.toString().concat(",").concat((y + 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "R";
					queue.add(key);
				}
			}
		}
	}
	let finalkey = (data.length - 1).toString().concat(",").concat((data[0].length - 1).toString());
	if (Object.keys(solutions).includes(finalkey)) {
		return solutions[finalkey];
	}
	return "";
}

onmessage = (event) => {postMessage([eval(event.data[0])(event.data[1]), event.data[2], event.data[3], event.data[0]]);}
`;

export class Contracts {
  ns: NS;
  Game: WholeGame;
  contracts: any;
  times: any;
  y: any;
  z: any;
  procs: any;
  solutions: any;
  blob: any;
  log: any;
  display: any;
  constructor(Game: WholeGame) {
    this.ns = Game.ns;
    this.Game = Game;
    this.contracts = {};
    this.times = {};
    this.y = 0;
    this.z = 0;
    this.procs = [];
    this.solutions = [];
    this.blob = new Blob([workerCode], { type: "application/javascript" });
    for (let i = 0; i < 16; i++) {
      this.procs.push(new Worker(URL.createObjectURL(this.blob)));
      this.procs[this.procs.length - 1].onmessage = (event: any) => {
        this.solutions.push(event);
        this.z -= 1;
      };
    }
    this.ns.atExit(() => this.procs.map((x: any) => x.terminate()));
    this.loop();
  }
  async list() {
    //		this['window'] = this['window'] || await makeNewWindow("Contracts", this.ns.ui.getTheme())
    let files: any[] = [];
    let servers = ["home"];
    let i = 0;
    while (i < servers.length) {
      let temp = await Do(this.ns, "ns.scan", servers[i]);
      servers = servers.concat(temp.filter((x: any) => !servers.includes(x)));
      i += 1;
    }
    for (let server of servers) {
      files = files.concat(
        (await Do(this.ns, "ns.ls", server))
          .filter((x: any) => x.includes(".cct"))
          .map((filename: any) => [server, filename])
      );
    }
    // this.ns.tprint(files);
    for (let i = 0; i < files.length; i++) {
      this.contracts[files[i][1]] = {};
      this.contracts[files[i][1]].server = files[i][0];
      this.contracts[files[i][1]].type = await Do(
        this.ns,
        "ns.codingcontract.getContractType",
        files[i][1],
        files[i][0]
      );
      this.contracts[files[i][1]].data = await Do(
        this.ns,
        "ns.codingcontract.getData",
        files[i][1],
        files[i][0]
      );
      this.contracts[files[i][1]].description = await Do(
        this.ns,
        "ns.codingcontract.getDescription",
        files[i][1],
        files[i][0]
      );
      while (this.contracts[files[i][1]].description.indexOf("\n") > -1) {
        this.contracts[files[i][1]].description = this.contracts[
          files[i][1]
        ].description.replace("\n", "<BR>");
      }
    }
    return this.contracts;
  }
  async loop() {
    this.log = this.Game.doc
      .querySelector(".sb")!
      .querySelector(".contractbox");
    this.log ??= this.Game.createSidebarItem(
      "Contracts",
      "",
      "C",
      "contractbox"
    );
    this.display = this.Game.sidebar
      .querySelector(".contractbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    while (true) {
      await this.solve();
      await this.ns.asleep(60000);
    }
  }
  async solve() {
    await this.list();
    for (let contract of Object.keys(this.contracts)) {
      let done = false;
      //this.ns.tprint(contract);
      for (let types of [
        ["Minimum Path Sum in a Triangle", "minpathsum"],
        ["Unique Paths in a Grid I", "uniquepathsI"],
        ["Unique Paths in a Grid II", "uniquepathsII"],
        ["Find Largest Prime Factor", "largestprimefactor"],
        ["Merge Overlapping Intervals", "mergeoverlappingintervals"],
        ["Encryption I: Caesar Cipher", "caesarcipher"],
        ["Total Ways to Sum", "totalwaystosum"],
        ["Total Ways to Sum II", "totalwaystosumII"],
        ["Spiralize Matrix", "spiralizematrix"],
        ["Subarray with Maximum Sum", "subarraywithmaximumsum"],
        ["Proper 2-Coloring of a Graph", "twocolor"],
        ["Compression I: RLE Compression", "rlecompression"],
        ["Compression II: LZ Decompression", "lzdecompression"],
        //["Compression III: LZ Compression", "lzcompression"],
        ["Algorithmic Stock Trader I", "stonks1"],
        ["Algorithmic Stock Trader II", "stonks2"],
        ["Algorithmic Stock Trader III", "stonks3"],
        ["Algorithmic Stock Trader IV", "stonks4"],
        ["Encryption II: Vigenère Cipher", "vigenere"],
        ["Generate IP Addresses", "generateips"],
        ["Array Jumping Game", "arrayjumpinggame"],
        ["Array Jumping Game II", "arrayjumpinggameII"],
        ["HammingCodes: Integer to Encoded Binary", "hammingencode"],
        ["HammingCodes: Encoded Binary to Integer", "hammingdecode"],
        ["Find All Valid Math Expressions", "findallvalidmathexpressions"],
        ["Sanitize Parentheses in Expression", "sanitizeparentheses"],
        ["Shortest Path in a Grid", "shortestpathinagrid"],
      ]) {
        if (!Object.keys(this.times).includes(types[0])) {
          this.times[types[0]] = [];
        }
        if (!done) {
          if (this.contracts[contract].type === types[0]) {
            this.procs[this.y % 16].postMessage([
              types[1],
              this.contracts[contract].data,
              contract,
              this.contracts[contract].server,
            ]);
            this.z += 1;
            this.y += 1;
            await this.ns.asleep(0);
          }
        }
      }
    }
    while (this.z > 0 || this.solutions.length > 0) {
      await this.ns.asleep(1000);
      while (this.solutions.length > 0) {
        let success = await Do(
          this.ns,
          "ns.codingcontract.attempt",
          this.solutions[0].data[0],
          this.solutions[0].data[1],
          this.solutions[0].data[2]
        );
        if (success.length > 0) {
          this.log.log(
            "Succeeded at " + this.solutions[0].data[3] + " for " + success
          );
          delete this.contracts[this.solutions[0].data[1]];
        } else {
          this.log.log("Failed at " + this.solutions[0].data[3]);
          //					this.log.log("Failed at " + this.solutions[0].data[3], " ", types[1](this.contracts[this.solutions[0].data[1]].data, this.ns));
          //this.ns.exit();
        }
        this.log.recalcHeight();
        this.solutions.shift();
      }
    }
    await this.list();
  }
}

export class CollegeGym {
  Game: WholeGame;
  ns: NS;

  constructor(Game: WholeGame) {
    this.Game = Game;
    this.ns = Game.ns;
  }
  async raiseHacking(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["hacking"] < level) {
      await this.Game.traveling.assertLocation("Volhaven");
      while ((await Do(this.ns, "ns.getPlayer")).skills["hacking"] < level) {
        await Do(
          this.ns,
          "ns.singularity.universityCourse",
          "ZB Institute of Technology",
          "Algorithms",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseCharisma(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["charisma"] < level) {
      await this.Game.traveling.assertLocation("Volhaven");
      while ((await Do(this.ns, "ns.getPlayer")).skills["charisma"] < level) {
        await Do(
          this.ns,
          "ns.singularity.universityCourse",
          "ZB Institute of Technology",
          "Leadership",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseStrength(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["strength"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["strength"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Strength",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseDefense(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["defense"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["defense"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Defense",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseDexterity(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["dexterity"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["dexterity"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Dexterity",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async raiseAgility(level: number) {
    if ((await Do(this.ns, "ns.getPlayer")).skills["agility"] < level) {
      await this.Game.traveling.assertLocation("Sector-12");
      while ((await Do(this.ns, "ns.getPlayer")).skills["agility"] < level) {
        await Do(
          this.ns,
          "ns.singularity.gymWorkout",
          "Powerhouse Gym",
          "Agility",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}

export class Crime {
  Game: WholeGame;
  ns: NS;

  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
  }
  async getMoney(amount: number) {
    if ((await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! < amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Mug",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while (
        (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! < amount
      ) {
        let bestCrime = "Mug";
        for (let crime of Object.values(this.ns.enums.CrimeType)) {
          if (
            ((await Do(this.ns, "ns.singularity.getCrimeChance", crime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime))
                .money) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime)).time >
            ((await Do(this.ns, "ns.singularity.getCrimeChance", bestCrime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .money) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .time
          ) {
            bestCrime = crime as string;
          }
        }
        if (
          (await Do(this.ns, "ns.singularity.getCurrentWork"))!.crimeType !=
          bestCrime
        ) {
          await Do(
            this.ns,
            "ns.singularity.commitCrime",
            bestCrime,
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        }
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async lowerKarma(amount: number) {
    if ((await Do(this.ns, "ns.heart.break"))! > amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Mug",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while ((await Do(this.ns, "ns.heart.break"))! > amount) {
        let bestCrime = "Mug";
        for (let crime of Object.values(this.ns.enums.CrimeType)) {
          if (
            ((await Do(this.ns, "ns.singularity.getCrimeChance", crime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime))
                .karma) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", crime)).time >
            ((await Do(this.ns, "ns.singularity.getCrimeChance", bestCrime)) *
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .karma) /
              (await Do(this.ns, "ns.singularity.getCrimeStats", bestCrime))
                .time
          ) {
            bestCrime = crime as string;
          }
        }
        if (
          (await Do(this.ns, "ns.singularity.getCurrentWork"))!.crimeType !=
          bestCrime
        ) {
          await Do(
            this.ns,
            "ns.singularity.commitCrime",
            bestCrime,
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
          for (
            let i = 0;
            i < (await Do(this.ns, "ns.sleeve.getNumSleeves"));
            i++
          ) {
            await Do(this.ns, "ns.sleeve.setToCommitCrime", i, bestCrime);
          }
        }
        await this.ns.asleep(1000);
        await this.ns.tprint(await Do(this.ns, "ns.heart.break"));
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
  async hereIGoKillingAgain(amount: number) {
    if ((await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled < amount) {
      while (await Do(this.ns, "ns.singularity.isBusy")) {
        await this.ns.asleep(1000);
      }
      for (let i = 0; i < (await Do(this.ns, "ns.sleeve.getNumSleeves")); i++) {
        Do(this.ns, "ns.sleeve.setToCommitCrime", i, "Assassination");
      }
      await Do(
        this.ns,
        "ns.singularity.commitCrime",
        "Assassination",
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("Neuroreceptor Management Implant")
      );
      while (
        (await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled < amount
      ) {
        this.ns.toast(
          (await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled
        );
        await this.ns.asleep(1000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}

export async function Do(
  ns: NS,
  command: string,
  ...args: any[]
): Promise<any> {
  return await DoMore(ns, 1, command, ...args);
}

export async function DoMore(
  ns: NS,
  threads: number,
  command: string,
  ...args: (string | number)[]
): Promise<any> {
  let commandy = command.replace("await ", "").replace("ns.", "");
  let memory = 1.6 + ns.getFunctionRamCost(commandy);
  let pid = ns.run(
    "/jeekOS.js",
    { ramOverride: memory, threads: threads },
    "--ramOverride",
    memory,
    "--do",
    JSON.stringify([commandy, JSON.stringify(args)])
  );
  let z = -1;
  while (0 == pid) {
    z += 1;
    await ns.asleep(z);
    pid = ns.run(
      "/jeekOS.js",
      { ramOverride: memory, threads: threads },
      "--ramOverride",
      memory,
      "--do",
      JSON.stringify([commandy, JSON.stringify(args)])
    );
  }
  await ns.getPortHandle(pid).nextWrite();
  let answer: any = ns.readPort(pid);
  return answer;
}

export async function getPrograms(ns: NS) {
  while (
    ((await Do(ns, "ns.singularity.getDarkwebPrograms"))! as string[]).length ==
    0
  ) {
    if (200000 <= (await Do(ns, "ns.getServerMoneyAvailable", "home"))!) {
      await Do(ns, "ns.singularity.purchaseTor");
    } else {
      await ns.asleep(1000);
    }
  }
  let z = 0;
  for (let program of [
    "NUKE.exe",
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe",
    "Formulas.exe",
  ]) {
    while (!((await Do(ns, "ns.ls", "home")!)! as string[]).includes(program)) {
      if (
        (await Do(ns, "ns.singularity.getDarkwebProgramCost", program))! <=
        (await Do(ns, "ns.getServerMoneyAvailable", "home"))!
      ) {
        await Do(ns, "ns.singularity.purchaseProgram", program);
        await ns.asleep(0);
      } else {
        z += 1;
        await ns.asleep(z);
      }
    }
  }
}

export class Jobs {
  Game: WholeGame;
  ns: NS;
  log: any;
  display: any;
  constructor(Game: WholeGame) {
    this.Game = Game;
    this.ns = Game.ns;
    this.log = {};
    this.display = {};
  }
  async allJobs() {
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".jobbox");
    this.log ??= this.Game.createSidebarItem("Job", "", "J", "jobbox");
    this.display = this.Game.sidebar
      .querySelector(".jobbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    while (true) {
      let jobs: any[] = [];
      let table = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
      for (let company of Object.values(this.ns.enums.CompanyName)) {
        let positions: any[] = [];
        for (let position of await Do(
          this.ns,
          "ns.singularity.getCompanyPositions",
          company
        )) {
          let posInfo = await Do(
            this.ns,
            "ns.singularity.getCompanyPositionInfo",
            company,
            position
          );
          posInfo.company = company;
          positions.push(posInfo);
        }
        let playerStats = await Do(this.ns, "ns.getPlayer");
        for (let skill of [
          "hacking",
          "charisma",
          "defense",
          "dexterity",
          "strength",
          "charisma",
        ]) {
          positions = positions.filter(
            (x: any) => x.requiredSkills[skill] <= playerStats.skills[skill]
          );
        }
        let rep = await Do(this.ns, "ns.singularity.getCompanyRep", company);
        positions = positions.filter((x: any) => x.requiredReputation <= rep);
        positions.sort((a: any, b: any) => {
          return b.salary - a.salary;
        });
        if (positions.length > 0) {
          await Do(
            this.ns,
            "ns.singularity.applyToCompany",
            company,
            positions[0].field
          );
          jobs.push(positions[0]);
        }
      }
      let numSleeves = await Do(this.ns, "ns.sleeve.getNumSleeves");
      let sleeveStats: { [key: string]: any } = {};
      let sleeves: any[] = [];
      for (let i = 0; i < numSleeves; i++) {
        sleeveStats[i] = await Do(this.ns, "ns.sleeve.getSleeve", i);
        await Do(this.ns, "ns.sleeve.setToIdle", i);
        if (sleeveStats[i].sync < 100) {
          Do(this.ns, "ns.sleeve.setToSynchronize", i);
        } else {
          sleeves.push(i);
          for (let buyMe of await Do(
            this.ns,
            "ns.sleeve.getSleevePurchasableAugs",
            i
          )) {
            if (sleeveStats[i].shock == 0) {
              Do(this.ns, "ns.sleeve.purchaseSleeveAug", i, buyMe["name"]);
            }
          }
        }
      }
      if (numSleeves > 1) {
        sleeves.sort((a: any, b: any) => {
          return sleeveStats[a].shock - sleeveStats[b].shock;
        });
        if (sleeveStats[sleeves[sleeves.length - 1]].shock > 0) {
          await Do(this.ns, "ns.sleeve.setToShockRecovery", sleeves.pop());
        }
      }
      let cw = await Do(this.ns, "ns.singularity.getCurrentWork");
      if (cw != null && cw.type == "CRIME") {
        let curWork = await Do(this.ns, "ns.singularity.getCurrentWork");
        sleeves.map((x: any) =>
          Do(this.ns, "ns.sleeve.setToCommitCrime", x, curWork.crimeType)
        );
        sleeves = [];
      }
      let factionInfo: any[] = [];
      let jobInfo: any[] = [];
      for (let sleeve of sleeves) {
        for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
          factionInfo.push([
            (
              await Do(
                this.ns,
                "ns.formulas.work.factionGains",
                sleeveStats[sleeve],
                "hacking",
                await Do(this.ns, "ns.singularity.getFactionFavor", faction)
              )
            ).reputation,
            "FACTION",
            sleeve,
            faction,
          ]);
        }
        for (let job of jobs) {
          jobInfo.push([
            (
              await Do(
                this.ns,
                "ns.formulas.work.companyGains",
                sleeveStats[sleeve],
                job.company,
                job.name,
                await Do(this.ns, "ns.singularity.getCompanyFavor", job.company)
              )
            )["hacking"],
            "COMPANY",
            sleeve,
            job.company,
          ]);
        }
      }
      let work = await Do(this.ns, "ns.singularity.getCurrentWork");
      factionInfo.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      jobInfo.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      let best: any = {};
      if (await Do(this.ns, "ns.gang.inGang")) {
        let myGang = (await Do(this.ns, "ns.gang.getGangInformation")).faction;
        factionInfo = factionInfo.filter((x: any) => x[3] != myGang);
      }
      if (work != null && work.type == "FACTION") {
        best = factionInfo.filter((x: any) => x[3] == work.factionName)[0];
        await Do(
          this.ns,
          "ns.sleeve.setToFactionWork",
          best[2],
          work.factionName,
          work.factionWorkType
        );
        factionInfo = factionInfo
          .filter((x: any) => x[2] != best[2])
          .filter((x: any) => x[3] != best[3]);
        jobInfo = jobInfo.filter((x: any) => x[2] != best[2]);
      }
      jobs.sort((a: any, b: any) => {
        return b.reputation - a.reputation;
      });
      for (let company of [
        "Bachman & Associates",
        "Four Sigma",
        "Clarke Incorporated",
        "ECorp",
        "MegaCorp",
        "NWO",
        "Blade Industries",
        "KuaiGong International",
        "OmniTek Incorporated",
      ]) {
        if (!(await Do(this.ns, "ns.getPlayer")).factions.includes(company)) {
          if (jobInfo.filter((x: any) => x[3] == company).length > 0) {
            while (
              await Do(
                this.ns,
                "ns.hacknet.spendHashes",
                "Company Favor",
                company
              )
            );
            best = jobInfo.filter((x: any) => x[3] == company)[0];
            await Do(this.ns, "ns.sleeve.setToCompanyWork", best[2], best[3]);
            factionInfo = factionInfo.filter(
              (x: any) => x[2] != best[2] && x[3] != best[3]
            );
            jobInfo = jobInfo.filter(
              (x: any) => x[2] != best[2] && x[3] != best[3]
            );
          }
        }
      }
      while (factionInfo.length > 0) {
        best = factionInfo[0];
        await Do(
          this.ns,
          "ns.sleeve.setToFactionWork",
          best[2],
          best[3],
          "hacking"
        );
        factionInfo = factionInfo.filter(
          (x: any) => x[2] != best[2] && x[3] != best[3]
        );
        jobInfo = jobInfo.filter((x: any) => x[2] != best[2]);
      }
      jobs.sort((a: any, b: any) => {
        return b.salary - a.salary;
      });
      let z = 0;
      while (jobInfo.length > 0) {
        best = jobInfo.filter((x: any) => x[3] == jobs[z].company)[0];
        await Do(this.ns, "ns.sleeve.setToCompanyWork", best[2], best[3]);
        jobInfo = jobInfo.filter(
          (x: any) => x[2] != best[2] && x[3] != best[3]
        );
        z += 1;
      }
      let i = 0;
      while (i < jobs.length) {
        table =
          table +
          '<TR><TD><FONT FACE="Hack">' +
          jobs[i].company +
          '</TD><TD><FONT FACE="Hack">' +
          jobs[i].name +
          '</TD><TD><FONT FACE="Hack">' +
          jFormat(jobs[i].salary) +
          "</TD><TD>" +
          jFormat(
            await Do(this.ns, "ns.singularity.getCompanyRep", jobs[i].company)
          ) +
          "</TD></TR>";
        i += 1;
      }
      this.display.innerHTML = table + "</TR></TABLE>";
      this.log.recalcHeight();
      await this.ns.asleep(60000);
    }
  }
  async unlockFaction(company: string) {
    let ns: NS = this.ns;
    let jobs: any[] = [];
    if (company != this.Game.gangToJoin) {
      if ((await Do(this.ns, "ns.getPlayer"))!.city == "Sector-12") {
        await this.Game.collegegym.raiseHacking(250);
        await this.Game.collegegym.raiseHacking(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
        );
        await this.Game.collegegym.raiseCharisma(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
        );
      } else {
        await this.Game.collegegym.raiseHacking(250);
        await this.Game.collegegym.raiseHacking(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
        );
        await this.Game.collegegym.raiseCharisma(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
        );
      }
    }
    if (
      !(await Do(ns, "ns.getPlayer")).factions.includes(
        company == "Fulcrum Secret Techologies"
          ? "Fulcrum Technologies"
          : company
      )
    ) {
      while (
        !(await Do(ns, "ns.getPlayer")).factions.includes(
          company == "Fulcrum Secret Techologies"
            ? "Fulcrum Technologies"
            : company
        )
      ) {
        jobs = [];
        let faction = company;
        if (company == "Fulcrum Technologies") {
          faction = "Fulcrum Secret Technologies";
        }
        if (faction == "Fulcrum Secret Technologies") {
          company = "Fulcrum Technologies";
        }
        if (
          (await Do(ns, "ns.singularity.getCompanyRep", company)) < 400000 &&
          !(await Do(ns, "ns.getPlayer")).factions.includes(faction)
        ) {
          for (let position of await Do(
            ns,
            "ns.singularity.getCompanyPositions",
            company
          )) {
            jobs = jobs.concat([
              [
                company,
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  company,
                  position
                ),
              ],
            ]);
            if (
              jobs[jobs.length - 1][1]["requiredReputation"] >
              (await Do(ns, "ns.singularity.getCompanyRep", company))
            ) {
              jobs.pop();
            }
            for (let skill of [
              "hacking",
              "intelligence",
              "strength",
              "dexterity",
              "defense",
              "agility",
              "charisma",
            ]) {
              if (
                jobs.length > 0 &&
                (await Do(ns, "ns.getPlayer"))!.skills[skill] <
                  jobs[jobs.length - 1][1].requiredSkills[skill]
              ) {
                jobs.pop();
              }
            }
          }
        }
        jobs = jobs.sort((a, b) => {
          return (
            a[1].requiredReputation * a[1].salary -
            b[1].requiredReputation * b[1].salary
          );
        });
        // TODO: Rewrite to sort but use Do
        //            if ((await Do(ns, "ns.ls", "home")).includes("Formulas.exe")) {
        //              jobs = jobs.sort((a, b) => { return ns.formulas.work.companyGains(ns.getPlayer(), a[0], a[1]["name"], ns.singularity.getCompanyFavor(a[0])).reputation - ns.formulas.work.companyGains(ns.getPlayer(), b[0], b[1]["name"], ns.singularity.getCompanyFavor(b[0])).reputation })
        //            }
        if (jobs.length > 0) {
          await Do(
            ns,
            "ns.singularity.applyToCompany",
            jobs[jobs.length - 1][0],
            jobs[jobs.length - 1][1].field
          );
          await Do(
            ns,
            "ns.singularity.workForCompany",
            jobs[jobs.length - 1][0],
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        }
        if (jobs.length > 0) {
          if (jobs[jobs.length - 1][1].nextPosition === null) {
          } else {
            if (
              (
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  jobs[jobs.length - 1][0],
                  jobs[jobs.length - 1][1].nextPosition
                )
              ).requiredSkills["hacking"] >
              (await Do(ns, "ns.getPlayer"))!.skills["hacking"]
            ) {
              if (
                (
                  await Do(
                    ns,
                    "ns.singularity.getCompanyPositionInfo",
                    jobs[jobs.length - 1][0],
                    jobs[jobs.length - 1][1].nextPosition
                  )
                ).requiredSkills["hacking"] <
                200 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
              ) {
                Do(this.ns, "ns.singularity.stopAction");
                await this.Game.collegegym.raiseHacking(
                  (
                    await Do(
                      ns,
                      "ns.singularity.getCompanyPositionInfo",
                      jobs[jobs.length - 1][0],
                      jobs[jobs.length - 1][1].nextPosition
                    )
                  ).requiredSkills["hacking"]
                );
              }
            }
            if (
              (
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  jobs[jobs.length - 1][0],
                  jobs[jobs.length - 1][1].nextPosition
                )
              ).requiredSkills["charisma"] >
              (await Do(ns, "ns.getPlayer"))!.skills["charisma"]
            ) {
              if (
                (
                  await Do(
                    ns,
                    "ns.singularity.getCompanyPositionInfo",
                    jobs[jobs.length - 1][0],
                    jobs[jobs.length - 1][1].nextPosition
                  )
                ).requiredSkills["charisma"] <
                200 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
              ) {
                Do(this.ns, "ns.singularity.stopAction");
                await this.Game.collegegym.raiseCharisma(
                  (
                    await Do(
                      ns,
                      "ns.singularity.getCompanyPositionInfo",
                      jobs[jobs.length - 1][0],
                      jobs[jobs.length - 1][1].nextPosition
                    )
                  ).requiredSkills["charisma"]
                );
              }
            }
          }
        }
        await ns.asleep(60000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}

export async function Maps(ns: any) {
  let React = eval("window").React;
  let fg = ns.ui.getTheme()["primarylight"];
  if (fg.substring(0, 1) === "#" && fg.length == 4) {
    fg =
      "#" +
      fg.substring(1, 2) +
      fg.substring(1, 2) +
      fg.substring(2, 3) +
      fg.substring(2, 3) +
      fg.substring(3, 4) +
      fg.substring(3, 4);
  }
  let info = ns.ui.getTheme()["info"];
  if (info.substring(0, 1) === "#" && info.length == 4) {
    info =
      "#" +
      info.substring(1, 2) +
      info.substring(1, 2) +
      info.substring(2, 3) +
      info.substring(2, 3) +
      info.substring(3, 4) +
      info.substring(3, 4);
  }
  let warning = ns.ui.getTheme()["warning"];
  if (warning.substring(0, 1) === "#" && warning.length == 4) {
    warning =
      "#" +
      warning.substring(1, 2) +
      warning.substring(1, 2) +
      warning.substring(2, 3) +
      warning.substring(2, 3) +
      warning.substring(3, 4) +
      warning.substring(3, 4);
  }
  let error = ns.ui.getTheme()["error"];
  if (error.substring(0, 1) === "#" && error.length == 4) {
    error =
      "#" +
      error.substring(1, 2) +
      error.substring(1, 2) +
      error.substring(2, 3) +
      error.substring(2, 3) +
      error.substring(3, 4) +
      error.substring(3, 4);
  }
  let bg = ns.ui.getTheme()["backgroundprimary"];
  if (bg.substring(0, 1) === "#" && bg.length == 4) {
    bg =
      "#" +
      bg.substring(1, 2) +
      bg.substring(1, 2) +
      bg.substring(2, 3) +
      bg.substring(2, 3) +
      bg.substring(3, 4) +
      bg.substring(3, 4);
  }
  let src: string = "digraph{rankdir=LR;";
  src = src + 'bgcolor="' + bg + '";';
  src = src + 'edge[color="' + fg + '"];';
  let servers = ["home"];
  let i = 0;
  while (i < servers.length) {
    let color = fg;
    if (!(await Do(ns, "ns.getServer", servers[i]))!.hasAdminRights) {
      color = error;
    } else {
      if (
        (await Do(ns, "ns.getPlayer"))!["skills"]["hacking"] >=
        (await Do(ns, "ns.getServerRequiredHackingLevel", servers[i]))
      ) {
        if ((await Do(ns, "ns.getServer", servers[i])).backdoorInstalled) {
          color = fg;
        } else {
          color = info;
        }
      } else {
        color = warning;
      }
    }
    src =
      src +
      '"' +
      servers[i] +
      '"[color="' +
      color +
      '",fontcolor="' +
      color +
      '",shape=record,label="' +
      servers[i] +
      "\\n" +
      (
        (await Do(ns, "ns.getServer", servers[i]!)).requiredHackingSkill ?? 0
      ).toString() +
      "\\n" +
      "O"
        .repeat(
          Math.min(
            (await Do(ns, "ns.getServer", servers[i])).numOpenPortsRequired,
            (await Do(ns, "ns.getServer", servers[i]))!.openPortCount
          )
        )
        .toString() +
      "X"
        .repeat(
          Math.max(
            0,
            ((await Do(ns, "ns.getServer", servers[i]))!.numOpenPortsRequired ??
              0) -
              ((await Do(ns, "ns.getServer", servers[i])) ?? 0).openPortCount
          )
        )
        .toString() +
      '"];';
    for (let server of await Do(ns, "ns.scan", servers[i])) {
      if (!servers.includes(server)) {
        if (!(await Do(ns, "ns.getPurchasedServers"))!.includes(server)) {
          servers.push(server);
          if (
            (await Do(ns, "ns.getServer", servers[i])).requiredHackingSkill <=
              (await Do(ns, "ns.getServer", server))!.requiredHackingSkill ||
            true
          ) {
            src = src + '"' + servers[i] + '"->"' + server + '";';
          } else {
            src = src + '"' + server + '"->"' + servers[i] + '" [dir=back];';
          }
        }
      }
    }
    i += 1;
  }
  src = src + "}";
  src = src
    .replaceAll("=", "%3D")
    .replaceAll('"', "%22")
    .replaceAll("#", "%23");
  ns.tprintRaw(
    React.createElement("img", {
      width: "100%",
      src: `https://quickchart.io/graphviz?graph=` + src,
    })
  );
}

export async function CorpMats(ns: any) {
  let React = eval("window").React;
  let fg = ns.ui.getTheme()["primarylight"];
  if (fg.substring(0, 1) === "#" && fg.length == 4) {
    fg =
      "#" +
      fg.substring(1, 2) +
      fg.substring(1, 2) +
      fg.substring(2, 3) +
      fg.substring(2, 3) +
      fg.substring(3, 4) +
      fg.substring(3, 4);
  }
  let info = ns.ui.getTheme()["info"];
  if (info.substring(0, 1) === "#" && info.length == 4) {
    info =
      "#" +
      info.substring(1, 2) +
      info.substring(1, 2) +
      info.substring(2, 3) +
      info.substring(2, 3) +
      info.substring(3, 4) +
      info.substring(3, 4);
  }
  let warning = ns.ui.getTheme()["warning"];
  if (warning.substring(0, 1) === "#" && warning.length == 4) {
    warning =
      "#" +
      warning.substring(1, 2) +
      warning.substring(1, 2) +
      warning.substring(2, 3) +
      warning.substring(2, 3) +
      warning.substring(3, 4) +
      warning.substring(3, 4);
  }
  let error = ns.ui.getTheme()["error"];
  if (error.substring(0, 1) === "#" && error.length == 4) {
    error =
      "#" +
      error.substring(1, 2) +
      error.substring(1, 2) +
      error.substring(2, 3) +
      error.substring(2, 3) +
      error.substring(3, 4) +
      error.substring(3, 4);
  }
  let bg = ns.ui.getTheme()["backgroundprimary"];
  if (bg.substring(0, 1) === "#" && bg.length == 4) {
    bg =
      "#" +
      bg.substring(1, 2) +
      bg.substring(1, 2) +
      bg.substring(2, 3) +
      bg.substring(2, 3) +
      bg.substring(3, 4) +
      bg.substring(3, 4);
  }
  let src: string = "digraph{rankdir=LR;";
  src = src + 'bgcolor="' + bg + '";';
  src = src + 'edge[color="' + fg + '"];';
  let color = "#00FF00";
  let seen: any = [];
  for (let industry of (await Do(ns, "ns.corporation.getConstants"))
    .industryNames) {
    src =
      src +
      '"' +
      industry +
      'industry"[color="' +
      color +
      '",fontcolor="' +
      color +
      '",shape=record,label="' +
      industry +
      '"];';
    let indData = await Do(ns, "ns.corporation.getIndustryData", industry);
    for (let mat in indData.requiredMaterials) {
      if (!seen.includes(mat)) {
        src =
          src +
          '"' +
          mat +
          '"[color="' +
          color +
          '",fontcolor="' +
          color +
          '",shape=oval,label="' +
          mat +
          '"];';
        seen.push(mat);
      }
      src = src + '"' + mat + '" -> "' + industry + 'industry";' + "\n";
    }
    if (indData.producedMaterials) {
      for (let mat of indData.producedMaterials) {
        src = src + '"' + industry + 'industry" -> "' + mat + '";' + "\n";
        if (!seen.includes(mat)) {
          src =
            src +
            '"' +
            mat +
            '"[color="' +
            color +
            '",fontcolor="' +
            color +
            '",shape=oval,label="' +
            mat +
            '"];';
          seen.push(mat);
        }
      }
    }
  }
  src = src + "}";
  src = src
    .replaceAll("=", "%3D")
    .replaceAll('"', "%22")
    .replaceAll("#", "%23");
  ns.tprintRaw(
    React.createElement("img", {
      width: "100%",
      src: `https://quickchart.io/graphviz?graph=` + src,
    })
  );
}

export class SimpleServer {
  ns: NS;
  name: string;

  constructor(ns: NS, name = "home") {
    this.ns = ns;
    this.name = name;
  }

  get backdoorInstalled() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .backdoorInstalled;
      } catch (e) {
        return false;
      }
    })();
  }
  get baseDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerBaseSecurityLevel", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get cpuCores() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .cpuCores;
      } catch (e) {
        return false;
      }
    })();
  }
  get ftpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .ftpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get hackDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get hasAdminRights() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.hasRootAccess", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get hostname() {
    return this.name;
  }
  get httpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .httpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get ip() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server).ip;
      } catch (e) {
        return "0.0.0.0";
      }
    })();
  }
  get isConnectedTo() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .isConnectedTo;
      } catch (e) {
        return false;
      }
    })();
  }
  get maxRam() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get minDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMinSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyAvailable() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMoneyAvailable", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyMax() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxMoney", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get numOpenPortsRequired() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .numOpenPortsRequired;
      } catch (e) {
        return 6;
      }
    })();
  }
  get openPortCount() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .openPortCount;
      } catch (e) {
        return -1;
      }
    })();
  }
  get purchasedByPlayer() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .purchasedByPlayer;
      } catch (e) {
        return -1;
      }
    })();
  }
  get ramUsed() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerUsedRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get requiredHackingSkill() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerRequiredHackingLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get serverGrowth() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerGrowth", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get smtpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .smtpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sqlPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .sqlPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sshPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .sshPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
}

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

export async function purchasedServersHandler(Game: WholeGame): Promise<void> {
  let ns = Game.ns;
  while (true) {
    Game.growCount = 3;
    if (Game.growCount < 2) {
      await ns.asleep(1000);
    } else {
      const resetInfo = (await Do(ns, "ns.getResetInfo")) as ResetInfo;
      const lastAugReset = resetInfo.lastAugReset;
      let lastAug = (Date.now() - lastAugReset) / 3600000;

      if (lastAug < 2) {
        lastAug = 2;
      }
      let servers: string[] = (await Do(
        ns,
        "ns.getPurchasedServers"
      )) as string[];
      let ideas: (number | string)[][] = [];
      let biggestserver = (await Do(
        ns,
        "ns.getPurchasedServerMaxRam"
      )) as number;
      if (
        servers.length <
        ((await Do(ns, "ns.getPurchasedServerLimit")) as number)
      ) {
        for (let i = 2; i <= biggestserver; i *= 2) {
          ideas = ideas.concat([
            [
              i / ((await Do(ns, "ns.getPurchasedServerCost", i)) as number),
              (await Do(ns, "ns.getPurchasedServerCost", i)) as number,
              "pserver-" + (servers.length + 1).toString(),
              "purchase",
              i,
              i,
            ],
          ]);
        }
      }
      for (let i = 2; i <= biggestserver; i *= 2) {
        for (let server of servers) {
          let curRam = (await Do(ns, "ns.getServerMaxRam", server)) as number;
          if (i > curRam) {
            ideas = ideas.concat([
              [
                (i - curRam) /
                  ((await Do(
                    ns,
                    "ns.getPurchasedServerUpgradeCost",
                    server,
                    i
                  )) as number),
                (await Do(
                  ns,
                  "ns.getPurchasedServerUpgradeCost",
                  server,
                  i
                )) as number,
                server,
                "upgrade",
                i - curRam,
                i,
              ],
            ]);
          }
        }
      }
      let curMoney = (await Do(
        ns,
        "ns.getServerMoneyAvailable",
        "home"
      )) as number;
      ideas = ideas.filter((x) => (x[1] as number) <= curMoney / lastAug);
      ideas = ideas.sort((x, y) => (x[4] as number) - (y[4] as number));
      ideas = ideas.sort((x, y) => (x[5] as number) - (y[5] as number));
      ideas = ideas.sort((x, y) => (x[0] as number) - (y[0] as number));
      ideas = ideas.sort((x, y) =>
        x[2] == "pserver-1" && y[2] != "pserver-1"
          ? 1
          : x[2] != "pserver-1" && y[2] == "pserver-1"
          ? -1
          : 0
      );
      while (ideas.length > 1) {
        ideas.shift();
      }
      let didsomething = false;
      if (ideas.length > 0) {
        if (ideas[0][3] == "purchase") {
          didsomething = (await Do(
            ns,
            "ns.purchaseServer",
            ideas[0][2] as number,
            ideas[0][4] as number
          )) as boolean;
          ns.tprint("Purchased " + ideas[0][2] + " " + ideas[0][4].toString());
        } else {
          didsomething = (await Do(
            ns,
            "ns.upgradePurchasedServer",
            ideas[0][2] as number,
            ideas[0][5] as number
          )) as boolean;
          ns.tprint(
            "Upgraded " +
              ideas[0][2] +
              " from " +
              ((ideas[0][5] as number) - (ideas[0][4] as number)).toString() +
              " to " +
              ideas[0][5].toString()
          );
        }
      }
      if (!didsomething) {
        await ns.asleep(60000);
      }
      await ns.asleep(0);
    }
  }
}

export class Gangs {
  Game: WholeGame;
  ns: NS;
  gangToJoin: string;
  clashTarget: number;
  log: any;
  display: any;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.gangToJoin = this.Game.gangToJoin;
    this.clashTarget = 0.5;
    this.log = {};
    this.display = {};
  }
  async minimumDefense() {
    return 500 * (await Do(this.ns, "ns.gang.getMemberNames")).length;
  }
  async gangCreate() {
    if (!(await Do(this.ns, "ns.gang.inGang"))) {
      await this.Game.factions.factionJoin(this.gangToJoin);
      Do(this.ns, "ns.singularity.stopAction");
      await Do(this.ns, "ns.gang.createGang", this.gangToJoin);
    }
    return await Do(this.ns, "ns.gang.inGang");
  }
  async start() {
    this.mainLoop();
  }
  async hackAugs() {
    let augs = await Do(
      this.ns,
      "ns.singularity.getAugmentationsFromFaction",
      (
        await Do(this.ns, "ns.gang.getGangInformation")
      ).faction
    );
    let owned = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
    augs = augs.filter((x: any) => !owned.includes(x));
    let augData: { [key: string]: any } = {};
    for (let aug of augs) {
      augData[aug] = Do(this.ns, "ns.singularity.getAugmentationStats", aug);
    }
    for (let aug of augs) {
      augData[aug] = await augData[aug];
      augData[aug].price = Do(
        this.ns,
        "ns.singularity.getAugmentationPrice",
        aug
      );
      augData[aug].rep = Do(
        this.ns,
        "ns.singularity.getAugmentationRepReq",
        aug
      );
    }
    for (let aug of augs) {
      augData[aug].price = await augData[aug].price;
      augData[aug].rep = await augData[aug].rep;
    }
    let augs2 = augs.filter(
      (x: any) =>
        augData[x]["hacking_chance"] +
          augData[x]["hacking_exp"] +
          augData[x]["hacking"] +
          augData[x]["hacking_grow"] +
          augData[x]["hacking_money"] +
          augData[x]["hacking_speed"] +
          augData[x]["charisma"] +
          augData[x]["charisma_exp"] +
          augData[x]["faction_rep"] +
          augData[x]["company_rep"] +
          augData[x]["work_money"] >
          11 ||
        x == "CashRoot Starter Kit" ||
        x == "The Red Pill" ||
        x == "Neuroreceptor Management Implant"
    );
    if (augs2.length == 0) {
      augs2 = augs;
    }
    if (augs.length == 0) {
      return false;
    }
    augs = augs2.sort((a: any, b: any) => {
      return augData[a].rep - augData[b].rep;
    });
    if (
      (await Do(
        this.ns,
        "ns.singularity.getFactionRep",
        (
          await Do(this.ns, "ns.gang.getGangInformation")
        ).faction
      )) > augData[augs[0]].rep
    ) {
      if ((await Do(this.ns, "ns.getPlayer")).money > augData[augs[0]].price) {
        augs = augs.sort((a: any, b: any) => {
          return -augData[a].price + augData[b].price;
        });
        for (let aug of augs) {
          await Do(
            this.ns,
            "ns.singularity.purchaseAugmentation",
            (
              await Do(this.ns, "ns.gang.getGangInformation")
            ).faction,
            aug
          );
        }
        return true;
      }
    }
    return (
      (await Do(
        this.ns,
        "ns.singularity.getFactionRep",
        (
          await Do(this.ns, "ns.gang.getGangInformation")
        ).faction
      )) > augData[augs[0]].rep
    );
  }
  async mainLoop() {
    let loopStop = Date.now();
    let taskNames = await Do(this.ns, "ns.gang.getTaskNames");
    let didSomething = true;
    let z = 0;
    while (z < 20 && didSomething) {
      z += 1;
      didSomething = false;
      let filterMembers = await Do(this.ns, "ns.gang.getMemberNames");
      filterMembers = this.Game.gangMemberNames.filter(
        (x: string) => !filterMembers.includes(x)
      );
      let filterMembers2: string[] = (
        await Do(this.ns, "ns.gang.getMemberNames")
      )
        .filter((x: any) => !this.Game.gangMemberNames.includes(x))
        .filter((x: any) => !filterMembers.includes(x));
      if (filterMembers2.length > 0) {
        Do(
          this.ns,
          "ns.gang.renameMember",
          filterMembers2[Math.floor(filterMembers2.length * Math.random())],
          filterMembers[Math.floor(filterMembers.length * Math.random())]
        );
        didSomething = true;
      }
    }
    let readyToEarn: string[] = [];
    let money: any = this.hackAugs();
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".gangbox");
    this.log ??= this.Game.createSidebarItem("Gang", "", "G", "gangbox");
    this.display = this.Game.sidebar
      .querySelector(".gangbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    while (true) {
      let startPower = (await Do(this.ns, "ns.gang.getGangInformation"))!.power;
      let GI = await Do(this.ns, "ns.gang.getGangInformation");
      let top =
        jFormat(GI.respect) +
        " " +
        jFormat(GI.power) +
        " " +
        jFormat(GI.territory * 100) +
        "<TABLE BORDER=1 WIDTH=100% CELLPADDING=0 CELLSPACING=0>";
      let members = await Do(this.ns, "ns.gang.getMemberNames");
      let total = 0;
      let rows: any = [];
      for (let member of members) {
        let mR = await Do(this.ns, "ns.gang.getMemberInformation", member);
        total += mR.earnedRespect;
        rows.push("");
        rows[rows.length - 1] +=
          "<TR><TD>" + member + "</TD><TD>" + mR.task + "</TD>";
        for (let stat of [
          "hack",
          "str",
          "def",
          "dex",
          "agi",
          "cha",
          "earnedRespect",
        ]) {
          rows[rows.length - 1] +=
            "<TD ALIGN=CENTER>" + mR[stat].toString() + "</TD>";
        }
        const regex: RegExp = new RegExp(/[a-z ]+/g);
        rows[rows.length - 1] +=
          "<TD>" +
          mR.augmentations.join(", ").replace(regex, "") +
          "</TD></TR>";
        rows[rows.length - 1] = [-mR.str_asc_mult, rows[rows.length - 1]];
      }
      this.display.innerHTML =
        top +
        rows
          .sort((a: any, b: any) => {
            return a[0] - b[0];
          })
          .map((x: any) => {
            return x[1];
          })
          .join("") +
        "</TABLE>";
      this.log.recalcHeight();
      // Clash time
      members.map((x: any) =>
        Do(this.ns, "ns.gang.setMemberTask", x, "Territory Warfare")
      );
      while (1000 < (await Do(this.ns, "ns.gang.getBonusTime"))) {
        await this.ns.asleep(1000);
      }
      let othergangs = await Do(this.ns, "ns.gang.getOtherGangInformation");
      if (
        Object.keys(othergangs).filter((x) => othergangs[x].territory > 0)
          .length > 0
      ) {
        let chances: { [key: string]: number } = {};
        for (let other of Object.keys(othergangs)) {
          if (othergangs[other].territory > 0) {
            chances[other] = await Do(
              this.ns,
              "ns.gang.getChanceToWinClash",
              other
            );
          }
        }
        let total = Object.keys(chances)
          .map((x) => chances[x] * othergangs[x].territory)
          .reduce((a, b) => a + b);
        if (
          total /
            (1 - (await Do(this.ns, "ns.gang.getGangInformation")).territory) >=
            this.clashTarget ||
          Object.keys(chances).every((x) => chances[x] >= this.clashTarget)
        )
          Do(this.ns, "ns.gang.setTerritoryWarfare", true);
      }

      while (
        (await Do(this.ns, "ns.gang.getGangInformation")).power == startPower
      ) {
        await this.ns.asleep(0);
      }
      if (readyToEarn.length + 1 >= members.length) this.ascendMembers();
      loopStop = Date.now();
      Do(this.ns, "ns.gang.setTerritoryWarfare", false);
      let filterMembers: string[] = await Do(this.ns, "ns.gang.getMemberNames");
      filterMembers = this.Game.gangMemberNames.filter(
        (x: string) => !filterMembers.includes(x)
      );
      while (
        filterMembers.length > 0 &&
        (await Do(
          this.ns,
          "ns.gang.recruitMember",
          filterMembers[Math.floor(Math.random() * filterMembers.length)]
        ))
      ) {}
      let memberNames: string[] = await Do(this.ns, "ns.gang.getMemberNames");
      let memberData: { [key: string]: any } = {};
      for (let member of memberNames) {
        memberData[member] = Do(
          this.ns,
          "ns.gang.getMemberInformation",
          member
        )!;
      }
      for (let member of memberNames) {
        memberData[member] = await memberData[member];
        memberData[member]["total"] =
          memberData[member]["str"] +
          memberData[member]["def"] +
          memberData[member]["dex"] +
          memberData[member]["cha"] +
          memberData[member]["hack"];
        memberData[member]["total_exp"] =
          memberData[member]["str_exp"] +
          memberData[member]["def_exp"] +
          memberData[member]["dex_exp"] +
          memberData[member]["cha_exp"] +
          memberData[member]["hack_exp"];
      }
      this.getGear(memberData);
      let minDef = await this.minimumDefense();
      readyToEarn = [];
      Object.keys(memberData).map((x: any) =>
        memberData[x]["cha_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Charisma")!
          : memberData[x]["hack_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Hacking")!
          : memberData[x]["str_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["dex_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["def_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["agi_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : readyToEarn.push(x)
      );
      let letsDoThis: any[] = [];
      let genInfo = await Do(this.ns, "ns.gang.getGangInformation");
      let tD: { [key: string]: any } = {};
      for (let task of taskNames) {
        tD[task] = await Do(this.ns, "ns.gang.getTaskStats", task);
      }

      let gI = await Do(this.ns, "ns.gang.getGangInformation");
      if (
        gI.wantedLevel >= 13 - members.length &&
        gI.wantedPenalty <= 0.87 + 0.01 * members.length
      ) {
        for (let member of readyToEarn) {
          letsDoThis.push([member, "Vigilante Justice", 0, 0]);
        }
      } else {
        for (let member of readyToEarn) {
          let mD = await Do(this.ns, "ns.gang.getMemberInformation", member);
          for (let task of taskNames) {
            letsDoThis.push([
              member,
              task,
              this.ns.formulas.gang.respectGain(genInfo, mD, tD[task]),
              this.ns.formulas.gang.moneyGain(genInfo, mD, tD[task]),
            ]);
          }
        }
      }
      try {
        letsDoThis = letsDoThis.filter(
          (x: any) => memberData[x[0]]["total"] >= 700 || x[1] != "Terrorism"
        );
      } catch {}
      money = await money;
      while (letsDoThis.length > 0) {
        if (!money) {
          letsDoThis = letsDoThis.sort((a: any, b: any) => {
            return -a[2] + b[2];
          });
        } else {
          letsDoThis = letsDoThis.sort((a: any, b: any) => {
            return -a[3] + b[3];
          });
        }
        let meNext: string = letsDoThis[0][0];
        Do(
          this.ns,
          "ns.gang.setMemberTask",
          letsDoThis[0][0],
          letsDoThis[0][1]
        );
        letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
        if (letsDoThis.length > 0) {
          if (!money) {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[2] + b[2];
            });
          } else {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[3] + b[3];
            });
          }
          meNext = letsDoThis[0][0];
          Do(
            this.ns,
            "ns.gang.setMemberTask",
            letsDoThis[0][0],
            letsDoThis[0][1]
          );
          letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
          if (letsDoThis.length > 0) {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[3] + b[3];
            });
            meNext = letsDoThis[0][0];
            Do(
              this.ns,
              "ns.gang.setMemberTask",
              letsDoThis[0][0],
              letsDoThis[0][1]
            );
            letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
          }
        }
      }
      if (0 == (await Do(this.ns, "ns.gang.getBonusTime"))) {
        await this.ns.asleep(
          loopStop + 20500 - 500 * memberNames.length - Date.now()
        );
      }
      money = this.hackAugs();
    }
  }
  async getGear(memberData: { [key: string]: any }) {
    let members: string[] = Object.keys(memberData);
    members.sort((a: any, b: any) => {
      return memberData[a].str_mult - memberData[b].str_mult;
    });
    if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 2) {
      members.map((a: any) =>
        Do(this.ns, "ns.gang.purchaseEquipment", a, "Glock 18C")
      );
    }
    let funds = Math.min(
      (await Do(this.ns, "ns.getMoneySources")).sinceInstall.gang,
      (await Do(this.ns, "ns.getPlayer"))!.money
    );

    let discount = 1;
    // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
    if (
      members.length < 12 ||
      (await Do(this.ns, "ns.fileExists", "SQLInject.exe"))
    ) {
      let equip: string[] = await Do(this.ns, "ns.gang.getEquipmentNames");
      let equipCost: { [key: string]: number } = {};
      let equipStats: { [key: string]: any } = {};
      let equipType: { [key: string]: any } = {};
      for (let x of equip) {
        equipCost[x] = await Do(this.ns, "ns.gang.getEquipmentCost", x);
        equipStats[x] = await Do(this.ns, "ns.gang.getEquipmentStats", x);
        equipType[x] = await Do(this.ns, "ns.gang.getEquipmentType", x);
      }
      if ((await Do(this.ns, "ns.gang.getGangInformation")).territory > 0.98) {
        equip = equip.sort((a: any, b: any) => equipCost[b] - equipCost[a]);
      } else {
        equip = equip.sort(
          (a: any, b: any) => equipStats[b]["cha"] - equipStats[a]["cha"]
        );
        equip = equip.sort(
          (a: any, b: any) => equipStats[b]["str"] - equipStats[a]["str"]
        );
      }
      for (let j = 0; j < equip.length; j++) {
        for (let i of members) {
          let total = Math.min(
            memberData[i].str,
            memberData[i].dex,
            memberData[i].def,
            memberData[i].cha,
            memberData[i]["hack"]
          );
          // Buy the good stuff only once the terrorism stats are over 700.
          if (
            equipType[equip[j]] == "Augmentation" &&
            (await Do(this.ns, "ns.gang.purchaseEquipment", i, equip[j]))
          ) {
            this.ns.toast(i + " now owns " + equip[j]);
            memberData[i] = await Do(
              this.ns,
              "ns.gang.getMemberInformation",
              i
            );
          }
          if (
            (total >= 140 || members.length < 12) &&
            equipCost[equip[j]] < funds / discount &&
            (await Do(this.ns, "ns.gang.purchaseEquipment", i, equip[j]))
          ) {
            this.ns.toast(i + " now owns " + equip[j]);
            funds -= equipCost[equip[j]] / discount;
            memberData[i] = await Do(
              this.ns,
              "ns.gang.getMemberInformation",
              i
            );
          } else {
            if (
              await Do(this.ns, "ns.gang.purchaseEquipment", i, "Glock 18C")
            ) {
              this.ns.toast(i + " now owns Glock 18C");
              funds -= equipCost["Glock 18C"] / discount;
              memberData[i] = await Do(
                this.ns,
                "ns.gang.getMemberInformation",
                i
              );
            }
          }
        }
      }
    }
  }
  async ascendMembers() {
    let members: string[] = await Do(this.ns, "ns.gang.getMemberNames");
    let memberData: { [key: string]: any } = {};
    for (let member of members) {
      memberData[member] = await Do(
        this.ns,
        "ns.gang.getMemberInformation",
        member
      );
    }
    let gangInfo = await Do(this.ns, "ns.gang.getGangInformation");
    let avgrespect =
      members
        .map((x: any) => memberData[x].earnedRespect)
        .reduce((a: any, b: any) => a + b, 0) / members.length;
    if (avgrespect >= 0) {
      let ascendable = [...members];
      ascendable = ascendable.filter((x) =>
        ["hack_exp", "str_exp", "def_exp", "dex_exp", "agi_exp", "cha_exp"]
          .map((y) => memberData[x][y] > 1000)
          .reduce((a, b) => a || b)
      );
      let ascResult: { [key: string]: any } = {};
      for (let member of ascendable) {
        ascResult[member] = await Do(
          this.ns,
          "ns.gang.getAscensionResult",
          member
        );
      }
      let check: { [key: string]: number } = {};
      if (gangInfo.territory > 0.98) {
        ascendable.forEach(
          (x) =>
            (check[x] =
              1.66 - 0.62 / Math.exp((2 / memberData[x].cha_asc_mult) ** 2.24))
        );
        ascendable = ascendable.filter((x) => check[x] < ascResult[x]["cha"]);
      } else {
        ascendable.forEach(
          (x) =>
            (check[x] =
              1.66 - 0.62 / Math.exp((2 / memberData[x].str_asc_mult) ** 2.24))
        );
        ascendable = ascendable.filter((x) => check[x] < ascResult[x]["str"]);
      }
      ascendable = ascendable.filter(
        (x) => memberData[x].earnedRespect < avgrespect
      );
      ascendable.sort((a, b) => check[b] - check[a]);
      if (ascendable.length > 0) {
        for (let k = 0; k < ascendable.length; k++) {
          if (await Do(this.ns, "ns.gang.ascendMember", ascendable[k])) {
            this.ns.toast(ascendable[k] + " ascended!");
            k = 1000;
          }
        }
      }
    }
  }
}

export class Augmentations {
  ns: NS;
  Game: WholeGame;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
  }
  async augList() {
    let augs: any = [];
    let factionList = [
      "CyberSec",
      "NiteSec",
      "The Black Hand",
      "Tian Di Hui",
      "BitRunners",
      "Sector-12",
      "Aevum",
      "Volhaven",
      "Ishima",
      "New Tokyo",
      "Chongqing",
      "Bachman & Associates",
      "Blade Industries",
      "Four Sigma",
      "Clarke Incorporated",
      "OmniTek Incorporated",
      "KuaiGong International",
      "Fulcrum Secret Technologies",
      "ECorp",
      "MegaCorp",
      "NWO",
      "Slum Snakes",
      "Tetrads",
    ];
    if (2 <= (await Do(this.ns, "ns.getPlayer"))!.mults["strength"]) {
      if (2 <= (await Do(this.ns, "ns.getPlayer"))!.mults["defense"]) {
        if (2 <= (await Do(this.ns, "ns.getPlayer"))!.mults["dexterity"]) {
          if (2 <= (await Do(this.ns, "ns.getPlayer"))!.mults["agility"]) {
            factionList = factionList.concat(["The Syndicate"]);
          }
        }
      }
    }
    if (3 <= (await Do(this.ns, "ns.getPlayer"))!.mults["strength"]) {
      if (3 <= (await Do(this.ns, "ns.getPlayer"))!.mults["defense"]) {
        if (3 <= (await Do(this.ns, "ns.getPlayer"))!.mults["dexterity"]) {
          if (3 <= (await Do(this.ns, "ns.getPlayer"))!.mults["agility"]) {
            factionList = factionList.concat([
              "Speakers for the Dead",
              "The Dark Army",
            ]);
          }
        }
      }
    }
    if (8.5 <= (await Do(this.ns, "ns.getPlayer"))!.mults["strength"]) {
      if (8.5 <= (await Do(this.ns, "ns.getPlayer"))!.mults["defense"]) {
        if (8.5 <= (await Do(this.ns, "ns.getPlayer"))!.mults["dexterity"]) {
          if (8.5 <= (await Do(this.ns, "ns.getPlayer"))!.mults["agility"]) {
            if (8.5 <= (await Do(this.ns, "ns.getPlayer"))!.mults["hacking"]) {
              if (
                20 <=
                (await Do(this.ns, "ns.singularity.getOwnedAugmentations"))!
                  .length
              ) {
                factionList = factionList.concat(["The Covenant"]);
              }
            }
          }
        }
      }
    }
    if (12 <= (await Do(this.ns, "ns.getPlayer"))!.mults["strength"]) {
      if (12 <= (await Do(this.ns, "ns.getPlayer"))!.mults["defense"]) {
        if (12 <= (await Do(this.ns, "ns.getPlayer"))!.mults["dexterity"]) {
          if (12 <= (await Do(this.ns, "ns.getPlayer"))!.mults["agility"]) {
            if (15 <= (await Do(this.ns, "ns.getPlayer"))!.mults["hacking"]) {
              if (
                30 <=
                (await Do(this.ns, "ns.singularity.getOwnedAugmentations"))!
                  .length
              ) {
                factionList = factionList.concat(["Illuminati"]);
              }
            }
          }
        }
      }
    }
    if (15 <= (await Do(this.ns, "ns.getPlayer"))!.mults["strength"]) {
      if (15 <= (await Do(this.ns, "ns.getPlayer"))!.mults["defense"]) {
        if (15 <= (await Do(this.ns, "ns.getPlayer"))!.mults["dexterity"]) {
          if (15 <= (await Do(this.ns, "ns.getPlayer"))!.mults["agility"]) {
            if (
              30 <=
              (await Do(this.ns, "ns.singularity.getOwnedAugmentations"))!
                .length
            ) {
              factionList = factionList.concat(["Daedalus"]);
              if (
                !(await Do(
                  this.ns,
                  "ns.singularity.getOwnedAugmentations"
                ))!.includes("The Red Pill")
              ) {
                factionList = ["Daedalus"];
              }
            }
          }
        }
      }
    }
    if (10 <= (await Do(this.ns, "ns.getPlayer"))!.mults["hacking"]) {
      if (
        30 <=
        (await Do(this.ns, "ns.singularity.getOwnedAugmentations"))!.length
      ) {
        factionList = factionList.concat(["Daedalus"]);
        if (
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations"
          ))!.includes("The Red Pill")
        ) {
          factionList = ["Daedalus"];
        }
      }
    }
    if ((await Do(this.ns, "ns.getPlayer"))!.factions.includes("Daedalus")) {
      factionList = factionList.concat(["Daedalus"]);
    }
    if (!(await Do(this.ns, "ns.getServer", "fulcrumassets"))!.isBackdoored) {
      factionList = factionList.filter((x: any) => {
        return x != "Fulcrum Secret Technologies";
      });
    }
    if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2) {
      factionList = ["CyberSec", this.Game.gangToJoin];
    }
    for (let faction of factionList) {
      for (let aug of await Do(
        this.ns,
        "ns.singularity.getAugmentationsFromFaction",
        faction
      )) {
        augs = augs.concat([
          [
            1,
            faction,
            aug,
            await Do(this.ns, "ns.singularity.getAugmentationPrice", aug),
            await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug),
            (await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug)!) -
              (await Do(this.ns, "ns.singularity.getFactionRep", faction)),
            await Do(this.ns, "ns.singularity.getAugmentationStats", aug),
          ],
        ]);
        for (let stat of [
          "hacking_chance",
          "hacking_speed",
          "hacking_money",
          "hacking_grow",
          "hacking",
          "hacking_exp",
          "charisma",
          "charisma_exp",
          "faction_rep",
          "company_rep",
        ]) {
          augs[augs.length - 1][0] *= augs[augs.length - 1][6][stat];
          if (augs[augs.length - 1][2] == "Neuroreceptor Management Implant") {
            augs[augs.length - 1][0] = 1.22;
          }
          if (augs[augs.length - 1][2] == "The Red Pill") {
            augs[augs.length - 1][0] = 0.5;
          }
          if (
            [
              "Bachman & Associates",
              "ECorp",
              "MegaCorp",
              "Blade Industries",
              "NWO",
              "Clarke Incorporated",
              "OmniTek Incorporated",
              "Four Sigma",
              "KuaiGong International",
              "Fulcrum Secret Technologies",
            ].includes(faction)
          ) {
            augs[augs.length - 1][5] *= 2;
          }
          if (["Fulcrum Secret Technologies"].includes(faction)) {
            augs[augs.length - 1][5] *= 2;
          }
          augs[augs.length - 1][5] /=
            (100 +
              (await Do(
                this.ns,
                "ns.singularity.getFactionFavor",
                augs[augs.length - 1][1]
              ))!) /
            100;
        }
      }
    }
    augs = augs.filter((x: any) => x[0] > 1 || x[2] == "The Red Pill");
    let i = 0;
    while (i < augs.length) {
      if (
        (await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          "true"
        ))!.includes(augs[i][2])
      ) {
        augs.splice(i, 1);
      } else {
        i += 1;
      }
    }
    augs = augs.sort((a: any, b: any) => {
      return a[5] - b[5];
    });
    let currentFactions = (await Do(this.ns, "ns.getPlayer"))!.factions;
    if (currentFactions.includes("Volhaven")) {
      augs = augs.filter((x: string) => x[1] != "Sector-12");
      augs = augs.filter((x: string) => x[1] != "Aevum");
      augs = augs.filter((x: string) => x[1] != "Chongqing");
      augs = augs.filter((x: string) => x[1] != "New Tokyo");
      augs = augs.filter((x: string) => x[1] != "Ishima");
    }
    if (
      currentFactions.includes("Sector-12") ||
      currentFactions.includes("Aevum")
    ) {
      augs = augs.filter((x: string) => x[1] != "Volhaven");
      augs = augs.filter((x: string) => x[1] != "Chongqing");
      augs = augs.filter((x: string) => x[1] != "New Tokyo");
      augs = augs.filter((x: string) => x[1] != "Ishima");
    }
    if (
      currentFactions.includes("Ishima") ||
      currentFactions.includes("New Tokyo") ||
      currentFactions.includes("Chongqing")
    ) {
      augs = augs.filter((x: string) => x[1] != "Volhaven");
      augs = augs.filter((x: string) => x[1] != "Sector-12");
      augs = augs.filter((x: string) => x[1] != "Aevum");
    }
    if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2) {
      augs = augs.filter(
        (x: string) => x[1] == "CyberSec" || x[1] == this.Game.gangToJoin
      );
    }
    return augs;
  }
}

export class Charts {
  ns: NS;
  constructor(ns: any) {
    this.ns = ns;
  }
  async augList() {
    for (let group of Object.keys(FACTIONS2)) {
      for (let faction of FACTIONS2[group]) {
        for (let joinReq of await Do(
          this.ns,
          "ns.singularity.getFactionInviteRequirements",
          faction
        )) {
          this.ns.tprint(faction, " ", joinReq);
        }
        for (let aug of await Do(
          this.ns,
          "ns.singularity.getAugmentationsFromFaction",
          faction
        )) {
          this.ns.tprint(faction, " ", aug);
        }
        await this.ns.asleep(0);
      }
    }
  }
}

/*
export async function batcher(Game: WholeGame): Promise<void> {
    let ns = Game.ns;
    let gap = .005 * 1000;
    let servers:string[] = ["home"];
    for (let i = 0 ; i < servers.length ; i++) {
        servers = servers.concat(await Do(ns, "ns.scan", servers[i])).filter(x => !servers.includes(x));
    }
    ns.write("/temp/bhack.js", 'export async function main(ns) {await ns.hack(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bgrow.js", 'export async function main(ns) {await ns.grow(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bweaken.js", 'export async function main(ns) {await ns.weaken(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bshare.js", 'export async function main(ns) {await ns.share()}', 'w');
    for (let server of servers) {
        if (server != 'home') {
            await Do(ns, "ns.scp", ['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], server);
        }
    }

    let allservers = [...servers];
    let i = 0;
    while (i < servers.length) {
        if ((await Do(ns, "ns.getPurchasedServers")).includes(servers[i])) {
            servers.splice(i);
        } else {
            i += 1;
        }
    }
    i = 0;
    while (i < servers.length) {
        if ((await Do(ns, "ns.getServerMaxMoney", servers[i])) <= 0) {
            servers.splice(i);
        } else {
            i += 1;
        }
    }
    let percentage = 90;
    let initialized = false;
    let oldtarget = "";
    while (!await Do(ns, "ns.hasRootAccess", "n00dles")) {
        await ns.asleep(1000);
    }
    while (true) {
        let hackable = [...servers];
        i = 0;
        while (i < hackable.length) {
            if ((await Do(ns, "ns.getServerRequiredHackingLevel", hackable[i])) * 2 < (await Do(ns, "ns.getPlayer"))['skills']['hacking']) {
                hackable.splice(i);
            } else {
                i += 1;
            }
        }
        i = 0;
        while (i < hackable.length) {
            if (!(await Do(ns, "ns.hasRootAccess", hackable[i]))) {
                hackable.splice(i);
            } else {
                i += 1;
            }
        }
        let sortArray:any[] = [];
        i = 0;
        while (i < hackable.length) {
            sortArray.push([(await Do(ns, "ns.getServerGrowth", hackable[i])) * (await Do(ns, "ns.getServerMaxMoney", hackable[i])) / (await Do(ns, "ns.getHackTime", hackable[i])) ** 2, hackable[i]]);
            i += 1;
        }
        hackable = hackable.sort((a:any, b:any) => {return a[0] - b[0]});
        let target = hackable[hackable.length - 1];
        target ??= "n00dles";
        if (oldtarget != target) {
            initialized = false;
            ns.tprint("! ",target);
            oldtarget = target;
            for (let i = 0 ; i < servers.length ; i++) {
                servers = servers.concat(ns.scan(servers[i]).filter(x => !servers.includes(x)))
            }
            for (let server of servers) {
                if (server != 'home') {
                    ns.scp(['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], server);
                }
            }
        
            allservers = [...servers];
            servers = servers.filter(x => !ns.getPurchasedServers().includes(x)).filter(x => ns.getServerMaxMoney(x) > 0);
        }
        if (ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target) && ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
            initialized = true;
        }

        let hackThreads = Math.max(1, Math.floor((percentage/100) / ns.hackAnalyze(target)));
        let w1Threads = Math.max(1, Math.ceil(.002 * hackThreads / .05));
        let growThreads = Math.max(1, Math.ceil(1.5*ns.growthAnalyze(target, 1.0 / (1 - percentage / 100.0))));
        let securityIncrease = ns.growthAnalyzeSecurity(growThreads);
        let w2Threads = Math.max(1, Math.ceil(securityIncrease / .05));
        w1Threads = 2 * Math.max(w1Threads, w2Threads);
        w2Threads = Math.max(w1Threads, w2Threads);
        let times = [ns.getHackTime(target), ns.getHackTime(target) * 4, ns.getHackTime(target) * 5];
        let start = Date.now();
        let runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
            await ns.asleep(0);
        }
        while (0 == (ns.exec('/temp/bweaken.js', runServer, w1Threads, target as string, 0) as Number)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
//        ns.tprint(runServer + " =W1> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        let grew = false;
        if (ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target)) {
            grew = true;
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            while (0 == ns.exec('/temp/bgrow.js', runServer, growThreads, target as string, times[0])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
            await ns.asleep(0);
        }
        while (0 == ns.exec('/temp/bweaken.js', runServer, w2Threads, target as string, 0)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        }
//        ns.tprint(runServer + " =W2> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        if (grew && ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target) && ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            while (0 == ns.exec('/temp/bhack.js', runServer, hackThreads, target as string, times[1])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
//            ns.tprint(runServer + " =H> " + target);
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        ns.exec('/temp/bshare.js', runServer, Math.max(growThreads, w1Threads, w2Threads, hackThreads), target as string, times[1]);
        start = Date.now();
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
    }
}
*/
export async function bootstrap8gb(Game: WholeGame): Promise<void> {
  let ns = Game.ns;
  ns.write(
    "/temp/weaken.js",
    `export async function main(ns) {await ns.weaken(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/grow.js",
    `export async function main(ns) {await ns.grow(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/hack.js",
    `export async function main(ns) {await ns.hack(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/share.js",
    `export async function main(ns) {while (true) {await ns.share(ns.args[0]);}}`,
    `w`
  );
  if ((await Do(ns, "ns.getServerMaxRam", "home")) >= 64) {
    ns.run("batcher.js", { preventDuplicates: true, temporary: true });
    await ns.asleep(10000);
    return;
  }
  let targets = new Servers(Game);
  while (!targets.initialized) {
    await ns.asleep(1);
  }
  let target = "home";
  for (let server of targets.servers) {
    if (await Do(ns, "ns.hasRootAccess", server.name)) {
      if (
        ((await Do(
          ns,
          "ns.getServerRequiredHackingLevel",
          server.name
        )) as number) *
          2 <=
        (((await Do(ns, "ns.getPlayer")) as Player).skills.hacking as number)
      ) {
        if (
          (((await Do(ns, "ns.getServerMaxMoney", target)) as number) /
            ((await Do(ns, "ns.getWeakenTime", target)) as number)) *
            ((await Do(ns, "ns.getServer", target))! as Server)!.serverGrowth! <
          (((await Do(ns, "ns.getServerMaxMoney", server.name)) as number) /
            ((await Do(ns, "ns.getWeakenTime", server.name)) as number)) *
            ((await Do(ns, "ns.getServer", server.name)!)! as Server)
              .serverGrowth!
        ) {
          if (server.name != "n00dles") {
            target = server.name;
          }
        }
      }
    }
  }
  if (target == "home") {
    target = "n00dles";
  }
  await ns.asleep(0);
  let pids: number[] = [];
  let sharepids: number[] = [];
  ns.tprint(target);
  ns.tprint(
    (await Do(ns, "ns.getServerSecurityLevel", target))!.toString() +
      "/" +
      (await Do(ns, "ns.getServerMinSecurityLevel", target))!.toString()
  );
  ns.tprint(
    (await Do(ns, "ns.getServerMoneyAvailable", target))!.toString() +
      "/" +
      (await Do(ns, "ns.getServerMaxMoney", target))!.toString()
  );

  await ns.asleep(0);
  let amHacking = false;
  if (
    (await Do(ns, "ns.getServerSecurityLevel", target))! >
    (await Do(ns, "ns.getServerMinSecurityLevel", target))!
  ) {
    for (let server of targets.servers) {
      if (server.name != "home") {
        if (await Do(ns, "ns.hasRootAccess", server.name)) {
          await Do(ns, "ns.scp", "/temp/weaken.js", server.name, "home");
          await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
          await Do(ns, "ns.scp", "/temp/hack.js", server.name, "home");
        }
        let threads = Math.floor(
          (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
            ((await Do(ns, "ns.getServerUsedRam", server.name)) as number))! /
            1.75
        );
        if (server.name == "home") {
          threads -= 21;
        }
        if (threads > 0) {
          pids = pids.concat(
            (await Do(
              ns,
              "ns.exec",
              "/temp/weaken.js",
              server.name,
              threads,
              target
            )) as number
          );
        }
      }
    }
    let threads = Math.floor(
      (((await Do(ns, "ns.getServerMaxRam", "home")) as number)! -
        ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75
    );
    threads -= 21;
    if (threads > 0) {
      await DoMore(ns, threads, "await ns.weaken", target);
    }
  } else {
    if (
      (await Do(ns, "ns.getServerMoneyAvailable", target))! <
      (await Do(ns, "ns.getServerMaxMoney", target))!
    ) {
      Game.growCount -= 1;
      for (let server of targets.servers) {
        if (server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
          }
          let threads = Math.floor(
            (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
              ((await Do(ns, "ns.getServerUsedRam", server.name)) as number))! /
              1.75
          );
          if (server.name == "home") {
            threads -= 21;
          }
          if (threads > 0) {
            pids = pids.concat(
              (await Do(
                ns,
                "ns.exec",
                "/temp/grow.js",
                server.name,
                threads,
                target
              )) as number
            );
          }
        }
      }
      await ns.asleep(0);
      let threads = Math.floor(
        (((await Do(ns, "ns.getServerMaxRam", "home")) as number)! -
          ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75
      );
      threads -= 21;
      if (threads > 0) {
        await DoMore(ns, threads, "await ns.grow", target);
      }
    } else {
      Game.growCount *= -1;
      let best = "home";
      for (let server of targets.servers) {
        if (server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/hack.js", server.name, "home");
            if (
              (await Do(ns, "ns.getServerMaxRam", best))! -
                (await Do(ns, "ns.getServerUsedRam", best))! -
                (best == "home" ? 21 * 1.85 : 0) <
              (await Do(ns, "ns.getServerMaxRam", server.name))! -
                (await Do(ns, "ns.getServerUsedRam", server.name))!
            ) {
              best = server.name;
            }
          }
        }
      }
      ns.tprint("Hacking from " + best);
      let threads = Math.floor(
        (((await Do(ns, "ns.getServerMaxRam", best)) as number) -
          ((await Do(ns, "ns.getServerUsedRam", best)) as number))! / 1.75
      );
      if (best == "home") {
        threads -= 21;
      }
      if (threads > 0) {
        pids = pids.concat(
          (await Do(
            ns,
            "ns.exec",
            "/temp/hack.js",
            best,
            threads,
            target
          )) as number
        );
      }
      for (let server of targets.servers) {
        if (server.name != best && server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/share.js", server.name, "home");
            threads = Math.floor(
              (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
                ((await Do(
                  ns,
                  "ns.getServerUsedRam",
                  server.name
                )) as number))! / 4
            );
            if (server.name == "home") {
              threads -= 21;
            }
            if (threads > 0) {
              sharepids = sharepids.concat(
                (await Do(
                  ns,
                  "ns.exec",
                  "/temp/share.js",
                  server.name,
                  threads,
                  target
                )) as number
              );
            }
          }
        }
      }

      amHacking = true;
    }
  }
  pids = pids.filter((x: any) => {
    return x != 0;
  });
  while (pids.length > 0) {
    while (await Do(ns, "ns.isRunning", pids[0])) {
      await ns.asleep(100);
    }
    pids.shift();
  }
  while (sharepids.length > 0) {
    Do(ns, "ns.kill", sharepids[0]);
    sharepids.shift();
  }
  await ns.asleep(0);
  if (amHacking) {
    Game.growCount = 0;
  }
}

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

export function getTruePlayer() {
  return eval(
    `var hopefulPlayer = undefined; globalThis.webpack_require ?? webpackChunkbitburner.push([[-1], {}, w => globalThis.webpack_require = w]); Object.keys(webpack_require.m).forEach(k => Object.values(webpack_require(k)).forEach(p => hopefulPlayer = p?.whoAmI?.() == "Player" ? p : hopefulPlayer)); hopefulPlayer`
  );
}

// dev menu
// /** @param {NS} ns */
// export async function main(ns) {
//    globalThis.webpack_require ?? webpackChunkbitburner.push([[-1], {}, w => globalThis.webpack_require = w]);
//    Object.keys(webpack_require.m).forEach(k => Object.values(webpack_require(k)).forEach(p => p?.toPage?.('Dev')));
//  }

export class Factions {
  Game: WholeGame;
  ns: NS;
  initialized: boolean;
  augs: Map<string, string[]>;
  log: any;
  display: any;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.initialized = false;
    this.augs = new Map<string, string[]>();
    this.log = {};
    this.display = {};
    for (let faction of FACTIONS) {
      if (
        ![
          "Sector-12",
          "Aevum",
          "Ishima",
          "Chongqing",
          "Volhaven",
          "New Tokyo",
        ].includes(faction)
      ) {
        this.eventuallyJoin(faction);
      }
    }
  }
  async eventuallyJoin(factionName: string) {
    while (
      !(await Do(this.ns, "ns.getPlayer"))!.factions.includes(factionName)
    ) {
      if (
        (await Do(this.ns, "ns.singularity.checkFactionInvitations"))!.includes(
          factionName
        )
      ) {
        await Do(this.ns, "ns.singularity.joinFaction", factionName);
      } else {
        await this.ns.asleep(60000);
      }
    }
  }
  async displayLoop() {
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".factionbox");
    this.log ??= this.Game.createSidebarItem("Faction", "", "F", "factionbox");
    this.display = this.Game.sidebar
      .querySelector(".factionbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    await this.ns.asleep(0);
    while (true) {
      let table = "<TABLE BORDER=1 WIDTH=100% CELLPADDING=0 CELLSPACING=0>";
      let rows: any[] = [];
      for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
        rows.push([
          await Do(this.ns, "ns.singularity.getFactionRep", faction),
          faction,
          await Do(this.ns, "ns.singularity.getFactionFavor", faction),
        ]);
      }
      rows.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      for (let row of rows) {
        table +=
          "<TR><TD>" +
          row[1] +
          "</TD><TD ALIGN=RIGHT>" +
          jFormat(row[0]) +
          "</TD><TD ALIGN=RIGHT>" +
          jFormat(row[2]) +
          "</TD></TR>";
      }
      this.display.innerHTML = table + "</TABLE>";
      this.log.recalcHeight();
      await this.ns.asleep(60000);
    }
  }
  async initialize(ns: NS) {
    this.displayLoop();
    while (true) {
      this.initialized = false;
      while (
        !(await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          false
        ))!.includes("The Red Pill") &&
        (await this.Game.augmentations.augList()).length == 0
      ) {
        this.initialized = true;
        if (
          (await Do(ns, "ns.singularity.checkFactionInvitations"))!.includes(
            "Daedalus"
          )
        ) {
          await Do(ns, "ns.singularity.joinFaction", "Daedalus");
        }
        await ns.asleep(1000);
      }
      let augList = await this.Game.augmentations.augList();
      if (augList.length == 0) {
        this.initialized = true;
        await ns.asleep(1000);
        await this.factionJoin("CyberSec");
        while (
          await Do(
            ns,
            "ns.singularity.purchaseAugmentation",
            "CyberSec",
            "NeuroFlux Governor"
          )
        ) {
          await ns.asleep(0);
        }
      }
      let i = 0;
      await ns.asleep(1000);
      while (i < augList.length) {
        let prereqs = await Do(
          this.ns,
          "ns.singularity.getAugmentationPrereq",
          augList[i][2]
        );
        let good = true;
        let j = 0;
        let alreadyOwned = (await Do(
          this.ns,
          "ns.singularity.getOwnedAugmentations",
          true
        ))!;
        while (j < prereqs.length) {
          if (!alreadyOwned.includes(prereqs[j])) {
            good = false;
          }
          j += 1;
        }
        if (!good) {
          augList.splice(i, 1);
        } else {
          i += 1;
        }
      }
      while (augList.length > 0) {
        if (
          (await Do(ns, "ns.singularity.checkFactionInvitations"))!.includes(
            "Daedalus"
          )
        ) {
          await Do(ns, "ns.singularity.joinFaction", "Daedalus");
        }
        while (
          augList.length > 0 &&
          Math.max(
            augList.filter((x: any) => x[1] == augList[1]).map((x: any) => x[4])
          ) > (await Do(this.ns, "ns.singularity.getFactionRep", augList[0][1]))
        ) {
          augList = augList.filter((x: any) => x[1] != augList[0][1]);
        }
        if (augList.length > 0) {
          let firstFactionD: any = augList;
          while (firstFactionD.length > 0 && firstFactionD[0][5] < 0) {
            firstFactionD = firstFactionD.filter(
              (x: any) => x[2] != firstFactionD[0][2]
            );
          }
          if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2) {
            firstFactionD = firstFactionD.filter(
              (x: any) => x[1] == "CyberSec"
            );
          }
          if (await Do(this.ns, "ns.gang.inGang")) {
            let myGang = (await Do(this.ns, "ns.gang.getGangInformation"))
              .faction;
            firstFactionD = firstFactionD.filter((x: any) => x[1] != myGang);
          }
          if (firstFactionD.length == 0) {
            firstFactionD = [["1", "CyberSec"]];
          }
          let firstFaction: string = firstFactionD[0][1];
          ns.toast(firstFaction);
          this.initialized = true;
          await this.factionJoin(firstFaction);
          await ns.asleep(60000);
//          await Do(this.ns, "ns.exec", "noodles.js", "home", {preventDuplicates:true});
          augList = await this.Game.augmentations.augList();
          i = 0;
          while (i < augList.length) {
            let prereqs = await Do(
              this.ns,
              "ns.singularity.getAugmentationPrereq",
              augList[i][2]
            );
            let good = true;
            let j = 0;
            let alreadyOwned = (await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              true
            ))!;
            while (j < prereqs.length) {
              if (!alreadyOwned.includes(prereqs[j])) {
                good = false;
              }
              j += 1;
            }
            if (!good) {
              augList.splice(i, 1);
            } else {
              i += 1;
            }
          }
          Do(this.ns, "ns.singularity.stopAction");
          await ns.asleep(0);
        } else {
          await ns.asleep(10000);
        }
      }
    }
  }

  async factionJoin(firstFaction: string) {
    if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2) {
      firstFaction = "CyberSec";
    }
    let augList = await Do(
      this.ns,
      "ns.singularity.getAugmentationsFromFaction",
      firstFaction
    );
    let i = 0;
    let money = 0;
    while (i < augList.length) {
      if (
        (await Do(
          this.ns,
          "ns.singularity.getAugmentationRepReq",
          augList[i]
        )) < (await Do(this.ns, "ns.singularity.getFactionRep", firstFaction))
      )
        if (
          (await Do(this.ns, "ns.getPlayer")).money <
          (await Do(this.ns, "ns.singularity.getAugmentationPrice", augList[i]))
        )
          await this.Game.crime.getMoney(
            await Do(this.ns, "ns.singularity.getAugmentationPrice", augList[i])
          );
      i += 1;
    }
    this.ns.write("factions.txt", firstFaction, 'w');
    switch (firstFaction) {
      case "CyberSec":
      case "NiteSec":
      case "The Black Hand":
      case "BitRunners":
        while (
          !(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)
        ) {
          await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
          await this.ns.asleep(1000);
        }
        while (await Do(this.ns, "ns.singularity.isBusy")) {
          await this.ns.asleep(1000);
        }
        await Do(
          this.ns,
          "ns.singularity.workForFaction",
          firstFaction,
          "Hacking",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        break;
      case "Sector-12":
      case "Aevum":
      case "Volhaven":
      case "Ishima":
      case "New Tokyo":
      case "Chongqing":
      case "Tian Di Hui":
        while (
          !(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)
        ) {
          await this.Game.traveling.assertLocation(
            firstFaction == "Tian Di Hui" ? "New Tokyo" : firstFaction
          );
          await this.Game.crime.getMoney(
            {
              "Tian Di Hui": 1e6,
              "Sector-12": 15e6,
              Chongqing: 20e6,
              "New Tokyo": 20e6,
              Aevum: 40e6,
              Volhaven: 50e6,
              Ishima: 30e6,
            }[firstFaction]
          );
          await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
          await this.ns.asleep(1000);
        }
        while (await Do(this.ns, "ns.singularity.isBusy")) {
          await this.ns.asleep(1000);
        }
        await Do(
          this.ns,
          "ns.singularity.workForFaction",
          firstFaction,
          "Hacking",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        break;
      case "ECorp":
      case "MegaCorp":
      case "KuaiGong International":
      case "Four Sigma":
      case "NWO":
      case "Blade Industries":
      case "OmniTek Incorporated":
      case "Bachman & Associates":
      case "Clarke Incorporated":
      case "Fulcrum Technologies":
      case "Fulcrum Secret Technologies":
        await this.Game.jobs.unlockFaction(firstFaction);
        while (await Do(this.ns, "ns.singularity.isBusy")) {
          await this.ns.asleep(1000);
        }
        await Do(
          this.ns,
          "ns.singularity.workForFaction",
          firstFaction,
          "Hacking",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        break;
      case "Daedalus":
        await Do(
          this.ns,
          "ns.singularity.workForFaction",
          firstFaction,
          "Hacking",
          !(await Do(
            this.ns,
            "ns.singularity.getOwnedAugmentations",
            false
          ))!.includes("Neuroreceptor Management Implant")
        );
        break;
      case "Slum Snakes":
      case "Tetrads":
      case "Speakers for the Dead":
      case "The Dark Army":
      case "The Syndicate":
      case "The Covenant":
      case "Illuminati":
        let i = 0;
        while (
          i <=
          {
            "Slum Snakes": 30,
            "Speakers for the Dead": 300,
            "The Dark Army": 300,
            Tetrads: 75,
            "The Syndicate": 200,
            "The Covenant": 850,
            Illuminati: 1500,
          }[firstFaction]
        ) {
          await this.Game.collegegym.raiseStrength(i);
          await this.Game.collegegym.raiseDefense(i);
          await this.Game.collegegym.raiseDexterity(i);
          await this.Game.collegegym.raiseAgility(i);
          i += 1;
        }
        await this.Game.collegegym.raiseHacking(
          {
            "Slum Snakes": 0,
            "The Dark Army": 300,
            "Speakers for the Dead": 100,
            Tetrads: 0,
            "The Syndicate": 200,
            "The Covenant": 850,
            Illuminati: 1200,
          }[firstFaction]
        );
        await this.Game.crime.lowerKarma(
          {
            "Slum Snakes": -9,
            "The Dark Army": -45,
            "Speakers for the Dead": -45,
            Tetrads: -18,
            "The Syndicate": -90,
            Illuminati: 0,
            "The Covenant": 0,
          }[firstFaction]
        );
        while (
          (await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled <
          {
            "Slum Snakes": 0,
            "The Dark Army": 5,
            "Speakers for the Dead": 45,
            Tetrads: 0,
            "The Syndicate": 0,
            Illuminati: 0,
            "The Covenant": 0,
          }[firstFaction]
        ) {
          await this.Game.crime.hereIGoKillingAgain(
            {
              "Slum Snakes": 0,
              "The Dark Army": 5,
              "Speakers for the Dead": 45,
              Tetrads: 0,
              "The Syndicate": 0,
              Illuminati: 0,
              "The Covenant": 0,
            }[firstFaction]
          );
        }
        await this.Game.crime.getMoney(
          {
            "Slum Snakes": 1e6,
            Tetrads: 0,
            Silhouette: 15e6,
            "Speakers for the Dead": 0,
            "The Dark Army": 0,
            "The Syndicate": 10e6,
            Illuminati: 150e9,
            "The Covenant": 75e9,
          }[firstFaction]
        );
        if (firstFaction === "The Dark Army" || firstFaction === "Tetrads") {
          await this.Game.traveling.assertLocation("Chongqing");
        }
        if (firstFaction === "The Syndicate") {
          await this.Game.traveling.assertLocation("Sector-12");
        }
        await this.Game.crime.getMoney(
          {
            "Slum Snakes": 1e6,
            Tetrads: 0,
            Silhouette: 15e6,
            "Speakers for the Dead": 0,
            "The Dark Army": 0,
            "The Syndicate": 10e6,
            Illuminati: 150e9,
            "The Covenant": 75e9,
          }[firstFaction]
        );
        while (
          !(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)
        ) {
          await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
          await this.ns.asleep(1000);
        }
        while (await Do(this.ns, "ns.singularity.isBusy")) {
          await this.ns.asleep(1000);
        }
        if (firstFaction == "The Syndicate") {
          await Do(
            this.ns,
            "ns.singularity.workForFaction",
            firstFaction,
            "Hacking",
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        } else {
          await Do(
            this.ns,
            "ns.singularity.workForFaction",
            firstFaction,
            "Field Work",
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        }
        break;
      default:
    }
  }
}

export class AugChart {
  ns: NS;
  data: { [key: string]: any };
  initialized: boolean;
  factions: string[];
  augs: Set<string>;
  stats: Set<string>;
  augfilter: string[];
  constructor(
    ns: NS,
    factset = [
      "CyberSec",
      "Tian Di Hui",
      "NiteSec",
      "The Black Hand",
      "BitRunners",
      "Daedalus",
    ],
    augfilter: string[] = []
  ) {
    this.ns = ns;
    this.initialized = false;
    this.data = {};
    this.factions = factset;
    this.augs = new Set();
    this.stats = new Set();
    this.augfilter = augfilter;
    this.initialize();
  }
  async initialize() {
    for (let faction of this.factions) {
      this.data[faction] = await Do(
        this.ns,
        "ns.singularity.getAugmentationsFromFaction",
        faction
      );
      for (let aug of this.data[faction]) {
        if (
          !(await Do(this.ns, "ns.singularity.getOwnedAugmentations")).includes(
            aug
          )
        )
          this.augs.add(aug);
      }
    }
    for (let aug of this.augs) {
      let temp = await Do(this.ns, "ns.singularity.getAugmentationStats", aug);
      for (let stat of Object.keys(temp)) {
        if (
          !stat.includes("bladeburner") &&
          temp[stat] != 1 &&
          !stat.includes("hacknet")
        ) {
          if (this.augfilter.includes(stat) || this.augfilter.length == 0) {
            this.stats.add(stat);
          }
        }
      }
    }
    this.initialized = true;
  }
  async display() {
    let React = eval("window").React;
    let doc = eval("document");
    while (this.initialized == false) {
      await this.ns.asleep(1000);
    }

    let rows: any[] = [];
    let row: any[] = [];
    let header: any[] = [];
    row.push(React.createElement("td"));
    for (let faction of this.factions) {
      row.push(React.createElement("td", {}, faction));
    }
    row.push(React.createElement("td"));
    for (let stat of this.stats) {
      if (this.augfilter.includes(stat) || this.augfilter.length == 0)
        row.push(React.createElement("td", {}, stat.replace("_", " ")));
    }
    header.push(row);
    for (let aug of this.augs) {
      row = [];
      row.push(React.createElement("td", {}, aug));
      for (let faction of this.factions) {
        if (
          (
            await Do(
              this.ns,
              "ns.singularity.getAugmentationsFromFaction",
              faction
            )
          ).includes(aug)
        ) {
          row.push(React.createElement("td", { align: "center" }, "X"));
        } else {
          row.push(React.createElement("td", { align: "center" }, " "));
        }
      }
      row.push(React.createElement("td"));
      let good = false;
      for (let stat of this.stats) {
        if (this.augfilter.includes(stat) || this.augfilter.length == 0) {
          if (
            (await Do(this.ns, "ns.singularity.getAugmentationStats", aug))[
              stat
            ] != 1
          ) {
            good = true;
            if (
              (await Do(this.ns, "ns.singularity.getAugmentationStats", aug))[
                stat
              ] > 1
            ) {
              row.push(
                React.createElement(
                  "td",
                  { align: "right", nowrap: "" },
                  "+" +
                    Math.floor(
                      0.5 +
                        ((
                          await Do(
                            this.ns,
                            "ns.singularity.getAugmentationStats",
                            aug
                          )
                        )[stat] -
                          1) *
                          100
                    ).toString() +
                    "%"
                )
              );
            } else {
              row.push(
                React.createElement(
                  "td",
                  { align: "right", nowrap: "" },
                  "-" +
                    Math.floor(
                      0.5 +
                        (1 /
                          (
                            await Do(
                              this.ns,
                              "ns.singularity.getAugmentationStats",
                              aug
                            )
                          )[stat] -
                          1) *
                          100
                    ).toString() +
                    "%"
                )
              );
            }
          } else {
            row.push(
              React.createElement("td", { align: "right", nowrap: "" }, " ")
            );
          }
        }
      }
      if (good) {
        rows.push([
          await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug),
          React.createElement("tr", {}, row),
        ]);
      }
    }
    rows = rows
      .sort((a: any, b: any) => {
        return a[0] - b[0];
      })
      .map((x: any) => x[1]);
    let table = React.createElement(
      "table",
      { border: 1, cellpadding: 0, cellspacing: 0 },
      header.concat(rows)
    );
    this.ns.tprintRaw(table);
  }
}

export class WholeGame {
  ns: NS;
  settings: {};
  servers: Servers;
  running: boolean;
  jobs: Jobs;
  factions: Factions;
  sidebar: Element;
  doc: Document;
  win: Window;
  css: string;
  focus: Focus;
  crime: Crime;
  traveling: Traveling;
  augmentations: Augmentations;
  collegegym: CollegeGym;
  growCount: number;
  checkout: Checkout;
  gangToJoin: string;
  gangMemberNames: string[];
  gang: Gangs;
  corp: Corp;
  contracts: Contracts;
  weather: Weather;
  th: terminalHistory;

  transition = (fn: any) => {
    let sidebar = this.doc.querySelector(".sb")!;
    sidebar.classList.add("t");
    fn();
    setTimeout(() => this.sidebar.classList["remove"]("t"), 200);
  };
  elemFromHTML(html: string): Element {
    return new Range().createContextualFragment(html)
      .firstElementChild! as Element;
  }
  constructor(ns: NS, gangToJoin: string, gangMemberNames: string[]) {
    this.ns = ns;
    this.doc = eval("document")!;
    this.win = eval("document")!.win;
    this.sidebar = this.doc.querySelector(".sb")!;
    this.gangToJoin = gangToJoin;
    this.gangMemberNames = gangMemberNames;
    this.growCount = 0;
    this.running = true;
    this.contracts = new Contracts(this);
    this.settings = {};
    this.servers = new Servers(this, true);
    this.focus = new Focus(this);
    this.collegegym = new CollegeGym(this);
    this.jobs = new Jobs(this);
    this.augmentations = new Augmentations(this);
    this.factions = new Factions(this);
    this.crime = new Crime(this);
    this.traveling = new Traveling(this);
    this.checkout = new Checkout(this);
    this.gang = new Gangs(this);
    this.css =
      `body{--prilt:` +
      this.ns.ui.getTheme()["primarylight"] +
      `;--pri:` +
      this.ns.ui.getTheme()["primary"] +
      `;--pridk:` +
      this.ns.ui.getTheme()["primarydark"] +
      `;--successlt:` +
      this.ns.ui.getTheme()["successlight"] +
      `;--success:` +
      this.ns.ui.getTheme()["success"] +
      `;--successdk:` +
      this.ns.ui.getTheme()["successdark"] +
      `;--errlt:` +
      this.ns.ui.getTheme()["errorlight"] +
      `;--err:` +
      this.ns.ui.getTheme()["error"] +
      `;--errdk:` +
      this.ns.ui.getTheme()["errordark"] +
      `;--seclt:` +
      this.ns.ui.getTheme()["secondarylight"] +
      `;--sec:` +
      this.ns.ui.getTheme()["secondary"] +
      `;--secdk:` +
      this.ns.ui.getTheme()["secondarydark"] +
      `;--warnlt:` +
      this.ns.ui.getTheme()["warninglight"] +
      `;--warn:` +
      this.ns.ui.getTheme()["warning"] +
      `;--warndk:` +
      this.ns.ui.getTheme()["warningdark"] +
      `;--infolt:` +
      this.ns.ui.getTheme()["infolight"] +
      `;--info:` +
      this.ns.ui.getTheme()["info"] +
      `;--infodk:` +
      this.ns.ui.getTheme()["infodark"] +
      `;--welllt:` +
      this.ns.ui.getTheme()["welllight"] +
      `;--well:` +
      this.ns.ui.getTheme()["well"] +
      `;--white:#fff;--black:#000;--hp:` +
      this.ns.ui.getTheme()["hp"] +
      `;--money:` +
      this.ns.ui.getTheme()["money"] +
      `;--hack:` +
      this.ns.ui.getTheme()["hack"] +
      `;--combat:` +
      this.ns.ui.getTheme()["combat"] +
      `;--cha:` +
      this.ns.ui.getTheme()["cha"] +
      `;--int:` +
      this.ns.ui.getTheme()["int"] +
      `;--rep:` +
      this.ns.ui.getTheme()["rep"] +
      `;--disabled:` +
      this.ns.ui.getTheme()["disabled"] +
      `;--bgpri:` +
      this.ns.ui.getTheme()["backgroundprimary"] +
      `;--bgsec:` +
      this.ns.ui.getTheme()["backgroundsecondary"] +
      `;--button:` +
      this.ns.ui.getTheme()["button"] +
      `;--ff:"` +
      this.ns.ui.getStyles()["fontFamily"] +
      `";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 500px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
    this.corp = new Corp(this);
    this.th = new terminalHistory(this);
    this.weather = new Weather(this);
    if (!this.sidebar) {
      this.sidebar = this.doc.body.appendChild(
        this.elemFromHTML(
          `<div class="sb"><style>${this.css}</style><div class="head"><a class="icon collapser">\ueab6</a><span class=title>sidebar</span></div>`
        )
      ) as HTMLElement;
      this.sidebar.addEventListener("keydown", (e) => e.stopPropagation());
      this.sidebar.querySelector(".head")!.addEventListener("click", () => {
        this.transition(() => this.sidebar.classList.toggle("c"));
        setTimeout(
          () =>
            this.doc.querySelector(".monaco-editor") &&
            Object.assign(
              (this.doc.querySelector(".monaco-editor")! as HTMLElement).style!,
              { width: "0px" }
            )!,
          255
        );
      });
    }
    //this.killModal(this.ns);
    this.start();
    this.hacknetservers();
  }
  async hacknetservers() {
    if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 11) {
      while (true) {
        await Do(this.ns, "ns.hacknet.purchaseNode");
        for (
          let i = 0;
          i < (await Do(this.ns, "ns.hacknet.numNodes"));
          i += 1
        ) {
          if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
            await Do(this.ns, "ns.kill", "batcher.js", "home");
          }
        }
        await this.ns.asleep(60000);
      }
    }
    while (
      4 >=
      (
        await Promise.all(
          Array.from(
            Array(await Do(this.ns, "ns.hacknet.numNodes")).keys()
          ).map((x) => Do(this.ns, "ns.hacknet.getNodeStats", x))
        )
      )
        .map((x) => x.production)
        .reduce((a: any, b: any) => {
          return a + b;
        }, 0)
    ) {
      try {
        await Do(this.ns, "ns.hacknet.purchaseNode");
      } catch {}
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
      for (let i = 0; i < (await Do(this.ns, "ns.hacknet.numNodes")); i += 1) {
        if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
          await Do(this.ns, "ns.kill", "batcher.js", "home");
        }
        await Do(this.ns, "ns.hacknet.upgradeCore", i);
        await Do(this.ns, "ns.hacknet.upgradeLevel", i);
      }
      await this.ns.asleep(0);
    }
    while (
      !(await Do(this.ns, "ns.corporation.hasCorporation")) ||
      !(await Do(this.ns, "ns.corporation.getCorporation")).divisions.includes(
        "Farmy"
      )
    ) {
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
      await this.ns.asleep(0);
    }
    while (true) {
      try {
        await Do(this.ns, "ns.hacknet.purchaseNode");
      } catch {}
      await Do(
        this.ns,
        "ns.hacknet.spendHashes",
        "Exchange for Corporation Research"
      );
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Corporation Funds");
      for (let i = 0; i < (await Do(this.ns, "ns.hacknet.numNodes")); i += 1) {
        if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
          await Do(this.ns, "ns.kill", "batcher.js", "home");
        }
        await Do(this.ns, "ns.hacknet.upgradeCore", i);
        await Do(this.ns, "ns.hacknet.upgradeLevel", i);
        await Do(this.ns, "ns.hacknet.upgradeCache", i);
      }
      await this.ns.asleep(0);
    }
  }
  async start() {
    switch ((await Do(this.ns, "ns.getResetInfo")).currentNode) {
      case 10:
      case 11:
      case 12:
      case 13:
        while ((await Do(this.ns, "ns.heart.break")) > -54000) {
          await this.crime.lowerKarma(-54000);
        }
      case 2:
        await this.gang.gangCreate();
        await this.gang.start();
      default:
        this.factions.initialize(this.ns);
        while (false == this.factions.initialized) {
          await this.ns.asleep(0);
        }
        while (false == this.servers.initialized) {
          await this.ns.asleep(0);
        }
        await this.ns.asleep(0);
        //await eval('document')!.win.addEventListener("resize",  () => this.doc.querySelectorAll('.sb .box').forEach(box => Object.assign((box as HTMLElement).style, { left: Math.max(Math.min(this.win.innerWidth - (box as HTMLElement).offsetWidth, (box as HTMLElement).offsetLeft), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - (box as HTMLElement).offsetHeight, (box as HTMLElement).offsetTop), 0) + "px" })));
        await this.servers.popall();
        this.servers.popallloop();
        purchasedServersHandler(this);
        getPrograms(this.ns);
        while (true) {
          await bootstrap8gb(this);
          while (
            (await Do(this.ns, "ns.singularity.getUpgradeHomeRamCost"))! <
              (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! &&
            (await Do(this.ns, "ns.singularity.upgradeHomeRam"))
          ) {}
          await this.ns.asleep(0);
        }
    }
  }
  async killModal(ns: any) {
    while (true) {
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("you feel different")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("for destroying its corresponding")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      await ns.asleep(10000);
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("destroying a BitNode")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      await ns.asleep(10000);
    }
  }
  ts = () =>
    `[<span class=ts>${new Date().toLocaleTimeString("en-gb")}</span>]`;
  createItem = (title: string, content: any, icon: any, ...classes: any[]) => {
    this.doc = eval("document");
    let sidebar: any = this.doc.querySelector(".sb");
    let item = sidebar.appendChild(
      this.elemFromHTML(
        `<div class="${classes.join(
          " "
        )}"><div class="head"><a class="icon">${icon}</a><span class=title>${title}</span><a class="icon collapser">\ueab7</a><a class="icon close">\ueab8</a></div><div class="body"><div class="display" hidden></div>${content}</div></div>`
      )
    );
    Object.assign(item, {
      head: item.querySelector(".head"),
      body: item.querySelector(".body"),
      display: () => {
        item.querySelector(".display").removeAttribute("hidden");
        return item.querySelector(".display");
      },
      toggleType: () =>
        ["box", "sbitem"].forEach((cl) => item.classList.toggle(cl)),
      logTarget: item.querySelector(".log"),
      log: (html: string, timestamp = true) => {
        if (!item.logTarget || !this.doc.contains(item.logTarget))
          item.logTarget = item.body.appendChild(
            this.elemFromHTML("<div class=log></div>")
          );
        let logEntry = item.logTarget.appendChild(
          this.elemFromHTML(`<p>${timestamp ? this.ts() : ""} ${html}</p>`)
        );
        try {
          while (
            (item.logTarget.innerHTML.match(/\<p\>/g) || []).length > item.sizeM
          ) {
            item.logTarget.innerHTML = item.logTarget.innerHTML.slice(
              item.logTarget.innerHTML.indexOf("<p>", 3)
            );
          }
        } catch {}
        item.logTarget.scrollTop = item.logTarget.scrollHeight;
        item.recalcHeight();
        return logEntry;
      },
      sizeM: 10,
      recalcHeight: () => {
        item.style.height = "";
        item.style.height = item.offsetHeight + "px";
      },
      contextItems: { any: {} },
      addContextItem: (name: any, fn: any, cFn = () => 1) =>
        (item.contextItems[name] = { fn: fn, cFn: cFn }),
    });

    [
      ["Remove Item", () => item["remove"]()],
      ["Cancel", () => 0],
      [
        "Float to Top",
        () =>
          this.sidebar
            .querySelector(".head")!
            .insertAdjacentElement("afterend", item),
        () => item.classList.contains("sbitem"),
      ],
      [
        "Sink to Bottom",
        () => this.sidebar.appendChild(item),
        () => item.classList.contains("sbitem"),
      ],
      ["Toggle Type", () => item.toggleType()],
      ["Recalculate Height", item.recalcHeight],
    ].forEach((zargs) => item.addContextItem(...zargs));

    item.addEventListener(
      "mousedown",
      (e: any) =>
        item.classList.contains("box") &&
        Object.assign(item.style, { zIndex: this.zIndex() })
    );
    item.head.addEventListener("mousedown", (e: any) => {
      if (item.classList.contains("sbitem"))
        return e.button || this.transition(() => item.classList.toggle("c"));
      if (e.target.tagName === "A") return;
      let x = e.clientX,
        y = e.clientY,
        l = item.offsetLeft,
        t = item.offsetTop;
      let boxDrag = (e: any) =>
        Object.assign(item.style, {
          left:
            Math.max(
              Math.min(
                this.win.innerWidth - item.offsetWidth,
                l + e.clientX - x
              ),
              0
            ) + "px",
          top:
            Math.max(
              Math.min(
                this.win.innerHeight - item.offsetHeight,
                t + e.clientY - y
              ),
              0
            ) + "px",
        });
      let boxDragEnd = (e: any) => {
        this.doc.removeEventListener("mouseup", boxDragEnd);
        this.doc.removeEventListener("mousemove", boxDrag);
      };
      this.doc.addEventListener("mouseup", boxDragEnd);
      this.doc.addEventListener("mousemove", boxDrag);
    });
    item.head
      .querySelector(".close")
      .addEventListener("click", (e: any) => item["remove"]());
    item.head
      .querySelector(".collapser")
      .addEventListener(
        "click",
        (e: any) =>
          item.classList.contains("box") &&
          this.transition(() => item.classList.toggle("c"))
      ); // || this.win._boxEdgeDetect()));
    this.win = eval("window");
    item.head.addEventListener(
      "contextmenu",
      (e: any) =>
        e.preventDefault() || this.contextMenu(item, e.clientX, e.clientY)
    );
    Object.assign(item.style, {
      left: Math.floor(this.win.innerWidth / 2 - item.offsetWidth / 2) + "px",
      top: Math.floor(this.win.innerHeight / 2 - item.offsetHeight / 2) + "px",
      height: (item.offsetHeight || 200) + "px",
      width: (item.offsetWidth || 200) + "px",
      zIndex: this.zIndex(),
    });
    return item;
  };
  createBox = (
    title: string,
    content: any,
    icon = "\uea74",
    ...classes: any[]
  ) => this.createItem(title, content, icon, ...classes, "box");
  createSidebarItem = (
    title: string,
    content: any,
    icon = "\uea74",
    ...classes: any[]
  ) => this.createItem(title, content, icon, ...classes, "sbitem");
  confirm = (text: string) => {
    let box = this.createBox(
      "Confirmation Prompt",
      `<div class=g2><div class=f>${text}</div><button class=r><u>Y</u>es</button><button class=l><u>N</u>o</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("button").focus();
    box.addEventListener(
      "keyup",
      (e: any) =>
        (e.key.toLowerCase() === "y" && box.querySelector("button").click()) ||
        (e.key.toLowerCase() === "n" &&
          box.querySelectorAll("button")[1].click())
    );
    return new Promise((r) =>
      box
        .querySelectorAll("button")
        .forEach((button: any, i: any) =>
          button.addEventListener("click", () => box["remove"](r(i == 0)))
        )
    );
  };
  prompt = (text: string) => {
    let box = this.createBox(
      "Input Prompt",
      `<div class=g2><div class=f>${text}</div><input class=r /><button class=l>Submit</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("input").focus();
    box
      .querySelector("input")
      .addEventListener(
        "keyup",
        (e: any) => e.key == "Enter" && box.querySelector("button").click()
      );
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () =>
          box["remove"](r(box.querySelector("input").value))
        )
    );
  };
  select = (text: string, options: any) => {
    let box = this.createBox(
      "Selection Prompt",
      `<div class=g2><div class=f>${text}</div><select class=r>${options
        .map((option: any) => `<option value="${option}">${option}</option>`)
        .join("")}</select><button class=l>Submit</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("select").focus();
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () =>
          box["remove"](r(box.querySelector("select").value))
        )
    );
  };
  alert = (text: string) => {
    let box = this.createBox(
      "Alert Message",
      `<div class=g2><div class=f>${text}</div><button class=f>Ok</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("button").focus();
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () => r(box["remove"]()))
    );
  };
  contextMenu = (item: any, x: any, y: any) => {
    if (item.classList.contains("prompt")) return;
    let options = Object.entries(item.contextItems).filter((entry: any) =>
      Object.keys(entry[1]).includes("cFn")
    );
    let box = this.createBox(
      "",
      `<div class=g2><div class=f>${
        item.querySelector(".title").innerText
      }.context</div>${options
        .map(([name, entry]) => `<button class=n>${name}</button>`)
        .join("")}</div>`,
      "",
      "contextMenu"
    );
    box.querySelector("button").focus();
    Object.assign(box.style, {
      left:
        Math.max(
          Math.min(this.win.innerWidth - box.offsetWidth / 2, x),
          box.offsetWidth / 2
        ) + "px",
      top:
        Math.max(
          Math.min(this.win.innerHeight - box.offsetHeight / 2, y),
          box.offsetHeight / 2
        ) + "px",
      transform: "translate(-50%, -50%)",
    });
    box
      .querySelectorAll("button")
      .forEach((button: any) =>
        button.addEventListener("click", () =>
          box["remove"](item.contextItems[button.innerText].fn())
        )
      );
    box.addEventListener("mousedown", (e: any) => e.stopPropagation());
    let docFunction: any = () =>
      box["remove"](this.doc.removeEventListener("mousedown", docFunction));
    setTimeout(() => this.doc.addEventListener("mousedown", docFunction), 10);
  };
  zIndex = () =>
    Math.max(
      9000,
      ...[...this.doc.querySelectorAll(".sb .box")].map(
        (box: any) => box.style.zIndex
      )
    ) + 1;
}

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
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".thbox");
    this.log ??= this.Game.createSidebarItem(
      "TerminalHistory",
      "",
      "T",
      "thbox"
    );
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

export async function main(ns: NS): Promise<void> {
  const args = ns.flags([
    ["augs", false],
    ["map", false],
    ["cityaugs", false],
    ["corpaugs", false],
    ["endgameaugs", false],
    ["gangaugs", false],
    ["hackaugs", false],
    ["chaaugs", false],
    ["gangToJoin", "Slum Snakes"],
    ["gangMemberNames", gangMemberNames],
    ["grep", ""],
    ["do", ""],
    ["ps", false],
    ["ramOverride", 2.6],
    ["corpmats", false],
    ["devmenu", false],
  ]);
  if (args["do"] != "") {
    let doArgs: any = JSON.parse(args["do"] as string);
    let output: any =
      (await doArgs[0].split(".").reduce((a: any, b: any) => a[b], ns)(
        ...JSON.parse(doArgs[1])
      )) ?? "UnDeFiNeDaF";
    ns.atExit(() => ns.writePort(ns.pid, output));
    return;
  }
  if (args["devmenu"] != false) {
    getTruePlayer().toPage?.('Dev');
    return;
  }
  if (args["ps"] != false) {
    let React = eval("window").React;
    let servers = ["home"];
    let i = 0;
    let j = 0;
    let rows: any = [];
    while (i < servers.length) {
      for (let server of await Do(ns, "ns.scan", servers[i])) {
        if (!servers.includes(server)) {
          servers.push(server);
        }
      }
      for (let proc of await Do(ns, "ns.ps", servers[i])) {
        rows.push(
          React.createElement(
            "TR",
            [],
            [
              React.createElement("TD", [], servers[i]),
              React.createElement("TD", [], proc.filename),
              React.createElement("TD", [], proc.pid.toString()),
              React.createElement("TD", [], proc.threads.toString()),
              React.createElement("TD", [], proc.args.toString()),
            ]
          )
        );
        j += 1;
      }
      i += 1;
    }
    if (j > 0) {
      ns.tprintRaw(React.createElement("TABLE", { border: 1 }, rows));
    }
    return;
  }
  if (args["grep"] != "") {
    for (let file of await Do(ns, "ns.ls", "home")) {
      let z = 0;
      for (let line of ns.read(file).split("\n")) {
        z += 1;
        if (line.includes(args["grep"] as string)) {
          ns.tprintRaw(file + ":" + z.toString() + ":" + line);
        }
      }
    }
    return;
  }
  let didSomething = false;
  if (args["map"]) {
    didSomething = true;
    await Maps(ns);
  }
  if (args["corpmats"]) {
    didSomething = true;
    await CorpMats(ns);
  }
  if (args["augs"]) {
    didSomething = true;
    await new AugChart(ns).display();
  }
  if (args["cityaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Sector-12",
      "Aevum",
      "Volhaven",
      "Chongqing",
      "New Tokyo",
      "Ishima",
    ]).display();
  }
  if (args["corpaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Four Sigma",
      "Bachman & Associates",
      "Clarke Incorporated",
      "Blade Industries",
      "KuaiGong International",
      "OmniTek Incorporated",
      "ECorp",
      "MegaCorp",
      "NWO",
      "Fulcrum Secret Technologies",
    ]).display();
  }
  if (args["endgameaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Daedalus",
      "Illuminati",
      "The Covenant",
    ]).display();
  }
  if (args["gangaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Slum Snakes",
      "Tetrads",
      "Silhouette",
      "Speakers for the Dead",
      "The Dark Army",
      "The Syndicate",
    ]).display();
  }
  if (args["hackaugs"]) {
    didSomething = true;
    await new AugChart(
      ns,
      [
        "CyberSec",
        "NiteSec",
        "Tian Di Hui",
        "The Black Hand",
        "BitRunners",
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        "Daedalus",
        "Illuminati",
        "The Covenant",
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
      ],
      [
        "hacking_chance",
        "hacking_speed",
        "hacking",
        "hacking_grow",
        "hacking_money",
        "hacking_exp",
      ]
    ).display();
  }
  if (args["chaaugs"]) {
    didSomething = true;
    await new AugChart(
      ns,
      [
        "CyberSec",
        "NiteSec",
        "Tian Di Hui",
        "The Black Hand",
        "BitRunners",
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        "Daedalus",
        "Illuminati",
        "The Covenant",
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
      ],
      ["charisma", "charisma_exp", "company_rep", "faction_rep"]
    ).display();
  }
  if (!didSomething) {
    let Game = new WholeGame(
      ns,
      args["gangToJoin"] as string,
      args["gangMemberNames"] as string[]
    );
    while (Game.running == false) {
      await ns.asleep(1000);
    }
    await Game.jobs.allJobs();
    let z = 0;
    while (Game.running == true) {
      await ns.asleep(z);
      z += 1;
    }
  }
}
