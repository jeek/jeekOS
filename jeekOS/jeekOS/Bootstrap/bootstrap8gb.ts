import { NS, Player, Server } from "@ns";
import { Do, DoMore } from "jeekOS/Do/do";
import { SimpleServer } from "jeekOS/Server/simpleserver";
import { Servers } from "jeekOS/Servers/servers";

export async function bootstrap8gb(ns: NS): Promise<void> {
    // let targetServer = new SimpleServer(ns, target);
    while (64 > (await Do(ns, "ns.getServerMaxRam", "home"))!) {
        let targets = new Servers(ns);
        while (!targets.initialized) {
            await ns.asleep(1);
        }
        let target = "home";
        for (let server of targets.servers) {
            if (await Do(ns, "ns.hasRootAccess", server.name)) {
                if (((await Do(ns, "ns.getServerRequiredHackingLevel", server.name)) as number / 2) <= (((await Do(ns, "ns.getPlayer")) as Player).skills.hacking as number)) {
                    if (((await Do(ns, "ns.getServerMaxMoney", target)) as number) / ((await Do(ns, "ns.getWeakenTime", target)) as number) * ((await Do(ns, "ns.getServer", target))! as Server)!.serverGrowth! < ((await Do(ns, "ns.getServerMaxMoney", server.name)) as number) / ((await Do(ns, "ns.getWeakenTime", server.name)) as number) * ((await Do(ns, "ns.getServer", server.name)!)! as Server).serverGrowth!) {
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

        if ((await Do(ns, "ns.getServerSecurityLevel", target))! > (await Do(ns, "ns.getServerMinSecurityLevel", target))!) {
            await DoMore(ns, 16, "await ns.weaken", target);
        } else {
            if ((await Do(ns, "ns.getServerMoneyAvailable", target))! < (await Do(ns, "ns.getServerMaxMoney", target))!) {
                await DoMore(ns, 16, "await ns.grow", target);
            } else {
                await DoMore(ns, 16, "await ns.hack", target);
            }
        }
    }
}