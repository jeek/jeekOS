let COMPANIES = [
    "ECorp",
    "MegaCorp",
    "KuaiGong International",
    "Four Sigma",
    "NWO",
    "Blade Industries",
    "OmniTek Incorporated",
    "Bachman & Associates",
    "Clarke Incorporated",
    "Fulcrum Technologies"]
  
  /** @param {NS} ns */
  export async function main(ns) {
    for (let company of ns.enums.CompanyName) {
        for (let position of ns.singularity.getCompanyPositions(ns.enums.CompanyName[company])) {
            ns.tprint(company, " ", position);
        }
    }
    let starting = true;
    let jobs = [];
    while (starting || jobs.length > 0) {
      jobs = [];
      starting = false;
      while (ns.singularity.checkFactionInvitations().length > 0) {
        ns.singularity.joinFaction(ns.singularity.checkFactionInvitations()[0]);
      }
      for (let company of COMPANIES) {
        let faction = company;
        if (company == "Fulcrum Technologies") {
          faction = "Fulcrum Secret Technologies";
        }
        if (ns.singularity.getCompanyRep(company) < 400000 && !ns.getPlayer().factions.includes(faction)) {
          for (let position of ns.singularity.getCompanyPositions(company)) {
            jobs = jobs.concat([[company, ns.singularity.getCompanyPositionInfo(company, position)]]);
            if (jobs[jobs.length - 1][1]["requiredReputation"] > ns.singularity.getCompanyRep(company)) {
              jobs.pop();
            }
            for (let skill of ["hacking", "intelligence", "strength", "dexterity", "defense", "agility", "charisma"]) {
              if (jobs.length > 0 && (ns.getPlayer().skills[skill] < jobs[jobs.length - 1][1].requiredSkills[skill])) {
                jobs.pop();
              }
            }
          }
        }
      }
      jobs = jobs.sort((a, b) => { return a[1].requiredReputation * a[1].salary - b[1].requiredReputation * b[1].salary });
      if (ns.ls("home").includes("Formulas.exe")) {
        jobs = jobs.sort((a, b) => { return ns.formulas.work.companyGains(ns.getPlayer(), a[0], a[1]["name"], ns.singularity.getCompanyFavor(a[0])).reputation - ns.formulas.work.companyGains(ns.getPlayer(), b[0], b[1]["name"], ns.singularity.getCompanyFavor(b[0])).reputation })
      }
      if (jobs.length > 0) {
        ns.tprint(jobs[jobs.length - 1]);
        ns.singularity.applyToCompany(jobs[jobs.length - 1][0], jobs[jobs.length - 1][1].field);
        ns.singularity.workForCompany(jobs[jobs.length - 1][0], false);
        await ns.asleep(60000);
      }
    }
  }