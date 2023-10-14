import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { bootstrap8gb } from "./jeekOS/Bootstrap/bootstrap8gb";
import { Servers } from "jeekOS/Servers/servers";

export async function main(ns: NS): Promise<void> {
    let servers = new Servers(ns);
    servers.popallloop();
    while (true) {
        await bootstrap8gb(ns);
        await ns.asleep(0);
    }
}
