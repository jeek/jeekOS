import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";

export async function chemical(divObj: Division) {
  let ns = divObj.ns;
  let div = divObj.name;
  while (!divObj.initialized) {
    await divObj.ns.asleep(0);
  }
  while ((await Do(ns, "ns.corporation.getInvestmentOffer")).round < 2) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  let divData: any = await Do(ns, "ns.corporation.getDivision", div);
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    while (
      (await Do(ns, "ns.corporation.getOffice", div, city)).numEmployees < 3
    ) {
      while (divObj.state == "START") {
        await divObj.ns.asleep(0);
      }
      while (divObj.state != "START") {
        await divObj.ns.asleep(0);
      }
      await Do(
        ns,
        "ns.corporation.hireEmployee",
        div,
        city,
        "Research & Development"
      );
    }
    divObj.rd = true;
  }
  await divObj.upgradeIt("Smart Storage", 15);
  await divObj.upgradeIt("Smart Factories", 9);
  await divObj.getHappy();
  while (
    (await Do(divObj.ns, "ns.corporation.getDivision", div)).researchPoints <
    390
  ) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
  }
  divObj.rd = false;
  let divs = Math.floor(
    20 * (await Do(divObj.ns, "ns.getBitNodeMultipliers")).CorporationDivisions
  );
  while (
    Object.keys(
      (await Do(divObj.ns, "ns.corporation.getCorporation")).divisions
    ).length <
    divs - 1
  ) {
    await divObj.ns.asleep(0);
  }
  if ((await Do(ns, "ns.corporation.getInvestmentOffer")).round >= 2) {
    divObj.WarehouseSet("AI Cores", 543);
    divObj.WarehouseSet("Hardware", 1238);
    divObj.WarehouseSet("Real Estate", 25577);
    divObj.WarehouseSet("Robots", 0);
  }
  divObj.ding = true;
  for (let city of Object.values(ns.enums.CityName) as string[]) {
    divObj.warehouseLevel(3);
  }
  while ((await divObj.c.currentround()) < 3) {
    await divObj.ns.asleep(0);
  }
  divObj.goalSize = 9;
  while (!(await Do(ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
    while (divObj.state == "START") {
      await divObj.ns.asleep(0);
    }
    while (divObj.state != "START") {
      await divObj.ns.asleep(0);
    }
    if (
      (await Do(ns, "ns.corporation.getUnlockCost", "Smart Supply")) <
      (await Do(ns, "ns.corporation.getCorporation")).funds
    ) {
      await Do(ns, "ns.corporation.purchaseUnlock", "Smart Supply");
    }
  }
}
