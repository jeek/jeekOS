import { NS, Player, Server } from "@ns";
import { Do, DoMore } from "jeekOS/Do/do";
import { SimpleServer } from "jeekOS/Server/simpleserver";
import { Servers } from "jeekOS/Servers/servers";

export async function bootstrap8gb(ns: NS): Promise<void> {
    // let targetServer = new SimpleServer(ns, target);
    ns.write("/temp/weaken.js", `export async function main(ns) {await ns.weaken(ns.args[0]);}`, `w`);
    ns.write("/temp/grow.js", `export async function main(ns) {await ns.grow(ns.args[0]);}`, `w`);
    // while (64 > (await Do(ns, "ns.getServerMaxRam", "home"))!) {
        let targets = new Servers(ns);
        while (!targets.initialized) {
            await ns.asleep(1);
        }
        let target = "home";
        for (let server of targets.servers) {
            if (await Do(ns, "ns.hasRootAccess", server.name)) {
                if (((await Do(ns, "ns.getServerRequiredHackingLevel", server.name)) as number * 2) <= (((await Do(ns, "ns.getPlayer")) as Player).skills.hacking as number)) {
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
        await ns.asleep(0);
        let pids: number[] = [];
        ns.tprint(target);
        ns.tprint((await Do(ns, "ns.getServerSecurityLevel", target))!.toString() + "/" + (await Do(ns, "ns.getServerMinSecurityLevel", target))!.toString());
        ns.tprint((await Do(ns, "ns.getServerMoneyAvailable", target))!.toString() + "/" + (await Do(ns, "ns.getServerMaxMoney", target))!.toString());

        await ns.asleep(0);
        
        if ((await Do(ns, "ns.getServerSecurityLevel", target))! > (await Do(ns, "ns.getServerMinSecurityLevel", target))!) {
            for (let server of targets.servers) {
                if (server.name != "home") {
                    if (await Do(ns, "ns.hasRootAccess", server.name)) {
                        await Do(ns, "ns.scp", "/temp/weaken.js", server.name, "home");
                        await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
                    }
                    let threads = Math.floor(((await Do(ns, "ns.getServerMaxRam", server.name) as number) - (await Do(ns, "ns.getServerUsedRam", server.name) as number))! / 1.75);
                    if (threads > 0) {
                        pids = pids.concat((await Do(ns, "ns.exec", "/temp/weaken.js", server.name, threads, target)) as number);
                    }
                }
            }
            let threads = Math.floor(((await Do(ns, "ns.getServerMaxRam", "home") as number)! - ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75);
            if (threads > 0) {
                await DoMore(ns, threads, "await ns.weaken", target);
            }
        } else {
            if ((await Do(ns, "ns.getServerMoneyAvailable", target))! < (await Do(ns, "ns.getServerMaxMoney", target))!) {
                for (let server of targets.servers) {
                    if (server.name != "home") {
                        if (await Do(ns, "ns.hasRootAccess", server.name)) {
                            await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
                        }
                        let threads = Math.floor(((await Do(ns, "ns.getServerMaxRam", server.name) as number) - (await Do(ns, "ns.getServerUsedRam", server.name) as number))! / 1.75);
                        if (threads > 0) {
                            pids = pids.concat((await Do(ns, "ns.exec", "/temp/grow.js", server.name, threads, target)) as number);
                        }
                    }
                }
                await ns.asleep(0);
                let threads = Math.floor(((await Do(ns, "ns.getServerMaxRam", "home") as number)! - ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75);
                if (threads > 0) {
                    await DoMore(ns, threads, "await ns.grow", target);
                }
            } else {
                let threads = Math.floor(((await Do(ns, "ns.getServerMaxRam", "home") as number)! - ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75);
                await DoMore(ns, threads, "await ns.hack", target);
            }
        }
        while (pids.length > 0) {
            while (await Do(ns, "ns.isRunning", pids[0])) {
                await ns.asleep(1);
            }
            pids.shift();
        }
        await ns.asleep(0);
    // }
}