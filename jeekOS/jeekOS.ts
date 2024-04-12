import { NS, Player, Server, ResetInfo } from "@ns";
import { WholeGame } from "jeekOS/WholeGame";
import { getTruePlayer } from "jeekOS/TruePlayer";
import { Do } from "jeekOS/Do";
import { Maps } from "jeekOS/Maps";
import { CorpMats } from "jeekOS/CorpMats";
import { AugChart } from "jeekOS/AugChart";

let gangMemberNames: string[] = [
  [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Saggitarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ],
  [
    "Rat",
    "Ox",
    "Tiger",
    "Dragon",
    "Rabbit",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig",
  ],
  [
    "Lion",
    "Hydra",
    "Hind",
    "Boar",
    "Stables",
    "Birds",
    "Bull",
    "Horses",
    "Belt",
    "Cattle",
    "Apples",
    "Cerebrus",
  ],
  [
    "Oral",
    "Anal",
    "Vaginal",
    "Fourthhole",
    "Donkeypunch",
    "Armpit",
    "Ear",
    "Eyesocket",
    "Boobs",
    "Handy",
    "Footy",
    "Nostril",
  ], // additional names provided by infundimueslicybe (mushroom.botherer on Discord)
  [
    "Peter",
    "Andrew",
    "James",
    "John",
    "Philip",
    "Bartholomew",
    "Thomas",
    "Matthew",
    "The Publican",
    "Thaddaeus",
    "Simon",
    "Judas Iscariot",
  ],
][Math.floor(Math.random() * 5)];
let FACTIONS: string[] = [
  "Illuminati",
  "Daedalus",
  "The Covenant",
  "ECorp",
  "MegaCorp",
  "Bachman & Associates",
  "Blade Industries",
  "NWO",
  "Clarke Incorporated",
  "OmniTek Incorporated",
  "Four Sigma",
  "KuaiGong International",
  "Fulcrum Secret Technologies",
  "BitRunners",
  "The Black Hand",
  "NiteSec",
  "Aevum",
  "Chongqing",
  "Ishima",
  "New Tokyo",
  "Sector-12",
  "Volhaven",
  "Speakers for the Dead",
  "The Dark Army",
  "The Syndicate",
  "Silhouette",
  "Tetrads",
  "Slum Snakes",
  "Netburners",
  "Tian Di Hui",
  "CyberSec",
  "Bladeburners",
  "Church of the Machine God",
  "Shadows of Anarchy",
];
let FACTIONS2: any = {
  EARLY: [
    "CyberSec",
    "Tian Di Hui",
    "NiteSec",
    "The Black Hand",
    "BitRunners",
    "Netburners",
  ],
  CITY: ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"],
  CRIME: [
    "Slum Snakes",
    "Tetrads",
    "Speakers for the Dead",
    "The Syndicate",
    "Silhouette",
    "The Dark Army",
  ],
  COMPANIES: [
    "ECorp",
    "MegaCorp",
    "KuaiGong International",
    "Four Sigma",
    "NWO",
    "Blade Industries",
    "OmniTek Incorporated",
    "Bachman & Associates",
    "Clarke Incorporated",
    "Fulcrum Secret Technologies",
  ],
  ENDGAME: ["Daedalus", "Illuminati", "The Covenant"],
  SPECIAL: ["Bladeburners", "Church of the Machine God", "Shadows of Anarchy"],
};

