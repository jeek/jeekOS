import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export class Checkout {
    Game: WholeGame;
    ns: NS;

    constructor(game: WholeGame) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.installLoop();
        this.buyLoop();
    }
    async installLoop() {
        if ((await Do(this.ns, "ns.getResetInfo"))!.currentNode == 2 && (await Do(this.ns, "ns.gang.inGang"))) {
            while (true) {
                let augs = await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", this.Game.gangToJoin);
                await Promise.all(augs.map((x:any) => Do(this.ns, "ns.singularity.purchaseAugmentation", this.Game.gangToJoin, x)));
                await Do(this.ns, "ns.singularity.installAugmentations", "jeekOS.js");
                await this.ns.asleep(60000);
            }
        }
        let favorToDonate = 150;
        while ((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.length + (12 - Math.ceil(((Date.now() - ((await Do(this.ns, "ns.getResetInfo")).lastAugReset))/60/60/1000))) >= ((await Do(this.ns, "ns.singularity.getOwnedAugmentations", true))!.length) && ((await Do(this.ns, "ns.singularity.getCurrentWork"))! == null || ((await Do(this.ns, "ns.singularity.getCurrentWork"))!.type != "FACTION" || (((await Do(this.ns, "ns.singularity.getCurrentWork"))!.type == "FACTION" && ((((await Do(this.ns, "ns.singularity.getFactionFavor", (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName)))>= favorToDonate) || (((await Do(this.ns, "ns.singularity.getFactionFavor", (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName))) < favorToDonate && ((await Do(this.ns, "ns.singularity.getFactionFavor", (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName))) + ((await Do(this.ns, "ns.singularity.getFactionFavorGain", (await Do(this.ns, "ns.singularity.getCurrentWork"))!.factionName))) < favorToDonate))))))) {
            await this.ns.asleep(60000);
        }
        let augList = await (this.Game.augmentations.augList());
        augList = augList.sort(((a:any,b:any) => {return -a[3] + b[3]}));
        let i = 0;
        while (i < augList.length) {
            if (await Do(this.ns, "ns.singularity.purchaseAugmentation", augList[i][1], augList[i][2])) {
                augList = augList.filter((x:any) => x[2] != augList[i][2]);
                i = -1;
            }
            i += 1;
        }
        for (let faction of ((await Do(this.ns, "ns.getPlayer"))!.factions)) {
            while ((await Do(this.ns, "ns.getPlayer"))!.money > 1e9 && (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >= 150 && (await Do(this.ns, "ns.singularity.getFactionRep", faction))! < (await Do(this.ns, "ns.singularity.getAugmentationRepReq", "NeuroFlux Governor"))!) {
                await Do(this.ns, "ns.singularity.donateToFaction", faction, 1e9);
            }
            while (await Do(this.ns, "ns.singularity.purchaseAugmentation", faction, "NeuroFlux Governor")) {
                await this.ns.asleep(0);
            }
        }
        let finalLoop: any[] = [];
        for (let faction of ((await Do(this.ns, "ns.getPlayer"))!.factions)) {
            for (let aug of ((await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", faction)))) {
                finalLoop = finalLoop.concat([[faction, aug, await Do(this.ns, "ns.singularity.getAugmentationPrice", aug)]]);
            }
        }
        finalLoop = finalLoop.sort((a:any, b:any) => {return -a[2] + b[2]});
        i = 0;
        while (i < finalLoop.length) {
            if (await Do(this.ns, "ns.singularity.purchaseAugmentation", finalLoop[i][0], finalLoop[i][1])) {
                i = -1;
            }
            i += 1;
        }
        if (await Do(this.ns, "ns.gang.inGang")) {
          let members = await Do(this.ns, "ns.gang.getMemberNames");
          let gear = await Do(this.ns, "ns.gang.getEquipmentNames");
          await Promise.all(members.map((x:string) => gear.map((y:string) => Do(this.ns, "ns.gang.purchaseEquipment", x, y))).flat());
        }
        await Do(this.ns, "ns.singularity.installAugmentations", "jeekOS.js");
        this.ns.tprint("installed?");
        await Do(this.ns, "ns.singularity.softReset", "jeekOS.js");
    }
    async buyLoop() {
        while (true) {
            let augList = await (this.Game.augmentations.augList());
            if (augList.length == 0) {
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
                augList = augList.filter((x:any) => x[1] == augList[0][1]);
                augList = augList.sort(((a:any,b:any) => {return -a[3] + b[3]}));
                let element = 14 - Math.ceil((Date.now() - (await Do(this.ns, "ns.getResetInfo")).lastAugReset)/60/60/1000);
                while (element + 1 > augList.length) {
                    element -= 1;
                }
                if (element >= 0) {
                    let record:any = augList[element];
                    let faction = record[1];
                    let aug = record[2];
                    while ((await Do(this.ns, "ns.getPlayer"))!.factions.includes(faction) && (await Do(this.ns, "ns.getPlayer"))!.money > 1e9 && (await Do(this.ns, "ns.singularity.getFactionFavor", faction))! >= 150 && (await Do(this.ns, "ns.singularity.getFactionRep", faction))! < (await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug))! && await Do(this.ns, "ns.singularity.donateToFaction", faction, 1e9)) {};
                    if (await Do(this.ns, "ns.singularity.purchaseAugmentation", faction, aug)) {
    
                    } else {
                        await this.ns.asleep(60000);
                    }
                } else {
                    await this.ns.asleep(60000); 
                }
                await this.ns.asleep(0);
            } else {
                if ((await Do(this.ns, "ns.getPlayer"))!.money > 1e9 && (await Do(this.ns, "ns.singularity.getFactionFavor", "CyberSec"))! >= 150 && (await Do(this.ns, "ns.singularity.getFactionRep", "CyberSec"))! < (await Do(this.ns, "ns.singularity.getAugmentationRepReq", "NeuroFlux Governor"))!) {
                    await Do(this.ns, "ns.singularity.donateToFaction", "CyberSec", 1e9);
                }
                await Do(this.ns, "ns.singularity.purchaseAugmentation", "CyberSec", "NeuroFlux Governor");
                await this.ns.asleep(0);
            }
        }
    }
}