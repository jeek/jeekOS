import { NS, Server } from "@ns";
import { Do } from "jeekOS/Do";

export class SimpleServer {
  ns: NS;
  name: string;

  constructor(ns: NS, name = "home") {
    this.ns = ns;
    this.name = name;
  }

  get backdoorInstalled() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .backdoorInstalled;
      } catch (e) {
        return false;
      }
    })();
  }
  get baseDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerBaseSecurityLevel", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get cpuCores() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .cpuCores;
      } catch (e) {
        return false;
      }
    })();
  }
  get ftpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .ftpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get hackDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get hasAdminRights() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.hasRootAccess", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get hostname() {
    return this.name;
  }
  get httpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .httpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get ip() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server).ip;
      } catch (e) {
        return "0.0.0.0";
      }
    })();
  }
  get isConnectedTo() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .isConnectedTo;
      } catch (e) {
        return false;
      }
    })();
  }
  get maxRam() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get minDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMinSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyAvailable() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMoneyAvailable", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyMax() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxMoney", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get numOpenPortsRequired() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .numOpenPortsRequired;
      } catch (e) {
        return 6;
      }
    })();
  }
  get openPortCount() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .openPortCount;
      } catch (e) {
        return -1;
      }
    })();
  }
  get purchasedByPlayer() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .purchasedByPlayer;
      } catch (e) {
        return -1;
      }
    })();
  }
  get ramUsed() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerUsedRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get requiredHackingSkill() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerRequiredHackingLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get serverGrowth() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerGrowth", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get smtpPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .smtpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sqlPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .sqlPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sshPortOpen() {
    return (async () => {
      try {
        return ((await Do(this.ns, "ns.getServer", this.name))! as Server)
          .sshPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
}