/*
export async function batcher(Game: WholeGame): Promise<void> {
    let ns = Game.ns;
    let gap = .005 * 1000;
    let servers:string[] = ["home"];
    for (let i = 0 ; i < servers.length ; i++) {
        servers = servers.concat(await Do(ns, "ns.scan", servers[i])).filter(x => !servers.includes(x));
    }
    ns.write("/temp/bhack.js", 'export async function main(ns) {await ns.hack(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bgrow.js", 'export async function main(ns) {await ns.grow(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bweaken.js", 'export async function main(ns) {await ns.weaken(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bshare.js", 'export async function main(ns) {await ns.share()}', 'w');
    for (let server of servers) {
        if (server != 'home') {
            await Do(ns, "ns.scp", ['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], server);
        }
    }

    let allservers = [...servers];
    let i = 0;
    while (i < servers.length) {
        if ((await Do(ns, "ns.getPurchasedServers")).includes(servers[i])) {
            servers.splice(i);
        } else {
            i += 1;
        }
    }
    i = 0;
    while (i < servers.length) {
        if ((await Do(ns, "ns.getServerMaxMoney", servers[i])) <= 0) {
            servers.splice(i);
        } else {
            i += 1;
        }
    }
    let percentage = 90;
    let initialized = false;
    let oldtarget = "";
    while (!await Do(ns, "ns.hasRootAccess", "n00dles")) {
        await ns.asleep(1000);
    }
    while (true) {
        let hackable = [...servers];
        i = 0;
        while (i < hackable.length) {
            if ((await Do(ns, "ns.getServerRequiredHackingLevel", hackable[i])) * 2 < (await Do(ns, "ns.getPlayer"))['skills']['hacking']) {
                hackable.splice(i);
            } else {
                i += 1;
            }
        }
        i = 0;
        while (i < hackable.length) {
            if (!(await Do(ns, "ns.hasRootAccess", hackable[i]))) {
                hackable.splice(i);
            } else {
                i += 1;
            }
        }
        let sortArray:any[] = [];
        i = 0;
        while (i < hackable.length) {
            sortArray.push([(await Do(ns, "ns.getServerGrowth", hackable[i])) * (await Do(ns, "ns.getServerMaxMoney", hackable[i])) / (await Do(ns, "ns.getHackTime", hackable[i])) ** 2, hackable[i]]);
            i += 1;
        }
        hackable = hackable.sort((a:any, b:any) => {return a[0] - b[0]});
        let target = hackable[hackable.length - 1];
        target ??= "n00dles";
        if (oldtarget != target) {
            initialized = false;
            ns.tprint("! ",target);
            oldtarget = target;
            for (let i = 0 ; i < servers.length ; i++) {
                servers = servers.concat(ns.scan(servers[i]).filter(x => !servers.includes(x)))
            }
            for (let server of servers) {
                if (server != 'home') {
                    ns.scp(['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], server);
                }
            }
        
            allservers = [...servers];
            servers = servers.filter(x => !ns.getPurchasedServers().includes(x)).filter(x => ns.getServerMaxMoney(x) > 0);
        }
        if (ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target) && ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
            initialized = true;
        }

        let hackThreads = Math.max(1, Math.floor((percentage/100) / ns.hackAnalyze(target)));
        let w1Threads = Math.max(1, Math.ceil(.002 * hackThreads / .05));
        let growThreads = Math.max(1, Math.ceil(1.5*ns.growthAnalyze(target, 1.0 / (1 - percentage / 100.0))));
        let securityIncrease = ns.growthAnalyzeSecurity(growThreads);
        let w2Threads = Math.max(1, Math.ceil(securityIncrease / .05));
        w1Threads = 2 * Math.max(w1Threads, w2Threads);
        w2Threads = Math.max(w1Threads, w2Threads);
        let times = [ns.getHackTime(target), ns.getHackTime(target) * 4, ns.getHackTime(target) * 5];
        let start = Date.now();
        let runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
            await ns.asleep(0);
        }
        while (0 == (ns.exec('/temp/bweaken.js', runServer, w1Threads, target as string, 0) as Number)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
//        ns.tprint(runServer + " =W1> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        let grew = false;
        if (ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target)) {
            grew = true;
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            while (0 == ns.exec('/temp/bgrow.js', runServer, growThreads, target as string, times[0])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
            await ns.asleep(0);
        }
        while (0 == ns.exec('/temp/bweaken.js', runServer, w2Threads, target as string, 0)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        }
//        ns.tprint(runServer + " =W2> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        if (grew && ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target) && ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            while (0 == ns.exec('/temp/bhack.js', runServer, hackThreads, target as string, times[1])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && initialized) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
            }
//            ns.tprint(runServer + " =H> " + target);
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - ns.getServerUsedRam(a) - ns.getServerMaxRam(b) + ns.getServerUsedRam(b)}).pop() as string;
        ns.exec('/temp/bshare.js', runServer, Math.max(growThreads, w1Threads, w2Threads, hackThreads), target as string, times[1]);
        start = Date.now();
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
    }
}
*/


