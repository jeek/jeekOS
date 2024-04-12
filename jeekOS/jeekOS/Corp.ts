import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";
import { WholeGame } from "jeekOS/WholeGame";

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
  "Inflation",
  "Deadpool's",
  "Softee's",
];

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
        551000000000 -
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
      !Object.keys(this.divisions).includes("Smoky") &&
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
      !Object.keys(this.divisions).includes("Smoky") &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 2 &&
      (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds <
        14500000000000
        //27000000000000
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
                      "(IPROD+IINV/10)*(-1)"
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
