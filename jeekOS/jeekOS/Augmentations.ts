import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";

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
