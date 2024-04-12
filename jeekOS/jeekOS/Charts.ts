import { NS } from "@ns";
import { Do } from "jeekOS/Do";

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