export async function main(ns: NS): Promise<void> {
  const args = ns.flags([
    ["augs", false],
    ["map", false],
    ["cityaugs", false],
    ["corpaugs", false],
    ["endgameaugs", false],
    ["gangaugs", false],
    ["hackaugs", false],
    ["chaaugs", false],
    ["gangToJoin", "Slum Snakes"],
    ["gangMemberNames", gangMemberNames],
    ["grep", ""],
    ["do", ""],
    ["ps", false],
    ["ramOverride", 2.6],
    ["corpmats", false],
    ["devmenu", false],
  ]);
  if (args["do"] != "") {
    let doArgs: any = JSON.parse(args["do"] as string);
    let output: any =
      (await doArgs[0].split(".").reduce((a: any, b: any) => a[b], ns)(
        ...JSON.parse(doArgs[1])
      )) ?? "UnDeFiNeDaF";
    ns.atExit(() => ns.writePort(ns.pid, output));
    return;
  }
  if (args["devmenu"] != false) {
    getTruePlayer().toPage?.('Dev');
    return;
  }
  if (args["ps"] != false) {
    let React = eval("window").React;
    let servers = ["home"];
    let i = 0;
    let j = 0;
    let rows: any = [];
    while (i < servers.length) {
      for (let server of await Do(ns, "ns.scan", servers[i])) {
        if (!servers.includes(server)) {
          servers.push(server);
        }
      }
      for (let proc of await Do(ns, "ns.ps", servers[i])) {
        rows.push(
          React.createElement(
            "TR",
            [],
            [
              React.createElement("TD", [], servers[i]),
              React.createElement("TD", [], proc.filename),
              React.createElement("TD", [], proc.pid.toString()),
              React.createElement("TD", [], proc.threads.toString()),
              React.createElement("TD", [], proc.args.toString()),
            ]
          )
        );
        j += 1;
      }
      i += 1;
    }
    if (j > 0) {
      ns.tprintRaw(React.createElement("TABLE", { border: 1 }, rows));
    }
    return;
  }
  if (args["grep"] != "") {
    for (let file of await Do(ns, "ns.ls", "home")) {
      let z = 0;
      for (let line of ns.read(file).split("\n")) {
        z += 1;
        if (line.includes(args["grep"] as string)) {
          ns.tprintRaw(file + ":" + z.toString() + ":" + line);
        }
      }
    }
    return;
  }
  let didSomething = false;
  if (args["map"]) {
    didSomething = true;
    await Maps(ns);
  }
  if (args["corpmats"]) {
    didSomething = true;
    await CorpMats(ns);
  }
  if (args["augs"]) {
    didSomething = true;
    await new AugChart(ns).display();
  }
  if (args["cityaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Sector-12",
      "Aevum",
      "Volhaven",
      "Chongqing",
      "New Tokyo",
      "Ishima",
    ]).display();
  }
  if (args["corpaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Four Sigma",
      "Bachman & Associates",
      "Clarke Incorporated",
      "Blade Industries",
      "KuaiGong International",
      "OmniTek Incorporated",
      "ECorp",
      "MegaCorp",
      "NWO",
      "Fulcrum Secret Technologies",
    ]).display();
  }
  if (args["endgameaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Daedalus",
      "Illuminati",
      "The Covenant",
    ]).display();
  }
  if (args["gangaugs"]) {
    didSomething = true;
    await new AugChart(ns, [
      "Slum Snakes",
      "Tetrads",
      "Silhouette",
      "Speakers for the Dead",
      "The Dark Army",
      "The Syndicate",
    ]).display();
  }
  if (args["hackaugs"]) {
    didSomething = true;
    await new AugChart(
      ns,
      [
        "CyberSec",
        "NiteSec",
        "Tian Di Hui",
        "The Black Hand",
        "BitRunners",
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        "Daedalus",
        "Illuminati",
        "The Covenant",
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
      ],
      [
        "hacking_chance",
        "hacking_speed",
        "hacking",
        "hacking_grow",
        "hacking_money",
        "hacking_exp",
      ]
    ).display();
  }
  if (args["chaaugs"]) {
    didSomething = true;
    await new AugChart(
      ns,
      [
        "CyberSec",
        "NiteSec",
        "Tian Di Hui",
        "The Black Hand",
        "BitRunners",
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        "Daedalus",
        "Illuminati",
        "The Covenant",
        "Sector-12",
        "Aevum",
        "Volhaven",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
      ],
      ["charisma", "charisma_exp", "company_rep", "faction_rep"]
    ).display();
  }
  if (!didSomething) {
    let Game = new WholeGame(
      ns,
      args["gangToJoin"] as string,
      args["gangMemberNames"] as string[]
    );
    while (Game.running == false) {
      await ns.asleep(1000);
    }
    await Game.jobs.allJobs();
    let z = 0;
    while (Game.running == true) {
      await ns.asleep(z);
      z += 1;
    }
  }
}
