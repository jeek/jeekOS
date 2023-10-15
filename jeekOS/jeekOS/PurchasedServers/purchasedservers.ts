import { NS, Player, Server, ResetInfo } from "@ns";
import { Do, DoMore } from "jeekOS/Do/do";
import { SimpleServer } from "jeekOS/Server/simpleserver";
import { Servers } from "jeekOS/Servers/servers";

export async function purchasedservers(ns: NS): Promise<void> {
    while (true) {

        const resetInfo = (await Do(ns, "ns.getResetInfo")) as ResetInfo;
        const lastAugReset = resetInfo.lastAugReset;
        let lastAug = (Date.now() - lastAugReset) / 3600000;
        
        if (lastAug < 2) {
            lastAug = 2;
        }
        let servers: string[] = (await Do(ns, "ns.getPurchasedServers")) as string[];
        let ideas: (number|string)[][] = [];
        let biggestserver = (await Do(ns, "ns.getPurchasedServerMaxRam")) as number;
        if (servers.length < ((await Do(ns, "ns.getPurchasedServerLimit")) as number)) {
            for (let i = 2 ; i <= biggestserver ; i *= 2) {
                ideas = ideas.concat([[i / (await Do(ns, "ns.getPurchasedServerCost", i) as number), (await Do(ns, "ns.getPurchasedServerCost", i) as number), "pserver-" + (servers.length+1).toString(), "purchase", i, i]]);
            }
        }
        for (let i = 2 ; i <= biggestserver ; i *= 2) {
            for (let server of servers) {
                let curRam = (await Do(ns, "ns.getServerMaxRam", server)) as number;
                if (i > curRam) {
                    ideas = ideas.concat([[(i - curRam) / (await Do(ns, "ns.getPurchasedServerUpgradeCost", server, i) as number), (await Do(ns, "ns.getPurchasedServerUpgradeCost", server, i) as number), server, "upgrade", i - curRam, i]]);
                }
            }
        }
        let curMoney = (await Do(ns, "ns.getServerMoneyAvailable", "home")) as number;
        ideas = ideas.filter(x => (x[1] as number) <= curMoney / lastAug);
        ideas = ideas.sort((x, y) => (x[4] as number) - (y[4] as number));
        ideas = ideas.sort((x, y) => (x[5] as number) - (y[5] as number));
        ideas = ideas.sort((x, y) => (x[0] as number) - (y[0] as number));
        while (ideas.length > 1) {
            ideas.shift();
        }
        let didsomething = false;
        if (ideas.length > 0) {
            if (ideas[0][3] == "purchase") {
                didsomething = (await Do(ns, "ns.purchaseServer", ideas[0][2] as number, ideas[0][4] as number)) as boolean;
                ns.tprint("Purchased " + ideas[0][2] + " " + ideas[0][4].toString())
            } else {
                didsomething = (await Do(ns, "ns.upgradePurchasedServer", ideas[0][2] as number, ideas[0][5] as number)) as boolean;
                ns.tprint("Upgraded " + ideas[0][2] + " from " + ((ideas[0][5] as number) - (ideas[0][4] as number)).toString() + " to " + ideas[0][5].toString());
            }
        }
        if (!didsomething) {
            await ns.asleep(60000);
        }
    }
}