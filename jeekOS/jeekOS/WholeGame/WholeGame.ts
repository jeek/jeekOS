import { NS, Server } from "@ns";
import { Servers } from "jeekOS/Servers/servers";
import { purchasedServersHandler } from "jeekOS/PurchasedServers/purchasedservers";
import { getPrograms } from "jeekOS/Darkweb/getPrograms";
import { bootstrap8gb } from "jeekOS/Bootstrap/bootstrap8gb";

export class WholeGame {
    ns: NS;
    settings: {}
    servers: Servers;
    running: boolean;

	constructor(ns: NS) {
		this.ns = ns;
        this.running = true;
        this.settings = {};
        this.servers = new Servers(this.ns);
        this.start();
	}

    async start() {
        while (!this.servers.initialized) {
            await this.ns.asleep(0);
        }
        await this.servers.popall();
        this.servers.popallloop();
        purchasedServersHandler(this.ns);
        getPrograms(this.ns);
        bootstrap8gb(this.ns);
    }
}