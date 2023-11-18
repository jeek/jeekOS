import { NS, Server } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";
import { SimpleServer } from "jeekOS/Server/simpleserver";

export class Servers {
    initialized: boolean;
    ns: NS;
    Game: WholeGame;
    servers: SimpleServer[];

    constructor(game: WholeGame) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.initialized = false;
        this.initialize();
        this.servers = [];
    }

    async initialize() {
        let servers = ['home'];
        let i = 0;
        while (i < servers.length) {
            let newservers = (await Do(this.ns, "ns.scan", servers[i])) as string[];
            for (let servername of newservers) {
                if (!servers.includes(servername)) {
                    servers = servers.concat(servername);
                }
            }
            i += 1;
        }
        this.servers = servers.map(x => new SimpleServer(this.ns, x));
        this.initialized = true;
    }

    async popall() {
        this.initialized = false;
        this.initialize();
        while (this.initialized == false) {
            await this.ns.asleep(100);
        }
        let currentfiles = (await Do(this.ns, "ns.ls", "home")) as string[];
        let portopeners = (currentfiles.includes("BruteSSH.exe") ? 1 : 0) + (currentfiles.includes("FTPCrack.exe") ? 1 : 0) + (currentfiles.includes("relaySMTP.exe") ? 1 : 0) + (currentfiles.includes("HTTPWorm.exe") ? 1 : 0) + (currentfiles.includes("SQLInject.exe") ? 1 : 0);
        for (let server of this.servers) {
            if (!await (server.hasAdminRights)) {
                if ((await (server.numOpenPortsRequired)) as number <= portopeners) {
                    await Do(this.ns, "ns.toast", "Popping " + server.name);
                    if (currentfiles.includes("BruteSSH.exe")) {
                        await Do(this.ns, "ns.brutessh", server.name);
                    }
                    if (currentfiles.includes("FTPCrack.exe")) {
                        await Do(this.ns, "ns.ftpcrack", server.name);
                    }
                    if (currentfiles.includes("relaySMTP.exe")) {
                        await Do(this.ns, "ns.relaysmtp", server.name);
                    }
                    if (currentfiles.includes("HTTPWorm.exe")) {
                        await Do(this.ns, "ns.httpworm", server.name);
                    }
                    if (currentfiles.includes("SQLInject.exe")) {
                        await Do(this.ns, "ns.sqlinject", server.name);
                    }
                    await Do(this.ns, "ns.nuke", server.name);
                }
            }
        }
    }

    async popallloop() {
        while (true) {
            this.popall();
            await this.ns.asleep(60000);
        }
    }

    async recheck() {
        this.initialized = false;
        await this.initialize();
    }
}