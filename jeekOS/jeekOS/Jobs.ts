import { NS } from "@ns";
import { Do } from "jeekOS/Do";
import { WholeGame } from "jeekOS/WholeGame";
import { jFormat } from "jeekOS/jFormat";

export class Jobs {
  Game: WholeGame;
  ns: NS;
  log: any;
  display: any;
  constructor(Game: WholeGame) {
    this.Game = Game;
    this.ns = Game.ns;
    this.log = {};
    this.display = {};
  }
  async allJobs() {
    this.log = this.Game.doc.querySelector(".sb")!.querySelector(".jobbox");
    this.log ??= this.Game.createSidebarItem("Job", "", "J", "jobbox");
    this.display = this.Game.sidebar
      .querySelector(".jobbox")!
      .querySelector(".display");
    this.display.removeAttribute("hidden");
    while (true) {
      let jobs: any[] = [];
      let table = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
      for (let company of Object.values(this.ns.enums.CompanyName)) {
        let positions: any[] = [];
        for (let position of await Do(
          this.ns,
          "ns.singularity.getCompanyPositions",
          company
        )) {
          let posInfo = await Do(
            this.ns,
            "ns.singularity.getCompanyPositionInfo",
            company,
            position
          );
          posInfo.company = company;
          positions.push(posInfo);
        }
        let playerStats = await Do(this.ns, "ns.getPlayer");
        for (let skill of [
          "hacking",
          "charisma",
          "defense",
          "dexterity",
          "strength",
          "charisma",
        ]) {
          positions = positions.filter(
            (x: any) => x.requiredSkills[skill] <= playerStats.skills[skill]
          );
        }
        let rep = await Do(this.ns, "ns.singularity.getCompanyRep", company);
        positions = positions.filter((x: any) => x.requiredReputation <= rep);
        positions.sort((a: any, b: any) => {
          return b.salary - a.salary;
        });
        if (positions.length > 0) {
          await Do(
            this.ns,
            "ns.singularity.applyToCompany",
            company,
            positions[0].field
          );
          jobs.push(positions[0]);
        }
      }
      let numSleeves = await Do(this.ns, "ns.sleeve.getNumSleeves");
      let sleeveStats: { [key: string]: any } = {};
      let sleeves: any[] = [];
      for (let i = 0; i < numSleeves; i++) {
        sleeveStats[i] = await Do(this.ns, "ns.sleeve.getSleeve", i);
        await Do(this.ns, "ns.sleeve.setToIdle", i);
        if (sleeveStats[i].sync < 100) {
          Do(this.ns, "ns.sleeve.setToSynchronize", i);
        } else {
          sleeves.push(i);
          for (let buyMe of await Do(
            this.ns,
            "ns.sleeve.getSleevePurchasableAugs",
            i
          )) {
            if (sleeveStats[i].shock == 0) {
              Do(this.ns, "ns.sleeve.purchaseSleeveAug", i, buyMe["name"]);
            }
          }
        }
      }
      if (numSleeves > 1) {
        sleeves.sort((a: any, b: any) => {
          return sleeveStats[a].shock - sleeveStats[b].shock;
        });
        if (sleeveStats[sleeves[sleeves.length - 1]].shock > 0) {
          await Do(this.ns, "ns.sleeve.setToShockRecovery", sleeves.pop());
        }
      }
      let cw = await Do(this.ns, "ns.singularity.getCurrentWork");
      if (cw != null && cw.type == "CRIME") {
        let curWork = await Do(this.ns, "ns.singularity.getCurrentWork");
        sleeves.map((x: any) =>
          Do(this.ns, "ns.sleeve.setToCommitCrime", x, curWork.crimeType)
        );
        sleeves = [];
      }
      let factionInfo: any[] = [];
      let jobInfo: any[] = [];
      for (let sleeve of sleeves) {
        for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
          factionInfo.push([
            (
              await Do(
                this.ns,
                "ns.formulas.work.factionGains",
                sleeveStats[sleeve],
                "hacking",
                await Do(this.ns, "ns.singularity.getFactionFavor", faction)
              )
            ).reputation,
            "FACTION",
            sleeve,
            faction,
          ]);
        }
        for (let job of jobs) {
          jobInfo.push([
            (
              await Do(
                this.ns,
                "ns.formulas.work.companyGains",
                sleeveStats[sleeve],
                job.company,
                job.name,
                await Do(this.ns, "ns.singularity.getCompanyFavor", job.company)
              )
            )["hacking"],
            "COMPANY",
            sleeve,
            job.company,
          ]);
        }
      }
      let work = await Do(this.ns, "ns.singularity.getCurrentWork");
      factionInfo.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      jobInfo.sort((a: any, b: any) => {
        return b[0] - a[0];
      });
      let best: any = {};
      if (await Do(this.ns, "ns.gang.inGang")) {
        let myGang = (await Do(this.ns, "ns.gang.getGangInformation")).faction;
        factionInfo = factionInfo.filter((x: any) => x[3] != myGang);
      }
      if (work != null && work.type == "FACTION") {
        best = factionInfo.filter((x: any) => x[3] == work.factionName)[0];
        await Do(
          this.ns,
          "ns.sleeve.setToFactionWork",
          best[2],
          work.factionName,
          work.factionWorkType
        );
        factionInfo = factionInfo
          .filter((x: any) => x[2] != best[2])
          .filter((x: any) => x[3] != best[3]);
        jobInfo = jobInfo.filter((x: any) => x[2] != best[2]);
      }
      jobs.sort((a: any, b: any) => {
        return b.reputation - a.reputation;
      });
      for (let company of [
        "Bachman & Associates",
        "Four Sigma",
        "Clarke Incorporated",
        "ECorp",
        "MegaCorp",
        "NWO",
        "Blade Industries",
        "KuaiGong International",
        "OmniTek Incorporated",
      ]) {
        if (!(await Do(this.ns, "ns.getPlayer")).factions.includes(company)) {
          if (jobInfo.filter((x: any) => x[3] == company).length > 0) {
            while (
              await Do(
                this.ns,
                "ns.hacknet.spendHashes",
                "Company Favor",
                company
              )
            );
            best = jobInfo.filter((x: any) => x[3] == company)[0];
            await Do(this.ns, "ns.sleeve.setToCompanyWork", best[2], best[3]);
            factionInfo = factionInfo.filter(
              (x: any) => x[2] != best[2] && x[3] != best[3]
            );
            jobInfo = jobInfo.filter(
              (x: any) => x[2] != best[2] && x[3] != best[3]
            );
          }
        }
      }
      while (factionInfo.length > 0) {
        best = factionInfo[0];
        await Do(
          this.ns,
          "ns.sleeve.setToFactionWork",
          best[2],
          best[3],
          "hacking"
        );
        factionInfo = factionInfo.filter(
          (x: any) => x[2] != best[2] && x[3] != best[3]
        );
        jobInfo = jobInfo.filter((x: any) => x[2] != best[2]);
      }
      jobs.sort((a: any, b: any) => {
        return b.salary - a.salary;
      });
      let z = 0;
      while (jobInfo.length > 0) {
        best = jobInfo.filter((x: any) => x[3] == jobs[z].company)[0];
        await Do(this.ns, "ns.sleeve.setToCompanyWork", best[2], best[3]);
        jobInfo = jobInfo.filter(
          (x: any) => x[2] != best[2] && x[3] != best[3]
        );
        z += 1;
      }
      let i = 0;
      while (i < jobs.length) {
        table =
          table +
          '<TR><TD><FONT FACE="Hack">' +
          jobs[i].company +
          '</TD><TD><FONT FACE="Hack">' +
          jobs[i].name +
          '</TD><TD><FONT FACE="Hack">' +
          jFormat(jobs[i].salary) +
          "</TD><TD>" +
          jFormat(
            await Do(this.ns, "ns.singularity.getCompanyRep", jobs[i].company)
          ) +
          "</TD></TR>";
        i += 1;
      }
      this.display.innerHTML = table + "</TR></TABLE>";
      this.log.recalcHeight();
      await this.ns.asleep(60000);
    }
  }
  async unlockFaction(company: string) {
    let ns: NS = this.ns;
    let jobs: any[] = [];
    if (company != this.Game.gangToJoin) {
      if ((await Do(this.ns, "ns.getPlayer"))!.city == "Sector-12") {
        await this.Game.collegegym.raiseHacking(250);
        await this.Game.collegegym.raiseHacking(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
        );
        await this.Game.collegegym.raiseCharisma(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
        );
      } else {
        await this.Game.collegegym.raiseHacking(250);
        await this.Game.collegegym.raiseHacking(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
        );
        await this.Game.collegegym.raiseCharisma(
          100 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
        );
      }
    }
    if (
      !(await Do(ns, "ns.getPlayer")).factions.includes(
        company == "Fulcrum Secret Techologies"
          ? "Fulcrum Technologies"
          : company
      )
    ) {
      while (
        !(await Do(ns, "ns.getPlayer")).factions.includes(
          company == "Fulcrum Secret Techologies"
            ? "Fulcrum Technologies"
            : company
        )
      ) {
        jobs = [];
        let faction = company;
        if (company == "Fulcrum Technologies") {
          faction = "Fulcrum Secret Technologies";
        }
        if (faction == "Fulcrum Secret Technologies") {
          company = "Fulcrum Technologies";
        }
        if (
          (await Do(ns, "ns.singularity.getCompanyRep", company)) < 400000 &&
          !(await Do(ns, "ns.getPlayer")).factions.includes(faction)
        ) {
          for (let position of await Do(
            ns,
            "ns.singularity.getCompanyPositions",
            company
          )) {
            jobs = jobs.concat([
              [
                company,
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  company,
                  position
                ),
              ],
            ]);
            if (
              jobs[jobs.length - 1][1]["requiredReputation"] >
              (await Do(ns, "ns.singularity.getCompanyRep", company))
            ) {
              jobs.pop();
            }
            for (let skill of [
              "hacking",
              "intelligence",
              "strength",
              "dexterity",
              "defense",
              "agility",
              "charisma",
            ]) {
              if (
                jobs.length > 0 &&
                (await Do(ns, "ns.getPlayer"))!.skills[skill] <
                  jobs[jobs.length - 1][1].requiredSkills[skill]
              ) {
                jobs.pop();
              }
            }
          }
        }
        jobs = jobs.sort((a, b) => {
          return (
            a[1].requiredReputation * a[1].salary -
            b[1].requiredReputation * b[1].salary
          );
        });
        // TODO: Rewrite to sort but use Do
        //            if ((await Do(ns, "ns.ls", "home")).includes("Formulas.exe")) {
        //              jobs = jobs.sort((a, b) => { return ns.formulas.work.companyGains(ns.getPlayer(), a[0], a[1]["name"], ns.singularity.getCompanyFavor(a[0])).reputation - ns.formulas.work.companyGains(ns.getPlayer(), b[0], b[1]["name"], ns.singularity.getCompanyFavor(b[0])).reputation })
        //            }
        if (jobs.length > 0) {
          await Do(
            ns,
            "ns.singularity.applyToCompany",
            jobs[jobs.length - 1][0],
            jobs[jobs.length - 1][1].field
          );
          await Do(
            ns,
            "ns.singularity.workForCompany",
            jobs[jobs.length - 1][0],
            !(await Do(
              this.ns,
              "ns.singularity.getOwnedAugmentations",
              false
            ))!.includes("Neuroreceptor Management Implant")
          );
        }
        if (jobs.length > 0) {
          if (jobs[jobs.length - 1][1].nextPosition === null) {
          } else {
            if (
              (
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  jobs[jobs.length - 1][0],
                  jobs[jobs.length - 1][1].nextPosition
                )
              ).requiredSkills["hacking"] >
              (await Do(ns, "ns.getPlayer"))!.skills["hacking"]
            ) {
              if (
                (
                  await Do(
                    ns,
                    "ns.singularity.getCompanyPositionInfo",
                    jobs[jobs.length - 1][0],
                    jobs[jobs.length - 1][1].nextPosition
                  )
                ).requiredSkills["hacking"] <
                200 * (await Do(ns, "ns.getPlayer"))!.mults["hacking"]
              ) {
                Do(this.ns, "ns.singularity.stopAction");
                await this.Game.collegegym.raiseHacking(
                  (
                    await Do(
                      ns,
                      "ns.singularity.getCompanyPositionInfo",
                      jobs[jobs.length - 1][0],
                      jobs[jobs.length - 1][1].nextPosition
                    )
                  ).requiredSkills["hacking"]
                );
              }
            }
            if (
              (
                await Do(
                  ns,
                  "ns.singularity.getCompanyPositionInfo",
                  jobs[jobs.length - 1][0],
                  jobs[jobs.length - 1][1].nextPosition
                )
              ).requiredSkills["charisma"] >
              (await Do(ns, "ns.getPlayer"))!.skills["charisma"]
            ) {
              if (
                (
                  await Do(
                    ns,
                    "ns.singularity.getCompanyPositionInfo",
                    jobs[jobs.length - 1][0],
                    jobs[jobs.length - 1][1].nextPosition
                  )
                ).requiredSkills["charisma"] <
                200 * (await Do(ns, "ns.getPlayer"))!.mults["charisma"]
              ) {
                Do(this.ns, "ns.singularity.stopAction");
                await this.Game.collegegym.raiseCharisma(
                  (
                    await Do(
                      ns,
                      "ns.singularity.getCompanyPositionInfo",
                      jobs[jobs.length - 1][0],
                      jobs[jobs.length - 1][1].nextPosition
                    )
                  ).requiredSkills["charisma"]
                );
              }
            }
          }
        }
        await ns.asleep(60000);
      }
      Do(this.ns, "ns.singularity.stopAction");
    }
  }
}
