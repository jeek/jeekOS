import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { Division } from "jeekOS/Division";
import { Corp } from "jeekOS/Corp";
import { WholeGame } from "jeekOS/WholeGame";

export class Warehouse {
  name: string;
  type: string;
  city: string;
  ns: NS;
  Game: WholeGame;
  Division: Division;
  initialized: boolean;
  plunge: boolean;
  goalSize: Number;
  goalLevel: Number;
  c: Corp;
  prices: { [key: string]: number[] };
  phase: { [key: string]: number };
  constructor(
    Game: WholeGame,
    name: string,
    city: string,
    MyDivision: Division
  ) {
    this.name = name;
    this.type = MyDivision.type;
    this.c = MyDivision.c;
    this.Game = Game;
    this.ns = Game.ns;
    this.city = city;
    this.Division = MyDivision;
    this.initialized = false;
    this.plunge = false;
    this.goalSize = 0;
    this.goalLevel = 0;
    this.phase = {};
    this.prices = {};
    this.start();
  }
  get state(): string {
    return this.c.state;
  }
  async start() {
    //        this.ns.tprint("Warehouse start: ", this.city);
    while (
      !(
        await Do(this.ns, "ns.corporation.getDivision", this.Division.name)
      ).cities.includes(this.city)
    ) {
      try {
        await this.ns.asleep(0);
      } catch {
        await this.ns.asleep(1000);
      }
    }
    while (
      !(await Do(
        this.ns,
        "ns.corporation.hasWarehouse",
        this.Division.name,
        this.city
      ))
    ) {
      try {
        if (
          (await Do(this.ns, "ns.corporation.getConstants"))
            .warehouseInitialCost <=
          (await Do(this.ns, "ns.corporation.getCorporation")).funds
        ) {
          await Do(
            this.ns,
            "ns.corporation.purchaseWarehouse",
            this.Division.name,
            this.city
          );
        } else {
          await this.ns.asleep(1000);
        }
      } catch {
        await this.ns.asleep(1000);
      }
    }
    this.smartSupply();
    while (this.Division.indData == null) {
      await this.ns.asleep(0);
    }
    if (this.Division.indData.makesMaterials) {
      for (let mat of this.Division.indData.producedMaterials) {
        Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.Division.name,
          this.city,
          mat,
          "MAX",
          "MP"
        );
      }
    }
    this.initialized = true;
  }
  async warehouseLevel(level: number) {
    while (
      level >
      (
        await Do(
          this.ns,
          "ns.corporation.getWarehouse",
          this.Division.name,
          this.city
        )
      ).level
    ) {
      try {
        await Do(
          this.ns,
          "ns.corporation.upgradeWarehouse",
          this.Division.name,
          this.city,
          1
        );
      } catch {}
      await this.ns.asleep(0);
    }
  }
  // based on SomeoneCrazy2's https://discord.com/channels/415207508303544321/923445881389338634/1180942656239583312
  async smartSupply() {
    let full = 1;
    while (!(await Do(this.ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
      let industryData = this.Division.indData;
      let divisionData = await Do(
        this.ns,
        "ns.corporation.getDivision",
        this.name
      );
      let productionMultScalar = divisionData.productionMult / 50;
      let requiredMaterials = industryData.requiredMaterials;
      for (let material of Object.keys(requiredMaterials)) {
        let materialData = await Do(
          this.ns,
          "ns.corporation.getMaterial",
          this.name,
          this.city,
          material
        );
        let materialProduction = -materialData.productionAmount;
        let materialImports = -materialData.exports;
        let materialStored = materialData.stored;

        let purchaseAmount =
          materialProduction - materialImports / 10 - materialStored / 10;

        let minimalMaterialBeingUsed = materialProduction < 10;
        let minimalMaterialStored = materialStored <= 5;

        if (minimalMaterialBeingUsed && minimalMaterialStored) {
          purchaseAmount =
            materialProduction -
            materialImports / 10 -
            materialStored / 10 +
            productionMultScalar * 5;
        } else {
          if (materialStored >= Math.abs(11 * materialProduction)) {
            purchaseAmount =
              materialProduction - materialImports / 10 - materialStored / 10;
          } else {
            purchaseAmount =
              materialProduction * 1.2 -
              materialImports / 10 -
              materialStored / 10 +
              productionMultScalar;
          }
        }
        if (purchaseAmount >= 0) {
          await Do(
            this.ns,
            "ns.corporation.buyMaterial",
            this.name,
            this.city,
            material,
            purchaseAmount * full
          );
        } else {
          await Do(
            this.ns,
            "ns.corporation.buyMaterial",
            this.name,
            this.city,
            material,
            0
          );
        }
      }
      while (this.state == "START") {
        await this.ns.asleep(0);
      }
      while (this.state != "PRODUCTION") {
        await this.ns.asleep(0);
      }
      let wh = await Do(
        this.ns,
        "ns.corporation.getWarehouse",
        this.name,
        this.city
      );
      if (wh.sizeUsed + 1 > wh.size) {
        full *= 0.99;
      } else {
        full /= 0.99;
        full = Math.min(full, 1);
      }
      while (this.state == "PRODUCTION") {
        await this.ns.asleep(0);
      }
      while (this.state != "START") {
        await this.ns.asleep(0);
      }
    }
    await Do(
      this.ns,
      "ns.corporation.setSmartSupply",
      this.name,
      this.city,
      true
    );
  }
  async WarehouseSet(material: string, amount: number) {
    let data: any = await Do(
      this.ns,
      "ns.corporation.getMaterial",
      this.name,
      this.city,
      material
    );
    let done = false;
    while (!done) {
      done = true;
      data = await Do(
        this.ns,
        "ns.corporation.getMaterial",
        this.name,
        this.city,
        material
      );
      if (data.stored < amount) {
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          Math.abs(data.stored - amount) / 10.0
        );
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          0,
          0
        );
        while (this.state == "START") {
          await this.ns.asleep(0);
        }
        while (this.state != "START") {
          await this.ns.asleep(0);
        }
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          0
        );
        done = false;
      }
      if (data.stored > amount) {
        await Do(
          this.ns,
          "ns.corporation.buyMaterial",
          this.name,
          this.city,
          material,
          0
        );
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          Math.abs(amount - data.stored) / 10.0,
          0
        );
        while (this.state == "START") {
          await this.ns.asleep(0);
        }
        while (this.state != "START") {
          await this.ns.asleep(0);
        }
        await Do(
          this.ns,
          "ns.corporation.sellMaterial",
          this.name,
          this.city,
          material,
          0,
          0
        );
        done = false;
      }
    }
  }

  async stateSTART() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async statePURCHASE() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async statePRODUCTION() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async stateEXPORT() {
    let x = await Do(
      this.ns,
      "ns.corporation.getWarehouse",
      this.name,
      this.city
    );
    if (x.sizeUsed + 1 > x.size) {
      await Do(
        this.ns,
        "ns.corporation.upgradeWarehouse",
        this.name,
        this.city
      );
    }
  }
  async stateSALE() {
    if (
      await Do(
        this.ns,
        "ns.corporation.hasResearched",
        this.name,
        "Market-TA.II"
      )
    ) {
      for (let product of (
        await Do(this.ns, "ns.corporation.getDivision", this.name)
      ).products) {
        await Do(
          this.ns,
          "ns.corporation.sellProduct",
          this.name,
          this.city,
          product,
          "MAX",
          "0",
          true
        );
        Do(
          this.ns,
          "ns.corporation.setProductMarketTA2",
          this.name,
          product,
          true
        );
      }
    } else {
      for (let product of (
        await Do(this.ns, "ns.corporation.getDivision", this.name)
      ).products) {
        let me = await Do(
          this.ns,
          "ns.corporation.getProduct",
          this.name,
          this.city,
          product
        );
        if (me.developmentProgress > 99) {
          if (!Object.keys(this.phase).includes(product)) {
            this.prices[product] = [1, 1];
            this.phase[product] = 1;
            await Do(
              this.ns,
              "ns.corporation.sellProduct",
              this.name,
              this.city,
              product,
              "MAX",
              "MP",
              true
            );
          }
        }
      }
      for (let product of Object.keys(this.phase)) {
        if (
          !(
            await Do(this.ns, "ns.corporation.getDivision", this.name)
          ).products.includes(product)
        ) {
          delete this.phase[product];
        } else {
          let me = await Do(
            this.ns,
            "ns.corporation.getProduct",
            this.name,
            this.city,
            product
          );
          if (me.developmentProgress > 99) {
            if (me.actualSellAmount < me.productionAmount) {
              if (this.phase[product] == 1) {
                this.phase[product] = 2;
              }
              if (this.phase[product] == 2) {
                this.prices[product][1] =
                  (this.prices[product][1] +
                    (this.prices[product][0] + this.prices[product][1]) / 2) /
                  2;
                if (this.prices[product][0] + 1 > this.prices[product][1]) {
                  this.phase[product] = 3;
                }
              }
              if (this.phase[product] == 3) {
                this.prices[product][0] = Math.max(
                  1,
                  this.prices[product][0] - 1
                );
                this.prices[product][1] = Math.max(
                  1,
                  this.prices[product][1] - 1
                );
              }
            } else {
              if (this.phase[product] == 1) {
                this.prices[product][1] *= 2;
              }
              if (this.phase[product] == 2) {
                this.prices[product][0] =
                  (this.prices[product][0] +
                    (this.prices[product][0] + this.prices[product][1]) / 2) /
                  2;
                if (this.prices[product][0] + 1 > this.prices[product][1]) {
                  this.phase[product] = 3;
                }
              }
              if (this.phase[product] == 3) {
                this.prices[product][0] = Math.max(
                  1,
                  this.prices[product][0] + 1
                );
                this.prices[product][1] = Math.max(
                  1,
                  this.prices[product][1] + 1
                );
              }
            }
            await Do(
              this.ns,
              "ns.corporation.sellProduct",
              this.name,
              this.city,
              product,
              "MAX",
              (
                (this.prices[product][0] + this.prices[product][1]) /
                2
              ).toString() + "*MP",
              false
            );
          }
        }
      }
      let x = await Do(
        this.ns,
        "ns.corporation.getWarehouse",
        this.name,
        this.city
      );
      if (x.sizeUsed + 1 > x.size) {
        await Do(
          this.ns,
          "ns.corporation.upgradeWarehouse",
          this.name,
          this.city
        );
      }
    }
    if (this.Division.indData.makesMaterials) {
      for (let material of this.Division.indData.producedMaterials) {
        let matData = await Do(
          this.ns,
          "ns.corporation.getMaterial",
          this.name,
          this.city,
          material
        );
        if (
          matData.stored + matData.actualSellAmount < 0.001 &&
          matData.productionAmount > 10
        ) {
          await Do(
            this.ns,
            "ns.corporation.upgradeOfficeSize",
            this.name,
            this.city,
            3
          );
        }
      }
    }
  }
}
