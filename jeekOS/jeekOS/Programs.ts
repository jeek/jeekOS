import { NS } from "@ns";
import { Do } from "jeekOS/Do";

export async function getPrograms(ns: NS) {
  while (
    ((await Do(ns, "ns.singularity.getDarkwebPrograms"))! as string[]).length ==
    0
  ) {
    if (200000 <= (await Do(ns, "ns.getServerMoneyAvailable", "home"))!) {
      await Do(ns, "ns.singularity.purchaseTor");
    } else {
      await ns.asleep(1000);
    }
  }
  let z = 0;
  for (let program of [
    "NUKE.exe",
    "BruteSSH.exe",
    "FTPCrack.exe",
    "relaySMTP.exe",
    "HTTPWorm.exe",
    "SQLInject.exe",
    "Formulas.exe",
  ]) {
    while (!((await Do(ns, "ns.ls", "home")!)! as string[]).includes(program)) {
      if (
        (await Do(ns, "ns.singularity.getDarkwebProgramCost", program))! <=
        (await Do(ns, "ns.getServerMoneyAvailable", "home"))!
      ) {
        await Do(ns, "ns.singularity.purchaseProgram", program);
        await ns.asleep(0);
      } else {
        z += 1;
        await ns.asleep(z);
      }
    }
  }
}
