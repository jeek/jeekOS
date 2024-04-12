import { NS, ResetInfo } from "@ns";
import { Do } from "jeekOS/Do";
import { WholeGame } from "jeekOS/WholeGame";

export async function purchasedServersHandler(Game: WholeGame): Promise<void> {
  let ns = Game.ns;
  while (true) {
    Game.growCount = 3;
    if (Game.growCount < 2) {
      await ns.asleep(1000);
    } else {
      const resetInfo = (await Do(ns, "ns.getResetInfo")) as ResetInfo;
      const lastAugReset = resetInfo.lastAugReset;
      let lastAug = (Date.now() - lastAugReset) / 3600000;

      if (lastAug < 2) {
        lastAug = 2;
      }
      let servers: string[] = (await Do(
        ns,
        "ns.getPurchasedServers"
      )) as string[];
      let ideas: (number | string)[][] = [];
      let biggestserver = (await Do(
        ns,
        "ns.getPurchasedServerMaxRam"
      )) as number;
      if (
        servers.length <
        ((await Do(ns, "ns.getPurchasedServerLimit")) as number)
      ) {
        for (let i = 2; i <= biggestserver; i *= 2) {
          ideas = ideas.concat([
            [
              i / ((await Do(ns, "ns.getPurchasedServerCost", i)) as number),
              (await Do(ns, "ns.getPurchasedServerCost", i)) as number,
              "pserver-" + (servers.length + 1).toString(),
              "purchase",
              i,
              i,
            ],
          ]);
        }
      }
      for (let i = 2; i <= biggestserver; i *= 2) {
        for (let server of servers) {
          let curRam = (await Do(ns, "ns.getServerMaxRam", server)) as number;
          if (i > curRam) {
            ideas = ideas.concat([
              [
                (i - curRam) /
                  ((await Do(
                    ns,
                    "ns.getPurchasedServerUpgradeCost",
                    server,
                    i
                  )) as number),
                (await Do(
                  ns,
                  "ns.getPurchasedServerUpgradeCost",
                  server,
                  i
                )) as number,
                server,
                "upgrade",
                i - curRam,
                i,
              ],
            ]);
          }
        }
      }
      let curMoney = (await Do(
        ns,
        "ns.getServerMoneyAvailable",
        "home"
      )) as number;
      ideas = ideas.filter((x) => (x[1] as number) <= curMoney / lastAug);
      ideas = ideas.sort((x, y) => (x[4] as number) - (y[4] as number));
      ideas = ideas.sort((x, y) => (x[5] as number) - (y[5] as number));
      ideas = ideas.sort((x, y) => (x[0] as number) - (y[0] as number));
      ideas = ideas.sort((x, y) =>
        x[2] == "pserver-1" && y[2] != "pserver-1"
          ? 1
          : x[2] != "pserver-1" && y[2] == "pserver-1"
          ? -1
          : 0
      );
      while (ideas.length > 1) {
        ideas.shift();
      }
      let didsomething = false;
      if (ideas.length > 0) {
        if (ideas[0][3] == "purchase") {
          didsomething = (await Do(
            ns,
            "ns.purchaseServer",
            ideas[0][2] as number,
            ideas[0][4] as number
          )) as boolean;
          ns.tprint("Purchased " + ideas[0][2] + " " + ideas[0][4].toString());
        } else {
          didsomething = (await Do(
            ns,
            "ns.upgradePurchasedServer",
            ideas[0][2] as number,
            ideas[0][5] as number
          )) as boolean;
          ns.tprint(
            "Upgraded " +
              ideas[0][2] +
              " from " +
              ((ideas[0][5] as number) - (ideas[0][4] as number)).toString() +
              " to " +
              ideas[0][5].toString()
          );
        }
      }
      if (!didsomething) {
        await ns.asleep(60000);
      }
      await ns.asleep(0);
    }
  }
}
