import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";
import { Augmentations } from "jeekOS/Augmentations/augmentations";

let FACTIONS: string[] = ["Illuminati", "Daedalus", "The Covenant", "ECorp", "MegaCorp", "Bachman & Associates", "Blade Industries", "NWO", "Clarke Incorporated", "OmniTek Incorporated", "Four Sigma", "KuaiGong International", "Fulcrum Secret Technologies", "BitRunners", "The Black Hand", "NiteSec", "Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Volhaven", "Speakers for the Dead", "The Dark Army", "The Syndicate", "Silhouette", "Tetrads", "Slum Snakes", "Netburners", "Tian Di Hui", "CyberSec", "Bladeburners", "Church of the Machine God", "Shadows of Anarchy"];

export class Factions {
    Game: WholeGame;
    ns: NS;
    initialized: boolean;
    augs: Map<string, string[]>;

    constructor(game: WholeGame) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.initialized = false;
        this.augs = new Map<string, string[]>;
        for (let faction of FACTIONS) {
            if (!["Sector-12", "Aevum", "Ishima", "Chongqing", "Volhaven", "New Tokyo"].includes(faction)) {
                this.eventuallyJoin(faction);
            }
        }
    }
    async eventuallyJoin(factionName: string) {
        while (!(await Do(this.ns, "ns.getPlayer"))!.factions.includes(factionName)) {
            if ((await Do(this.ns, "ns.singularity.checkFactionInvitations"))!.includes(factionName)) {
                await Do(this.ns, "ns.singularity.joinFaction", factionName);
            } else {
                await this.ns.asleep(60000);
            }
        }
    }
    async initialize(ns: NS) {
        this.initialized = false;
        while ((!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("The Red Pill"))) && (await this.Game.augmentations.augList()).length == 0) {
            this.initialized = true;
            if ((await Do(ns, "ns.singularity.checkFactionInvitations"))!.includes("Daedalus")) {
                await Do(ns, "ns.singularity.joinFaction", "Daedalus");
            }
            await ns.asleep(1000);
        }
        let augList = (await this.Game.augmentations.augList());
        let i = 0;
        while (i < augList.length) {
            let prereqs = await Do(this.ns, "ns.singularity.getAugmentationPrereq", augList[i][2]);
            let good = true;
            let j = 0;
            let alreadyOwned = ((await Do(this.ns, "ns.singularity.getOwnedAugmentations", true))!);
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
            if ((await Do(ns, "ns.singularity.checkFactionInvitations"))!.includes("Daedalus")) {
                await Do(ns, "ns.singularity.joinFaction", "Daedalus");
            }
            while (augList.length > 0 && Math.max(augList.filter((x: any) => x[1] == augList[1]).map((x:any) => x[4])) > await Do(this.ns, "ns.singularity.getFactionRep", augList[0][1])) {
                augList = augList.filter((x:any) => x[1] != augList[0][1]);
            }
            let firstFactionD: any = augList;
            while (firstFactionD[0][5] <= 0) {
                firstFactionD = firstFactionD.filter((x:any) => x[2] != firstFactionD[0][2]);
            }
            if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2) {
                firstFactionD = firstFactionD.filter((x:any) => x[1] != this.Game.gangToJoin);
            }
            let firstFaction: string = firstFactionD[0][1];
            ns.toast(firstFaction);
            this.initialized = true;
            await this.factionJoin(firstFaction);
            await ns.asleep(60000);
            augList = (await this.Game.augmentations.augList());
            i = 0;
            while (i < augList.length) {
                let prereqs = await Do(this.ns, "ns.singularity.getAugmentationPrereq", augList[i][2]);
                let good = true;
                let j = 0;
                let alreadyOwned = ((await Do(this.ns, "ns.singularity.getOwnedAugmentations", true))!);
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
        }
        this.initialize(ns);
    }
    
    async factionJoin(firstFaction: string) {
        switch (firstFaction) {
            case "CyberSec":
            case "NiteSec":
            case "The Black Hand":
            case "BitRunners":
                while (!(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)) {
                    await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
                    await this.ns.asleep(1000);
                }
                while (await Do(this.ns, "ns.singularity.isBusy")) {
                    await this.ns.asleep(1000);
                }
                await Do(this.ns, "ns.singularity.workForFaction", firstFaction, "Hacking", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
                break;
            case "Sector-12":
            case "Aevum":
            case "Volhaven":
            case "Ishima":
            case "New Tokyo":
            case "Chongqing":
            case "Tian Di Hui":
                while (!(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)) {
                    await this.Game.traveling.assertLocation(firstFaction == "Tian Di Hui" ? "New Tokyo" : firstFaction);
                    await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
                    await this.ns.asleep(1000);
                }
                while (await Do(this.ns, "ns.singularity.isBusy")) {
                    await this.ns.asleep(1000);
                }
                await Do(this.ns, "ns.singularity.workForFaction", firstFaction, "Hacking", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
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
                await Do(this.ns, "ns.singularity.workForFaction", firstFaction, "Hacking", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
                break;
            case "Daedalus":
                await Do(this.ns, "ns.singularity.workForFaction", firstFaction, "Hacking", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
                break;
            case "Slum Snakes":
            case "Tetrads":
            case "Speakers for the Dead":
            case "The Dark Army":
            case "The Syndicate":
                let i = 0;
                while (i <= {"Slum Snakes": 30, "Speakers for the Dead": 300, "The Dark Army": 300, "Tetrads": 75, "The Syndicate": 200}[firstFaction]) {
                    await this.Game.collegegym.raiseStrength(i);
                    await this.Game.collegegym.raiseDefense(i);
                    await this.Game.collegegym.raiseDexterity(i);
                    await this.Game.collegegym.raiseAgility(i);
                    i += 1;
                }
                await this.Game.collegegym.raiseHacking({"Slum Snakes": 0, "The Dark Army": 300, "Speakers for the Dead": 100, "Tetrads": 0, "The Syndicate": 200}[firstFaction]);
                await this.Game.crime.lowerKarma({"Slum Snakes": -9, "The Dark Army": -45, "Speakers for the Dead": -45, "Tetrads": -18, "The Syndicate": -90}[firstFaction]);
                while ((await Do(this.Game.ns, "ns.getPlayer"))!.numPeopleKilled < {"Slum Snakes": 0, "The Dark Army": 5, "Speakers for the Dead": 45, "Tetrads": 0, "The Syndicate": 0}[firstFaction]) {
                    await this.Game.crime.hereIGoKillingAgain({"Slum Snakes": 0, "The Dark Army": 5, "Speakers for the Dead": 45, "Tetrads": 0, "The Syndicate": 0}[firstFaction]);
                }
                await this.Game.crime.getMoney({
                    "Slum Snakes": 1e6,
                    "Tetrads": 0,
                    "Silhouette": 15e6,
                    "Speakers for the Dead": 0,
                    "The Dark Army": 0,
                    "The Syndicate": 10e6
                }[firstFaction]);
                if (firstFaction === "The Dark Army" || firstFaction === "Tetrads") {
                    await this.Game.traveling.assertLocation("Chongqing");
                }
                if (firstFaction === "The Syndicate") {
                    await this.Game.traveling.assertLocation("Sector-12");
                }
                await this.Game.crime.getMoney({
                    "Slum Snakes": 1e6,
                    "Tetrads": 0,
                    "Silhouette": 15e6,
                    "Speakers for the Dead": 0,
                    "The Dark Army": 0,
                    "The Syndicate": 10e6
                }[firstFaction]);
                while (!(await Do(this.ns, "ns.getPlayer"))!.factions.includes(firstFaction)) {
                    await Do(this.ns, "ns.singularity.joinFaction", firstFaction);
                    await this.ns.asleep(1000);
                }
                while (await Do(this.ns, "ns.singularity.isBusy")) {
                    await this.ns.asleep(1000);
                }
                await Do(this.ns, "ns.singularity.workForFaction", firstFaction, "Field Work", (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
                break;            
            default:
        }
    }
}