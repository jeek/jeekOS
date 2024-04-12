import { NS } from "@ns";

export async function main(ns: NS) {
    let getServerUsedRam = (x:any) => (x == "home") ? (ns.getServerUsedRam(x) + 20) : ns.getServerUsedRam(x);
    let gap = 4;
    let servers:string[] = ["home"];
    for (let i = 0 ; i < servers.length ; i++) {
        servers = servers.concat(ns.scan(servers[i]).filter(x => !servers.includes(x)))
    }
    ns.write("/temp/bhack.js", 'export async function main(ns) {await ns.hack(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bgrow.js", 'export async function main(ns) {await ns.grow(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bweaken.js", 'export async function main(ns) {await ns.weaken(ns.args[0], {"additionalMsec": ns.args[1]})}', 'w');
    ns.write("/temp/bshare.js", 'export async function main(ns) {await ns.share()}', 'w');
    for (let server of servers) {
        if (server != 'home') {
            ns.scp(['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], server);
        }
    }

    let allservers = [...servers];
    servers = servers.filter(x => !ns.getPurchasedServers().includes(x)).filter(x => ns.getServerMaxMoney(x) > 0);
    let percentage = 1;
    let initialized = false;
    let oldtarget = "";
    while (!ns.hasRootAccess("n00dles")) {
        ns.asleep(1000);
    }
    while (true) {
        let hackable = [...servers].filter(x => ns.hasRootAccess(x)).filter(x => ns.getServerRequiredHackingLevel(x) * 2 < ns.getPlayer()['skills']['hacking']).sort((a:any, b:any) => {return ns.getServerGrowth(a) * ns.getServerMaxMoney(a) / ns.getHackTime(a) ** .5 - ns.getServerGrowth(b) * ns.getServerMaxMoney(b) / ns.getHackTime(b) ** .5 });
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
        
            servers = servers.filter(x => !ns.getPurchasedServers().includes(x)).filter(x => ns.getServerMaxMoney(x) > 0);
        }
        allservers = [...new Set([...servers].concat(ns.getPurchasedServers()).concat('home'))];
        allservers.map((x:any) => ns.scp(['/temp/bhack.js', '/temp/bgrow.js', '/temp/bweaken.js', '/temp/bshare.js'], x));
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
        let runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
            await ns.asleep(0);
        }
        while (0 == (ns.exec('/temp/bweaken.js', runServer, w1Threads, target as string, 0) as Number)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
            }
//        ns.tprint(runServer + " =W1> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        let grew = false;
        if (ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target)) {
            grew = true;
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                await ns.asleep(0);
            }
            while (0 == ns.exec('/temp/bgrow.js', runServer, growThreads, target as string, times[0])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
            }
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
        while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
            await ns.asleep(0);
        }
        while (0 == ns.exec('/temp/bweaken.js', runServer, w2Threads, target as string, 0)) {
            await ns.asleep(0);
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
        }
//        ns.tprint(runServer + " =W2> " + target + " | " + ns.getServerMinSecurityLevel(target).toString() + " " + ns.getServerSecurityLevel(target).toString());
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        start = Date.now();
        if (grew && ns.getServerMinSecurityLevel(target) == ns.getServerSecurityLevel(target) && ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target)) {
            while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                await ns.asleep(0);
            }
            runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
            while (0 == ns.exec('/temp/bhack.js', runServer, hackThreads, target as string, times[1])) {
                await ns.asleep(0);
                while ((ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) && (initialized || Date.now() - 10000 > start)) {
                    await ns.asleep(0);
                }
                runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
            }
//            ns.tprint(runServer + " =H> " + target);
        }
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
        runServer = allservers.filter(x => ns.hasRootAccess(x)).sort((a:any, b:any) => {return ns.getServerMaxRam(a) - getServerUsedRam(a) - ns.getServerMaxRam(b) + getServerUsedRam(b)}).pop() as string;
        ns.exec('/temp/bshare.js', runServer, Math.max(growThreads, w1Threads, w2Threads, hackThreads), target as string, times[1]);
        start = Date.now();
        while (Date.now() - gap < start) {
            await ns.asleep(0);
        }
    }
}