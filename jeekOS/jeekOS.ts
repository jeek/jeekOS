import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { bootstrap8gb } from "jeekOS/Bootstrap/bootstrap8gb";
import { Servers } from "jeekOS/Servers/servers";
import { purchasedservers } from "jeekOS/PurchasedServers/purchasedservers";

export async function main(ns: NS): Promise<void> {
    let servers = new Servers(ns);
    await servers.popall();
    servers.popallloop();
    purchasedservers(ns);
    while (true) {
        await bootstrap8gb(ns);
        await ns.asleep(0);
    }
}
