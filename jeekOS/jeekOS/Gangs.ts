import { NS } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { Do } from "jeekOS/Do";
import { jFormat } from "jeekOS/jFormat";

export class Gangs {
  Game: WholeGame;
  ns: NS;
  gangToJoin: string;
  clashTarget: number;
  log: any;
  display: any;
  constructor(game: WholeGame) {
    this.Game = game;
    this.ns = this.Game.ns;
    this.gangToJoin = this.Game.gangToJoin;
    this.clashTarget = 0.5;
    this.log = {};
    this.display = {};
  }
  async minimumDefense() {
    return 500 * (await Do(this.ns, "ns.gang.getMemberNames")).length;
  }
  async gangCreate() {
    if (!(await Do(this.ns, "ns.gang.inGang"))) {
      await this.Game.factions.factionJoin(this.gangToJoin);
      Do(this.ns, "ns.singularity.stopAction");
      await Do(this.ns, "ns.gang.createGang", this.gangToJoin);
    }
    return await Do(this.ns, "ns.gang.inGang");
  }
  async start() {
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".gangbox");
    this.log ??= this.Game.createSidebarItem("Gang", "", "G", "gangbox");
    this.display = this.Game.sidebar
      .querySelector(".gangbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");

    if (2 != (await Do(this.ns, "ns.getResetInfo")).currentNode) {
      this.karmaDisplay();
      while ((await Do(this.ns, "ns.heart.break")) > -54000) {
        await this.Game.crime.lowerKarma(-54000);
      }
    }
    this.mainLoop();
  }
  async karmaDisplay() {
    while ((await Do(this.ns, "ns.heart.break")) > -54000) {
      this.display.innerHTML =
        "<TABLE WIDTH=100%><TR><TD><H1>" + (await Do(this.ns, "ns.heart.break")).toString() + "</H1></TD></TR></TABLE>";
      await this.ns.asleep(1000);
    }
  }
  async hackAugs() {
    let augs = await Do(
      this.ns,
      "ns.singularity.getAugmentationsFromFaction",
      (
        await Do(this.ns, "ns.gang.getGangInformation")
      ).faction
    );
    let owned = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
    augs = augs.filter((x: any) => !owned.includes(x));
    let augData: { [key: string]: any } = {};
    for (let aug of augs) {
      augData[aug] = Do(this.ns, "ns.singularity.getAugmentationStats", aug);
    }
    for (let aug of augs) {
      augData[aug] = await augData[aug];
      augData[aug].price = Do(
        this.ns,
        "ns.singularity.getAugmentationPrice",
        aug
      );
      augData[aug].rep = Do(
        this.ns,
        "ns.singularity.getAugmentationRepReq",
        aug
      );
    }
    for (let aug of augs) {
      augData[aug].price = await augData[aug].price;
      augData[aug].rep = await augData[aug].rep;
    }
    let augs2 = augs.filter(
      (x: any) =>
        augData[x]["hacking_chance"] +
          augData[x]["hacking_exp"] +
          augData[x]["hacking"] +
          augData[x]["hacking_grow"] +
          augData[x]["hacking_money"] +
          augData[x]["hacking_speed"] +
          augData[x]["charisma"] +
          augData[x]["charisma_exp"] +
          augData[x]["faction_rep"] +
          augData[x]["company_rep"] +
          augData[x]["work_money"] >
          11 ||
        x == "CashRoot Starter Kit" ||
        x == "The Red Pill" ||
        x == "Neuroreceptor Management Implant"
    );
    if (augs2.length == 0) {
      augs2 = augs;
    }
    if (augs.length == 0) {
      return false;
    }
    augs = augs2.sort((a: any, b: any) => {
      return augData[a].rep - augData[b].rep;
    });
    if (
      (await Do(
        this.ns,
        "ns.singularity.getFactionRep",
        (
          await Do(this.ns, "ns.gang.getGangInformation")
        ).faction
      )) > augData[augs[0]].rep
    ) {
      if ((await Do(this.ns, "ns.getPlayer")).money > augData[augs[0]].price) {
        augs = augs.sort((a: any, b: any) => {
          return -augData[a].price + augData[b].price;
        });
        for (let aug of augs) {
          await Do(
            this.ns,
            "ns.singularity.purchaseAugmentation",
            (
              await Do(this.ns, "ns.gang.getGangInformation")
            ).faction,
            aug
          );
        }
        return true;
      }
    }
    return (
      (await Do(
        this.ns,
        "ns.singularity.getFactionRep",
        (
          await Do(this.ns, "ns.gang.getGangInformation")
        ).faction
      )) > augData[augs[0]].rep
    );
  }
  async mainLoop() {
    let loopStop = Date.now();
    while (!this.ns.gang.inGang()) {
      await this.ns.asleep(1000);
    }
    let taskNames = await Do(this.ns, "ns.gang.getTaskNames");
    let didSomething = true;
    let z = 0;
    while (z < 20 && didSomething) {
      z += 1;
      didSomething = false;
      let filterMembers = await Do(this.ns, "ns.gang.getMemberNames");
      filterMembers = this.Game.gangMemberNames.filter(
        (x: string) => !filterMembers.includes(x)
      );
      let filterMembers2: string[] = (
        await Do(this.ns, "ns.gang.getMemberNames")
      )
        .filter((x: any) => !this.Game.gangMemberNames.includes(x))
        .filter((x: any) => !filterMembers.includes(x));
      if (filterMembers2.length > 0) {
        Do(
          this.ns,
          "ns.gang.renameMember",
          filterMembers2[Math.floor(filterMembers2.length * Math.random())],
          filterMembers[Math.floor(filterMembers.length * Math.random())]
        );
        didSomething = true;
      }
    }
    let readyToEarn: string[] = [];
    let money: any = this.hackAugs();
    while (true) {
      let startPower = (await Do(this.ns, "ns.gang.getGangInformation"))!.power;
      let GI = await Do(this.ns, "ns.gang.getGangInformation");
      let top =
        jFormat(GI.respect) +
        " " +
        jFormat(GI.power) +
        " " +
        jFormat(GI.territory * 100) +
        "<TABLE BORDER=1 WIDTH=100% CELLPADDING=0 CELLSPACING=0>";
      let members = await Do(this.ns, "ns.gang.getMemberNames");
      let total = 0;
      let rows: any = [];
      for (let member of members) {
        let mR = await Do(this.ns, "ns.gang.getMemberInformation", member);
        total += mR.earnedRespect;
        rows.push("");
        rows[rows.length - 1] +=
          "<TR><TD>" + member + "</TD><TD>" + mR.task + "</TD>";
        for (let stat of [
          "hack",
          "str",
          "def",
          "dex",
          "agi",
          "cha",
          "earnedRespect",
        ]) {
          rows[rows.length - 1] +=
            "<TD ALIGN=CENTER>" + mR[stat].toString() + "</TD>";
        }
        const regex: RegExp = new RegExp(/[a-z ]+/g);
        rows[rows.length - 1] +=
          "<TD>" +
          mR.augmentations.join(", ").replace(regex, "") +
          "</TD></TR>";
        rows[rows.length - 1] = [-mR.str_asc_mult, rows[rows.length - 1]];
      }
      this.display.innerHTML =
        top +
        rows
          .sort((a: any, b: any) => {
            return a[0] - b[0];
          })
          .map((x: any) => {
            return x[1];
          })
          .join("") +
        "</TABLE>";
      this.log.recalcHeight();
      // Clash time
      members.map((x: any) =>
        Do(this.ns, "ns.gang.setMemberTask", x, "Territory Warfare")
      );
      while (1000 < (await Do(this.ns, "ns.gang.getBonusTime"))) {
        await this.ns.asleep(1000);
      }
      let othergangs = await Do(this.ns, "ns.gang.getOtherGangInformation");
      if (
        Object.keys(othergangs).filter((x) => othergangs[x].territory > 0)
          .length > 0
      ) {
        let chances: { [key: string]: number } = {};
        for (let other of Object.keys(othergangs)) {
          if (othergangs[other].territory > 0) {
            chances[other] = await Do(
              this.ns,
              "ns.gang.getChanceToWinClash",
              other
            );
          }
        }
        let total = Object.keys(chances)
          .map((x) => chances[x] * othergangs[x].territory)
          .reduce((a, b) => a + b);
        if (
          total /
            (1 - (await Do(this.ns, "ns.gang.getGangInformation")).territory) >=
            this.clashTarget ||
          Object.keys(chances).every((x) => chances[x] >= this.clashTarget)
        )
          Do(this.ns, "ns.gang.setTerritoryWarfare", true);
      }

      while (
        (await Do(this.ns, "ns.gang.getGangInformation")).power == startPower
      ) {
        await this.ns.asleep(0);
      }
      if (readyToEarn.length + 1 >= members.length) this.ascendMembers();
      loopStop = Date.now();
      Do(this.ns, "ns.gang.setTerritoryWarfare", false);
      let filterMembers: string[] = await Do(this.ns, "ns.gang.getMemberNames");
      filterMembers = this.Game.gangMemberNames.filter(
        (x: string) => !filterMembers.includes(x)
      );
      while (
        filterMembers.length > 0 &&
        (await Do(
          this.ns,
          "ns.gang.recruitMember",
          filterMembers[Math.floor(Math.random() * filterMembers.length)]
        ))
      ) {}
      let memberNames: string[] = await Do(this.ns, "ns.gang.getMemberNames");
      let memberData: { [key: string]: any } = {};
      for (let member of memberNames) {
        memberData[member] = Do(
          this.ns,
          "ns.gang.getMemberInformation",
          member
        )!;
      }
      for (let member of memberNames) {
        memberData[member] = await memberData[member];
        memberData[member]["total"] =
          memberData[member]["str"] +
          memberData[member]["def"] +
          memberData[member]["dex"] +
          memberData[member]["cha"] +
          memberData[member]["hack"];
        memberData[member]["total_exp"] =
          memberData[member]["str_exp"] +
          memberData[member]["def_exp"] +
          memberData[member]["dex_exp"] +
          memberData[member]["cha_exp"] +
          memberData[member]["hack_exp"];
      }
      this.getGear(memberData);
      let minDef = await this.minimumDefense();
      readyToEarn = [];
      Object.keys(memberData).map((x: any) =>
        memberData[x]["cha_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Charisma")!
          : memberData[x]["hack_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Hacking")!
          : memberData[x]["str_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["dex_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["def_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : memberData[x]["agi_exp"] < minDef
          ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")!
          : readyToEarn.push(x)
      );
      let letsDoThis: any[] = [];
      let genInfo = await Do(this.ns, "ns.gang.getGangInformation");
      let tD: { [key: string]: any } = {};
      for (let task of taskNames) {
        tD[task] = await Do(this.ns, "ns.gang.getTaskStats", task);
      }

      let gI = await Do(this.ns, "ns.gang.getGangInformation");
      if (
        gI.wantedLevel >= 13 - members.length &&
        gI.wantedPenalty <= 0.87 + 0.01 * members.length
      ) {
        for (let member of readyToEarn) {
          letsDoThis.push([member, "Vigilante Justice", 0, 0]);
        }
      } else {
        for (let member of readyToEarn) {
          let mD = await Do(this.ns, "ns.gang.getMemberInformation", member);
          for (let task of taskNames) {
            letsDoThis.push([
              member,
              task,
              this.ns.formulas.gang.respectGain(genInfo, mD, tD[task]),
              this.ns.formulas.gang.moneyGain(genInfo, mD, tD[task]),
            ]);
          }
        }
      }
      try {
        letsDoThis = letsDoThis.filter(
          (x: any) => memberData[x[0]]["total"] >= 700 || x[1] != "Terrorism"
        );
      } catch {}
      money = await money;
      while (letsDoThis.length > 0) {
        if (!money) {
          letsDoThis = letsDoThis.sort((a: any, b: any) => {
            return -a[2] + b[2];
          });
        } else {
          letsDoThis = letsDoThis.sort((a: any, b: any) => {
            return -a[3] + b[3];
          });
        }
        let meNext: string = letsDoThis[0][0];
        Do(
          this.ns,
          "ns.gang.setMemberTask",
          letsDoThis[0][0],
          letsDoThis[0][1]
        );
        letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
        if (letsDoThis.length > 0) {
          if (!money) {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[2] + b[2];
            });
          } else {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[3] + b[3];
            });
          }
          meNext = letsDoThis[0][0];
          Do(
            this.ns,
            "ns.gang.setMemberTask",
            letsDoThis[0][0],
            letsDoThis[0][1]
          );
          letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
          if (letsDoThis.length > 0) {
            letsDoThis = letsDoThis.sort((a: any, b: any) => {
              return -a[3] + b[3];
            });
            meNext = letsDoThis[0][0];
            Do(
              this.ns,
              "ns.gang.setMemberTask",
              letsDoThis[0][0],
              letsDoThis[0][1]
            );
            letsDoThis = letsDoThis.filter((x: any) => x[0] != meNext);
          }
        }
      }
      if (0 == (await Do(this.ns, "ns.gang.getBonusTime"))) {
        await this.ns.asleep(
          loopStop + 20500 - 500 * memberNames.length - Date.now()
        );
      }
      money = this.hackAugs();
    }
  }
  async getGear(memberData: { [key: string]: any }) {
    let members: string[] = Object.keys(memberData);
    members.sort((a: any, b: any) => {
      return memberData[a].str_mult - memberData[b].str_mult;
    });
    if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 2) {
      members.map((a: any) =>
        Do(this.ns, "ns.gang.purchaseEquipment", a, "Glock 18C")
      );
    }
    let funds = Math.min(
      (await Do(this.ns, "ns.getMoneySources")).sinceInstall.gang,
      (await Do(this.ns, "ns.getPlayer"))!.money
    );

    let discount = 1;
    // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
    if (
      members.length < 12 ||
      (await Do(this.ns, "ns.fileExists", "SQLInject.exe"))
    ) {
      let equip: string[] = await Do(this.ns, "ns.gang.getEquipmentNames");
      let equipCost: { [key: string]: number } = {};
      let equipStats: { [key: string]: any } = {};
      let equipType: { [key: string]: any } = {};
      for (let x of equip) {
        equipCost[x] = await Do(this.ns, "ns.gang.getEquipmentCost", x);
        equipStats[x] = await Do(this.ns, "ns.gang.getEquipmentStats", x);
        equipType[x] = await Do(this.ns, "ns.gang.getEquipmentType", x);
      }
      if ((await Do(this.ns, "ns.gang.getGangInformation")).territory > 0.98) {
        equip = equip.sort((a: any, b: any) => equipCost[b] - equipCost[a]);
      } else {
        equip = equip.sort(
          (a: any, b: any) => equipStats[b]["cha"] - equipStats[a]["cha"]
        );
        equip = equip.sort(
          (a: any, b: any) => equipStats[b]["str"] - equipStats[a]["str"]
        );
      }
      for (let j = 0; j < equip.length; j++) {
        for (let i of members) {
          let total = Math.min(
            memberData[i].str,
            memberData[i].dex,
            memberData[i].def,
            memberData[i].cha,
            memberData[i]["hack"]
          );
          // Buy the good stuff only once the terrorism stats are over 700.
          if (
            equipType[equip[j]] == "Augmentation" &&
            (await Do(this.ns, "ns.gang.purchaseEquipment", i, equip[j]))
          ) {
            this.ns.toast(i + " now owns " + equip[j]);
            memberData[i] = await Do(
              this.ns,
              "ns.gang.getMemberInformation",
              i
            );
          }
          if (
            (total >= 140 || members.length < 12) &&
            equipCost[equip[j]] < funds / discount &&
            (await Do(this.ns, "ns.gang.purchaseEquipment", i, equip[j]))
          ) {
            this.ns.toast(i + " now owns " + equip[j]);
            funds -= equipCost[equip[j]] / discount;
            memberData[i] = await Do(
              this.ns,
              "ns.gang.getMemberInformation",
              i
            );
          } else {
            if (
              await Do(this.ns, "ns.gang.purchaseEquipment", i, "Glock 18C")
            ) {
              this.ns.toast(i + " now owns Glock 18C");
              funds -= equipCost["Glock 18C"] / discount;
              memberData[i] = await Do(
                this.ns,
                "ns.gang.getMemberInformation",
                i
              );
            }
          }
        }
      }
    }
  }
  async ascendMembers() {
    let members: string[] = await Do(this.ns, "ns.gang.getMemberNames");
    let memberData: { [key: string]: any } = {};
    for (let member of members) {
      memberData[member] = await Do(
        this.ns,
        "ns.gang.getMemberInformation",
        member
      );
    }
    let gangInfo = await Do(this.ns, "ns.gang.getGangInformation");
    let avgrespect =
      members
        .map((x: any) => memberData[x].earnedRespect)
        .reduce((a: any, b: any) => a + b, 0) / members.length;
    if (avgrespect >= 0) {
      let ascendable = [...members];
      ascendable = ascendable.filter((x) =>
        ["hack_exp", "str_exp", "def_exp", "dex_exp", "agi_exp", "cha_exp"]
          .map((y) => memberData[x][y] > 1000)
          .reduce((a, b) => a || b)
      );
      let ascResult: { [key: string]: any } = {};
      for (let member of ascendable) {
        ascResult[member] = await Do(
          this.ns,
          "ns.gang.getAscensionResult",
          member
        );
      }
      let check: { [key: string]: number } = {};
      if (gangInfo.territory > 0.98) {
        ascendable.forEach(
          (x) =>
            (check[x] =
              1.66 - 0.62 / Math.exp((2 / memberData[x].cha_asc_mult) ** 2.24))
        );
        ascendable = ascendable.filter((x) => check[x] < ascResult[x]["cha"]);
      } else {
        ascendable.forEach(
          (x) =>
            (check[x] =
              1.66 - 0.62 / Math.exp((2 / memberData[x].str_asc_mult) ** 2.24))
        );
        ascendable = ascendable.filter((x) => check[x] < ascResult[x]["str"]);
      }
      ascendable = ascendable.filter(
        (x) => memberData[x].earnedRespect < avgrespect
      );
      ascendable.sort((a, b) => check[b] - check[a]);
      if (ascendable.length > 0) {
        for (let k = 0; k < ascendable.length; k++) {
          if (await Do(this.ns, "ns.gang.ascendMember", ascendable[k])) {
            this.ns.toast(ascendable[k] + " ascended!");
            k = 1000;
          }
        }
      }
    }
  }
}
