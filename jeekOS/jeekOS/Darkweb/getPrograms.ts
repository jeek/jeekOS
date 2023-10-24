import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";

export async function GetPrograms(ns: NS) {
    while (((await Do(ns, "ns.singularity.getDarkwebPrograms"))! as string[]).length == 0) {
        if (200000 >= (await Do(ns, "ns.getServerMoneyAvailable", "home"))!) {
            await Do(ns, "ns.singularity.purchaseTor");
        } else {
            await ns.asleep(1000);
        }
    }
    for (let program of [
        "NUKE.exe",
        "BruteSSH.exe",
        "FTPCrack.exe",
        "relaySMTP.exe",
        "HTTPWorm.exe",
        "SQLInject.exe"]) {
            while (!((await Do(ns, "ns.ls", "home")!)! as string[]).includes(program)) {
                if ((await Do(ns, "ns.singularity.getDarkwebProgramCost", program))! >= (await Do(ns, "ns.getServerMoneyAvailable", "home"))!) {
                    await Do(ns, "ns.singularity.purchaseProgram", program);
                } else {
                    await ns.asleep(1000);
                }
            }
        }
}