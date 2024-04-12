import { NS } from "@ns";
import { Do } from "jeekOS/Do";

export class AugChart {
  ns: NS;
  data: { [key: string]: any };
  initialized: boolean;
  factions: string[];
  augs: Set<string>;
  stats: Set<string>;
  augfilter: string[];
  constructor(
    ns: NS,
    factset = [
      "CyberSec",
      "Tian Di Hui",
      "NiteSec",
      "The Black Hand",
      "BitRunners",
      "Daedalus",
    ],
    augfilter: string[] = []
  ) {
    this.ns = ns;
    this.initialized = false;
    this.data = {};
    this.factions = factset;
    this.augs = new Set();
    this.stats = new Set();
    this.augfilter = augfilter;
    this.initialize();
  }
  async initialize() {
    for (let faction of this.factions) {
      this.data[faction] = await Do(
        this.ns,
        "ns.singularity.getAugmentationsFromFaction",
        faction
      );
      for (let aug of this.data[faction]) {
        if (
          !(await Do(this.ns, "ns.singularity.getOwnedAugmentations")).includes(
            aug
          )
        )
          this.augs.add(aug);
      }
    }
    for (let aug of this.augs) {
      let temp = await Do(this.ns, "ns.singularity.getAugmentationStats", aug);
      for (let stat of Object.keys(temp)) {
        if (
          !stat.includes("bladeburner") &&
          temp[stat] != 1 &&
          !stat.includes("hacknet")
        ) {
          if (this.augfilter.includes(stat) || this.augfilter.length == 0) {
            this.stats.add(stat);
          }
        }
      }
    }
    this.initialized = true;
  }
  async display() {
    let React = eval("window").React;
    let doc = eval("document");
    while (this.initialized == false) {
      await this.ns.asleep(1000);
    }

    let rows: any[] = [];
    let row: any[] = [];
    let header: any[] = [];
    row.push(React.createElement("td"));
    for (let faction of this.factions) {
      row.push(React.createElement("td", {}, faction));
    }
    row.push(React.createElement("td"));
    for (let stat of this.stats) {
      if (this.augfilter.includes(stat) || this.augfilter.length == 0)
        row.push(React.createElement("td", {}, stat.replace("_", " ")));
    }
    header.push(row);
    for (let aug of this.augs) {
      row = [];
      row.push(React.createElement("td", {}, aug));
      for (let faction of this.factions) {
        if (
          (
            await Do(
              this.ns,
              "ns.singularity.getAugmentationsFromFaction",
              faction
            )
          ).includes(aug)
        ) {
          row.push(React.createElement("td", { align: "center" }, "X"));
        } else {
          row.push(React.createElement("td", { align: "center" }, " "));
        }
      }
      row.push(React.createElement("td"));
      let good = false;
      for (let stat of this.stats) {
        if (this.augfilter.includes(stat) || this.augfilter.length == 0) {
          if (
            (await Do(this.ns, "ns.singularity.getAugmentationStats", aug))[
              stat
            ] != 1
          ) {
            good = true;
            if (
              (await Do(this.ns, "ns.singularity.getAugmentationStats", aug))[
                stat
              ] > 1
            ) {
              row.push(
                React.createElement(
                  "td",
                  { align: "right", nowrap: "" },
                  "+" +
                    Math.floor(
                      0.5 +
                        ((
                          await Do(
                            this.ns,
                            "ns.singularity.getAugmentationStats",
                            aug
                          )
                        )[stat] -
                          1) *
                          100
                    ).toString() +
                    "%"
                )
              );
            } else {
              row.push(
                React.createElement(
                  "td",
                  { align: "right", nowrap: "" },
                  "-" +
                    Math.floor(
                      0.5 +
                        (1 /
                          (
                            await Do(
                              this.ns,
                              "ns.singularity.getAugmentationStats",
                              aug
                            )
                          )[stat] -
                          1) *
                          100
                    ).toString() +
                    "%"
                )
              );
            }
          } else {
            row.push(
              React.createElement("td", { align: "right", nowrap: "" }, " ")
            );
          }
        }
      }
      if (good) {
        rows.push([
          await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug),
          React.createElement("tr", {}, row),
        ]);
      }
    }
    rows = rows
      .sort((a: any, b: any) => {
        return a[0] - b[0];
      })
      .map((x: any) => x[1]);
    let table = React.createElement(
      "table",
      { border: 1, cellpadding: 0, cellspacing: 0 },
      header.concat(rows)
    );
    this.ns.tprintRaw(table);
  }
}
