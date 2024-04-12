import { Player, Server } from "@ns";
import { Servers } from "jeekOS/Servers";
import { WholeGame } from "jeekOS/WholeGame";
import { Do, DoMore } from "jeekOS/Do";

export async function bootstrap8gb(Game: WholeGame): Promise<void> {
  let ns = Game.ns;
  ns.write(
    "/temp/weaken.js",
    `export async function main(ns) {await ns.weaken(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/grow.js",
    `export async function main(ns) {await ns.grow(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/hack.js",
    `export async function main(ns) {await ns.hack(ns.args[0]);}`,
    `w`
  );
  ns.write(
    "/temp/share.js",
    `export async function main(ns) {while (true) {await ns.share(ns.args[0]);}}`,
    `w`
  );
  if ((await Do(ns, "ns.getServerMaxRam", "home")) >= 64) {
    ns.run("batcher.js", { preventDuplicates: true, temporary: true });
    await ns.asleep(10000);
    return;
  }
  let targets = new Servers(Game);
  while (!targets.initialized) {
    await ns.asleep(1);
  }
  let target = "home";
  for (let server of targets.servers) {
    if (await Do(ns, "ns.hasRootAccess", server.name)) {
      if (
        ((await Do(
          ns,
          "ns.getServerRequiredHackingLevel",
          server.name
        )) as number) *
          2 <=
        (((await Do(ns, "ns.getPlayer")) as Player).skills.hacking as number)
      ) {
        if (
          (((await Do(ns, "ns.getServerMaxMoney", target)) as number) /
            ((await Do(ns, "ns.getWeakenTime", target)) as number)) *
            ((await Do(ns, "ns.getServer", target))! as Server)!.serverGrowth! <
          (((await Do(ns, "ns.getServerMaxMoney", server.name)) as number) /
            ((await Do(ns, "ns.getWeakenTime", server.name)) as number)) *
            ((await Do(ns, "ns.getServer", server.name)!)! as Server)
              .serverGrowth!
        ) {
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
  let sharepids: number[] = [];
  ns.tprint(target);
  ns.tprint(
    (await Do(ns, "ns.getServerSecurityLevel", target))!.toString() +
      "/" +
      (await Do(ns, "ns.getServerMinSecurityLevel", target))!.toString()
  );
  ns.tprint(
    (await Do(ns, "ns.getServerMoneyAvailable", target))!.toString() +
      "/" +
      (await Do(ns, "ns.getServerMaxMoney", target))!.toString()
  );

  await ns.asleep(0);
  let amHacking = false;
  if (
    (await Do(ns, "ns.getServerSecurityLevel", target))! >
    (await Do(ns, "ns.getServerMinSecurityLevel", target))!
  ) {
    for (let server of targets.servers) {
      if (server.name != "home") {
        if (await Do(ns, "ns.hasRootAccess", server.name)) {
          await Do(ns, "ns.scp", "/temp/weaken.js", server.name, "home");
          await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
          await Do(ns, "ns.scp", "/temp/hack.js", server.name, "home");
        }
        let threads = Math.floor(
          (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
            ((await Do(ns, "ns.getServerUsedRam", server.name)) as number))! /
            1.75
        );
        if (server.name == "home") {
          threads -= 21;
        }
        if (threads > 0) {
          pids = pids.concat(
            (await Do(
              ns,
              "ns.exec",
              "/temp/weaken.js",
              server.name,
              threads,
              target
            )) as number
          );
        }
      }
    }
    let threads = Math.floor(
      (((await Do(ns, "ns.getServerMaxRam", "home")) as number)! -
        ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75
    );
    threads -= 21;
    if (threads > 0) {
      await DoMore(ns, threads, "await ns.weaken", target);
    }
  } else {
    if (
      (await Do(ns, "ns.getServerMoneyAvailable", target))! <
      (await Do(ns, "ns.getServerMaxMoney", target))!
    ) {
      Game.growCount -= 1;
      for (let server of targets.servers) {
        if (server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/grow.js", server.name, "home");
          }
          let threads = Math.floor(
            (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
              ((await Do(ns, "ns.getServerUsedRam", server.name)) as number))! /
              1.75
          );
          if (server.name == "home") {
            threads -= 21;
          }
          if (threads > 0) {
            pids = pids.concat(
              (await Do(
                ns,
                "ns.exec",
                "/temp/grow.js",
                server.name,
                threads,
                target
              )) as number
            );
          }
        }
      }
      await ns.asleep(0);
      let threads = Math.floor(
        (((await Do(ns, "ns.getServerMaxRam", "home")) as number)! -
          ((await Do(ns, "ns.getServerUsedRam", "home")) as number))! / 1.75
      );
      threads -= 21;
      if (threads > 0) {
        await DoMore(ns, threads, "await ns.grow", target);
      }
    } else {
      Game.growCount *= -1;
      let best = "home";
      for (let server of targets.servers) {
        if (server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/hack.js", server.name, "home");
            if (
              (await Do(ns, "ns.getServerMaxRam", best))! -
                (await Do(ns, "ns.getServerUsedRam", best))! -
                (best == "home" ? 21 * 1.85 : 0) <
              (await Do(ns, "ns.getServerMaxRam", server.name))! -
                (await Do(ns, "ns.getServerUsedRam", server.name))!
            ) {
              best = server.name;
            }
          }
        }
      }
      ns.tprint("Hacking from " + best);
      let threads = Math.floor(
        (((await Do(ns, "ns.getServerMaxRam", best)) as number) -
          ((await Do(ns, "ns.getServerUsedRam", best)) as number))! / 1.75
      );
      if (best == "home") {
        threads -= 21;
      }
      if (threads > 0) {
        pids = pids.concat(
          (await Do(
            ns,
            "ns.exec",
            "/temp/hack.js",
            best,
            threads,
            target
          )) as number
        );
      }
      for (let server of targets.servers) {
        if (server.name != best && server.name != "home") {
          if (await Do(ns, "ns.hasRootAccess", server.name)) {
            await Do(ns, "ns.scp", "/temp/share.js", server.name, "home");
            threads = Math.floor(
              (((await Do(ns, "ns.getServerMaxRam", server.name)) as number) -
                ((await Do(
                  ns,
                  "ns.getServerUsedRam",
                  server.name
                )) as number))! / 4
            );
            if (server.name == "home") {
              threads -= 21;
            }
            if (threads > 0) {
              sharepids = sharepids.concat(
                (await Do(
                  ns,
                  "ns.exec",
                  "/temp/share.js",
                  server.name,
                  threads,
                  target
                )) as number
              );
            }
          }
        }
      }

      amHacking = true;
    }
  }
  pids = pids.filter((x: any) => {
    return x != 0;
  });
  while (pids.length > 0) {
    while (await Do(ns, "ns.isRunning", pids[0])) {
      await ns.asleep(100);
    }
    pids.shift();
  }
  while (sharepids.length > 0) {
    Do(ns, "ns.kill", sharepids[0]);
    sharepids.shift();
  }
  await ns.asleep(0);
  if (amHacking) {
    Game.growCount = 0;
  }
}
