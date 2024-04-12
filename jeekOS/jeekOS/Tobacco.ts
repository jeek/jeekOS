import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";

export async function tobacco(div: Division) {
  let ns = div.ns;
  while (!div.initialized) {
    await ns.asleep(0);
  }
  //    while (!div.c.divisions["Farmy"].ding || !div.c.divisions["Chemy"].ding) {
  //        await ns.asleep(1000);
  //    }
  div.ding = true;
  while (
    (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12"))
      .numEmployees < 45 &&
    (await Do(ns, "ns.corporation.getCorporation")).funds >
      (await Do(
        ns,
        "ns.corporation.getOfficeSizeUpgradeCost",
        div.name,
        "Sector-12",
        15
      ))
  ) {
    if (
      (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size <
      45
    ) {
      await Do(
        ns,
        "ns.corporation.upgradeOfficeSize",
        div.name,
        "Sector-12",
        3
      );
    }
    await Do(
      ns,
      "ns.corporation.hireEmployee",
      div.name,
      "Sector-12",
      "Research & Development"
    );
    await ns.asleep(0);
  }
  while (
    (await Do(ns, "ns.corporation.getDivision", div.name)).products.length == 0
  ) {
    if ((await Do(ns, "ns.corporation.getCorporation")).funds < 2000000000) {
      await ns.asleep(0);
    } else {
      await Do(
        ns,
        "ns.corporation.makeProduct",
        div.name,
        "Sector-12",
        "Tobaccy!",
        1e9,
        1e9
      );
      await ns.asleep(100);
    }
  }
  while (
    (await Do(ns, "ns.corporation.getUpgradeLevelCost", "Wilson Analytics")) <=
      (await Do(ns, "ns.corporation.getCorporation")).funds &&
    ((await Do(ns, "ns.corporation.getDivision", div.name)).products.length >
      1 ||
      (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics")) < 10)
  ) {
    await Do(ns, "ns.corporation.levelUpgrade", "Wilson Analytics");
    await ns.asleep(0);
  }
  while (
    (await Do(ns, "ns.corporation.getCorporation")).funds >
    (await Do(
      ns,
      "ns.corporation.getOfficeSizeUpgradeCost",
      div.name,
      "Sector-12",
      15
    ))
  ) {
    await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, "Sector-12", 15);
  }
  let smallCity = true;
  while (smallCity) {
    smallCity = false;
    for (let city of [
      "Sector-12",
      "Aevum",
      "Volhaven",
      "Chongqing",
      "New Tokyo",
      "Ishima",
    ]) {
      await ns.asleep(0);
      if (
        (await Do(ns, "ns.corporation.getOffice", div.name, city)).size + 30 <
        (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size
      ) {
        if (
          (await Do(ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            ns,
            "ns.corporation.getOfficeSizeUpgradeCost",
            div.name,
            city,
            1
          ))
        ) {
          await ns.asleep(0);
          await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, city, 3);
          smallCity = true;
        }
      }
    }
  }
  while (true) {
    while (div.c.state == "START") {
      await ns.asleep(0);
    }
    while (div.c.state != "START") {
      await ns.asleep(0);
    }
    let didsomething = false;
    let warehouse = true;
    while (
      (await Do(
        ns,
        "ns.corporation.getUpgradeLevelCost",
        "Wilson Analytics"
      )) <= (await Do(ns, "ns.corporation.getCorporation")).funds &&
      ((await Do(ns, "ns.corporation.getDivision", div.name)).products.length >
        0 ||
        (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics")) <
          10)
    ) {
      await Do(ns, "ns.corporation.levelUpgrade", "Wilson Analytics");
      didsomething = true;
      await ns.asleep(0);
    }
    while (
      (await Do(ns, "ns.corporation.getCorporation")).funds >
      Math.min(
        await Do(ns, "ns.corporation.getHireAdVertCost", div.name),
        await Do(
          ns,
          "ns.corporation.getOfficeSizeUpgradeCost",
          div.name,
          "Sector-12",
          15
        )
      )
    ) {
      if (
        (await Do(ns, "ns.corporation.getHireAdVertCost", div.name)) <
        (await Do(
          ns,
          "ns.corporation.getOfficeSizeUpgradeCost",
          div.name,
          "Sector-12",
          15
        ))
      ) {
        await Do(ns, "ns.corporation.hireAdVert", div.name);
      } else {
        if (
          (await Do(ns, "ns.corporation.getCorporation")).funds >
          (await Do(
            ns,
            "ns.corporation.getOfficeSizeUpgradeCost",
            div.name,
            "Sector-12",
            15
          ))
        ) {
          await Do(
            ns,
            "ns.corporation.upgradeOfficeSize",
            div.name,
            "Sector-12",
            15
          );
        }
      }
    }
    let smallCity = true;
    while (smallCity) {
      smallCity = false;
      for (let city of [
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
      ]) {
        if (
          (await Do(ns, "ns.corporation.getOffice", div.name, city)).size + 30 <
          (await Do(ns, "ns.corporation.getOffice", div.name, "Sector-12")).size
        ) {
          if (
            (await Do(ns, "ns.corporation.getCorporation")).funds >
            (await Do(
              ns,
              "ns.corporation.getOfficeSizeUpgradeCost",
              div.name,
              city,
              1
            ))
          ) {
            await ns.asleep(0);
            await Do(ns, "ns.corporation.upgradeOfficeSize", div.name, city, 3);
            smallCity = true;
          }
        }
      }
    }
    while (
      (await Do(ns, "ns.corporation.getUpgradeLevelCost", "Project Insight")) <=
        (await Do(ns, "ns.corporation.getCorporation")).funds &&
      (await Do(ns, "ns.corporation.getUpgradeLevel", "Project Insight")) <
        10 *
          (await Do(ns, "ns.corporation.getUpgradeLevel", "Wilson Analytics"))
    ) {
      await Do(ns, "ns.corporation.levelUpgrade", "Project Insight");
      //            ns.tprint("Project Insight", ": ", await Do(ns, "ns.corporation.getUpgradeLevel", "Project Insight"));
    }
    let di = await Do(div.ns, "ns.corporation.getDivision", div.name);
    //        div.ns.tprint((await Do(div.ns, "ns.corporation.getProduct", div.name, "Sector-12", di.products[di.products.length - 1])).developmentProgress);
    let upgraded =
      99 >
      (
        await Do(
          div.ns,
          "ns.corporation.getProduct",
          div.name,
          "Sector-12",
          di.products[di.products.length - 1]
        )
      ).developmentProgress;
    while (upgraded) {
      upgraded = false;
      for (let upgrade of [
        "FocusWires",
        "Neural Accelerators",
        "Speech Processor Implants",
        "Nuoptimal Nootropic Injector Implants",
        "Project Insight",
        "Smart Factories",
        "Smart Storage",
        "ABC SalesBots",
      ]) {
        if (
          (await Do(ns, "ns.corporation.getUpgradeLevel", upgrade)) <
            [0, 2, 20, 100, 150, 200][await div.c.currentround()] &&
          (await Do(ns, "ns.corporation.getUpgradeLevelCost", upgrade)) <=
            (await Do(ns, "ns.corporation.getCorporation")).funds
        ) {
          await Do(ns, "ns.corporation.levelUpgrade", upgrade);
          //                    ns.tprint(upgrade, ": ", await Do(ns, "ns.corporation.getUpgradeLevel", upgrade));
          upgraded = true;
        }
      }
    }
    ["Sector-12", "Aevum", "Volhaven", "Chongqing", "Ishima", "New Tokyo"].map(
      (x: string) => (div.o[x].plunge = true)
    );
    ["Sector-12", "Aevum", "Volhaven", "Chongqing", "Ishima", "New Tokyo"].map(
      (x: string) => (div.w[x].plunge = true)
    );
  }
}
