import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export class Jobs {
    Game: WholeGame;
    ns: NS;

    constructor(Game: WholeGame) {
        this.Game = Game;
        this.ns = Game.ns;
    }
    async allJobs() {

    }
    async unlockFaction(company: string) {
        let ns: NS = this.ns;
        let jobs: any[] = [];
        if ((await Do(this.ns, "ns.getPlayer"))!.city == "Sector-12") {
          //await (this.Game.collegegym.raiseStrength(100 * (await Do(ns, "ns.getPlayer"))!.mults['strength']));
          //await (this.Game.collegegym.raiseDefense(100 * (await Do(ns, "ns.getPlayer"))!.mults['defense']));
          //await (this.Game.collegegym.raiseDexterity(100 * (await Do(ns, "ns.getPlayer"))!.mults['dexterity']));
          //await (this.Game.collegegym.raiseAgility(100 * (await Do(ns, "ns.getPlayer"))!.mults['agility']));
          await (this.Game.collegegym.raiseHacking(250));
          await (this.Game.collegegym.raiseHacking(100 * (await Do(ns, "ns.getPlayer"))!.mults['hacking']));
          await (this.Game.collegegym.raiseCharisma(100 * (await Do(ns, "ns.getPlayer"))!.mults['charisma']));
        } else {
          await (this.Game.collegegym.raiseHacking(250));
          await (this.Game.collegegym.raiseHacking(100 * (await Do(ns, "ns.getPlayer"))!.mults['hacking']));
          await (this.Game.collegegym.raiseCharisma(100 * (await Do(ns, "ns.getPlayer"))!.mults['charisma']));
          //await (this.Game.collegegym.raiseStrength(100 * (await Do(ns, "ns.getPlayer"))!.mults['strength']));
          //await (this.Game.collegegym.raiseDefense(100 * (await Do(ns, "ns.getPlayer"))!.mults['defense']));
          //await (this.Game.collegegym.raiseDexterity(100 * (await Do(ns, "ns.getPlayer"))!.mults['dexterity']));
          //await (this.Game.collegegym.raiseAgility(100 * (await Do(ns, "ns.getPlayer"))!.mults['agility']));
        }
        if (!(await Do(ns, "ns.getPlayer")).factions.includes(company == "Fulcrum Secret Techologies" ? "Fulcrum Technologies" : company)) {
        while (!(await Do(ns, "ns.getPlayer")).factions.includes(company == "Fulcrum Secret Techologies" ? "Fulcrum Technologies" : company)) {
          jobs = [];
//          while ((await Do(ns, "ns.singularity.checkFactionInvitations")).length > 0) {
//            (await Do(ns, "ns.singularity.joinFaction", (await Do(ns, "ns.singularity.checkFactionInvitations"))[0])!);
//          }
          let faction = company;
          if (company == "Fulcrum Technologies") {
            faction = "Fulcrum Secret Technologies";
          }
          if (faction == "Fulcrum Secret Technologies") {
            company = "Fulcrum Technologies";
          }
          if ((await Do(ns, "ns.singularity.getCompanyRep", company)) < 400000 && !((await Do(ns, "ns.getPlayer")).factions.includes(faction))) {
                for (let position of await Do(ns, "ns.singularity.getCompanyPositions", company)) {
                  jobs = jobs.concat([[company, await Do(ns, "ns.singularity.getCompanyPositionInfo", company, position)]]);
                  if (jobs[jobs.length - 1][1]["requiredReputation"] > await Do(ns, "ns.singularity.getCompanyRep", company)) {
                    jobs.pop();
                  }
                  for (let skill of ["hacking", "intelligence", "strength", "dexterity", "defense", "agility", "charisma"]) {
                    if (jobs.length > 0 && (((await Do(ns, "ns.getPlayer"))!.skills[skill] < jobs[jobs.length - 1][1].requiredSkills[skill]))) {
                      jobs.pop();
                    }
                  }
              }
            }
            jobs = jobs.sort((a, b) => { return a[1].requiredReputation * a[1].salary - b[1].requiredReputation * b[1].salary });
// TODO: Rewrite to sort but use Do
//            if ((await Do(ns, "ns.ls", "home")).includes("Formulas.exe")) {
//              jobs = jobs.sort((a, b) => { return ns.formulas.work.companyGains(ns.getPlayer(), a[0], a[1]["name"], ns.singularity.getCompanyFavor(a[0])).reputation - ns.formulas.work.companyGains(ns.getPlayer(), b[0], b[1]["name"], ns.singularity.getCompanyFavor(b[0])).reputation })
//            }
            if (jobs.length > 0) {
              await Do(ns, "ns.singularity.applyToCompany", jobs[jobs.length - 1][0], jobs[jobs.length - 1][1].field);
              await Do(ns, "ns.singularity.workForCompany", jobs[jobs.length - 1][0], (!((await Do(this.ns, "ns.singularity.getOwnedAugmentations", false))!.includes("Neuroreceptor Management Implant"))));
            }
            await ns.asleep(60000);
            if (jobs.length > 0) {
               if (jobs[jobs.length-1][1].nextPosition === null) {
               } else {
                 if ((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['hacking'] > (await Do(ns, "ns.getPlayer"))!.skills['hacking']) {
                  if ((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['hacking'] < 200 * (await Do(ns, "ns.getPlayer"))!.mults['hacking']) {
                    Do(this.ns, "ns.singularity.stopAction");
                    await (this.Game.collegegym.raiseHacking((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['hacking']));
                  }
                 }
                 if ((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['charisma'] > (await Do(ns, "ns.getPlayer"))!.skills['charisma']) {
                  if ((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['charisma'] < 200 * (await Do(ns, "ns.getPlayer"))!.mults['charisma']) {
                    Do(this.ns, "ns.singularity.stopAction");
                    await (this.Game.collegegym.raiseCharisma((await Do(ns, "ns.singularity.getCompanyPositionInfo", jobs[jobs.length-1][0], jobs[jobs.length-1][1].nextPosition)).requiredSkills['charisma']));
                  }
                 }
               }
            }
        }
        Do(this.ns, "ns.singularity.stopAction");
      }
    }
}
