import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";

export async function agriculture(divObj: Division) {
  let ns = divObj.ns;
  let div = divObj.name;
  while (!divObj.initialized) {
    await divObj.ns.asleep(0);
  }
  divObj.goalSize = Math.max(divObj.goalSize, 4);
  await divObj.warehouseLevel(6);
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    for (let mat of divObj.indData.producedMaterials) {
      Do(ns, "ns.corporation.sellMaterial", div, city, mat, "MAX", "MP");
    }
  }
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 3
    ) {
      while (divObj.c.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.c.state != "START") {
        await divObj.ns.asleep(0);
      }
    }
  }
  while ((await Do(ns, "ns.corporation.getHireAdVertCount", div)) < 2) {
    if (await Do(ns, "ns.corporation.hireAdVert", div)) {
      await divObj.ns.asleep(0);
    } else {
      while (divObj.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.state != "START") {
        await divObj.ns.asleep(0);
      }
    }
  }
  await divObj.upgradeIt("Smart Storage", 6);
  divObj.rd = true;
  while (
    (await Do(ns, "ns.corporation.getDivision", div)).researchPoints < 55
  ) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  if (
    (await Do(ns, "ns.corporation.getInvestmentOffer")).round == 1 ||
    (
      await Do(
        ns,
        "ns.corporation.getMaterial",
        divObj.name,
        "Sector-12",
        "AI Cores"
      )
    ).stored < 1109
  ) {
    divObj.WarehouseSet("AI Cores", 1733);
    divObj.WarehouseSet("Hardware", 1981);
    divObj.WarehouseSet("Real Estate", 106686);
    divObj.WarehouseSet("Robots", 0);
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.warehouseLevel(10);
  if ((await Do(ns, "ns.corporation.getCorporation")).funds > 0) {
    await divObj.getHappy();
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.goalSize = Math.max(divObj.goalSize, 8);
  divObj.upgradeIt("Smart Storage", 17);
  divObj.upgradeIt("Smart Factories", 9);
  while ((await Do(ns, "ns.corporation.getHireAdVertCount", div)) < 8) {
    if (await Do(ns, "ns.corporation.hireAdVert", div)) {
      await divObj.ns.asleep(0);
    } else {
      while (divObj.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.state != "START") {
        await divObj.ns.asleep(0);
      }
    }
  }
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 8
    ) {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = true;
  while ((await divObj.researchPoints) < 700) {
    while (divObj.c.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.c.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  while (
    Object.keys(
      (await Do(divObj.ns, "ns.corporation.getCorporation")).divisions
    ).length < 19
  ) {
    await divObj.ns.asleep(0);
  }
  if ((await Do(ns, "ns.corporation.getInvestmentOffer")).round >= 1) {
    divObj.WarehouseSet("AI Cores", 4419);
    divObj.WarehouseSet("Hardware", 4966);
    divObj.WarehouseSet("Real Estate", 235632);
    divObj.WarehouseSet("Robots", 484);
  }
  divObj.ding = true;
  while ((await divObj.c.currentround()) < 3) {
    await divObj.ns.asleep(0);
  }
  await divObj.warehouseLevel(15);
  await Promise.all([
    divObj.upgradeIt("Smart Storage", 25),
    divObj.upgradeIt("Smart Factories", 16),
  ]);
  await divObj.getHappy();
  divObj.goalSize = 9;
  while (
    !(await Do(divObj.ns, "ns.corporation.getCorporation")).divisions.includes(
      "Smoky"
    )
  ) {
    await divObj.ns.asleep(100);
  }
  while (
    (await Do(divObj.ns, "ns.corporation.getDivision", "Smoky")).products
      .length < 2
  ) {
    await divObj.ns.asleep(100);
  }
  ["Sector-12", "Ishima", "New Tokyo", "Volhaven", "Chongqing", "Aevum"].map(
    (x: string) =>
      Do(
        divObj.ns,
        "ns.corporation.limitMaterialProduction",
        "Farmy",
        x,
        "Food",
        0
      )
  );
}
