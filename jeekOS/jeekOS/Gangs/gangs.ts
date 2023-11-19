import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export class Gangs {
    Game: WholeGame;
    ns: NS;
    gangToJoin: string;
    clashTarget: number;
    constructor(game: WholeGame) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.gangToJoin = this.Game.gangToJoin;
        this.clashTarget = .5;
    }
    async minimumDefense() {
        return 500 * (await Do(this.ns, "ns.gang.getMemberNames")).length;
    }
    async gangCreate() {
        if (!await Do(this.ns, "ns.gang.inGang")) {
            await (this.Game.factions.factionJoin(this.gangToJoin));
            Do(this.ns, "ns.singularity.stopAction");
            await Do(this.ns, "ns.gang.createGang", this.gangToJoin);
        }
        return await Do(this.ns, "ns.gang.inGang");
    }
    async start() {
        this.mainLoop();
    }
    async mainLoop() {
        let loopStop = Date.now();
        let taskNames = await Do(this.ns, "ns.gang.getTaskNames");
        while (true) {
            let filterMembers:string[] = (await Do(this.ns, "ns.gang.getMemberNames"));
            filterMembers = this.Game.gangMemberNames.filter((x:string) => !filterMembers.includes(x));
            while (await Do(this.ns, "ns.gang.recruitMember", filterMembers[Math.floor(Math.random() * filterMembers.length)])) {}
            if (false) {
                filterMembers = (await Do(this.ns, "ns.gang.getMemberNames"));
                filterMembers = this.Game.gangMemberNames.filter((x:string) => !filterMembers.includes(x));
                let filterMembers2:string[] = (await Do(this.ns, "ns.gang.getMemberNames")).filter((x:any) => !(this.Game.gangMemberNames.includes(x))).filter((x:any) => !filterMembers.includes(x));
                if (filterMembers2.length > 0) {
                    Do(this.ns, "ns.gang.renameMember", filterMembers2[Math.floor(filterMembers2.length * Math.random())], filterMembers[Math.floor(filterMembers.length * Math.random())]);
                }
            }
            let memberNames:string[] = (await Do(this.ns, "ns.gang.getMemberNames"));
            let memberData:{[key:string]: any} = {};
            for (let member of memberNames) {
                memberData[member] = Do(this.ns, "ns.gang.getMemberInformation", member)!;
            }
            for (let member of memberNames) {
                memberData[member] = await memberData[member];
                memberData[member]['total'] = memberData[member]['str'] + memberData[member]['def'] + memberData[member]['dex'] + memberData[member]['cha'] + memberData[member]['hack'];
                memberData[member]['total_exp'] = memberData[member]['str_exp'] + memberData[member]['def_exp'] + memberData[member]['dex_exp'] + memberData[member]['cha_exp'] + memberData[member]['hack_exp'];
            }
            this.getGear(memberData);
            let minDef = await this.minimumDefense();
            let readyToEarn:string[] = [];
            Object.keys(memberData).map((x:any) => memberData[x]['cha_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Charisma")! : memberData[x]['hack_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Hacking")! : memberData[x]['str_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")! : memberData[x]['dex_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")! : memberData[x]['def_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")! : memberData[x]['agi_exp'] < minDef ? Do(this.ns, "ns.gang.setMemberTask", x, "Train Combat")! : readyToEarn.push(x));
            let letsDoThis:any[] = [];
            let genInfo = await Do(this.ns, "ns.gang.getGangInformation");
            let tD:{[key:string]:any} = {};
            for (let task of taskNames) {
                tD[task] = await Do(this.ns, "ns.gang.getTaskStats", task);
            }
            for (let member of readyToEarn) {
                let mD = await Do(this.ns, "ns.gang.getMemberInformation", member);
                for (let task of taskNames) {
                    letsDoThis.push([member, task, this.ns.formulas.gang.respectGain(genInfo, mD, tD[task]), this.ns.formulas.gang.moneyGain(genInfo, mD, tD[task])]);
                }
            }
            try {
                letsDoThis = letsDoThis.filter((x:any) => memberData[x[0]]['total'] >= 700 || x[1] != "Terrorism");
            } catch { }
            while (letsDoThis.length > 0) {
                letsDoThis = letsDoThis.sort((a:any,b:any) => {return -a[2] + b[2];});
                let meNext:string = letsDoThis[0][0];
                Do(this.ns, "ns.gang.setMemberTask", letsDoThis[0][0], letsDoThis[0][1]);
                letsDoThis = letsDoThis.filter((x:any) => x[0] != meNext);
                if (letsDoThis.length > 0) {
                    letsDoThis = letsDoThis.sort((a:any,b:any) => {return -a[2] + b[2];});
                    meNext = letsDoThis[0][0];
                    Do(this.ns, "ns.gang.setMemberTask", letsDoThis[0][0], letsDoThis[0][1]);
                    letsDoThis = letsDoThis.filter((x:any) => x[0] != meNext);    
                    if (letsDoThis.length > 0) {
                        letsDoThis = letsDoThis.sort((a:any,b:any) => {return -a[3] + b[3];});
                        meNext = letsDoThis[0][0];
                        Do(this.ns, "ns.gang.setMemberTask", letsDoThis[0][0], letsDoThis[0][1]);
                        letsDoThis = letsDoThis.filter((x:any) => x[0] != meNext);    
                    }    
                }
            }
            await this.ns.asleep(loopStop + 20500 - 500 * memberNames.length - Date.now());

            let members = await Do(this.ns, "ns.gang.getMemberNames");
            // Clash time
            (await members).map((x:any) => Do(this.ns, "ns.gang.setMemberTask", x, "Territory Warfare"));
    
            let othergangs = await Do(this.ns, "ns.gang.getOtherGangInformation");
            let startPower = (await Do(this.ns, "ns.gang.getGangInformation"))!.power;
            if (Object.keys(othergangs).filter(x => othergangs[x].territory > 0).length > 0) {
                let chances:{[key:string]:number} = {}
                for (let other of Object.keys(othergangs)) {
                    if (othergangs[other].territory > 0) {
                        chances[other] = await Do(this.ns, "ns.gang.getChanceToWinClash", other);
                    }
                }
                let total = Object.keys(othergangs).map(x => chances[x] * othergangs[x].territory).reduce((a, b) => a + b);
                if ((total / (1 - (await Do(this.ns, "ns.gang.getGangInformation")).territory) >= this.clashTarget) || (Object.keys(chances).every(x => chances[x] >= this.clashTarget)))
                    Do(this.ns, "ns.gang.setTerritoryWarfare", true);
    
            }

            while (((await Do(this.ns, "ns.gang.getGangInformation")).power) == startPower) {
                await this.ns.asleep(0);
            }
            this.ascendMembers();
            loopStop = Date.now();
            Do(this.ns, "ns.gang.setTerritoryWarfare", false);
        }
    }
    async getGear(memberData:{[key:string]:any}) {
        let members:string[] = Object.keys(memberData);
        // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
        members.sort((a:any, b:any) => { return memberData[a].str_mult - memberData[b].str_mult; });
        let funds = Math.min((await Do(this.ns, "ns.getMoneySources")).sinceInstall.gang, (await Do(this.ns, "ns.getPlayer"))!.funds);
        
        if (members.length < 12 || (await Do(this.ns, "ns.fileExists", "SQLInject.exe"))) {
            let equip:string[] = await Do(this.ns, "ns.gang.getEquipmentNames");
            let equipCost:{[key:string]:number} = {};
            for (let x of Object.keys(equip)) {
                equipCost[x] = await Do(this.ns, "ns.gang.getEquipmentCost", x);
            }
            equip.sort((a:any, b:any) => equipCost[b] - equipCost[a]);
            for (let j = 0; j < equip.length; j++) {
                for (let i of members) {
                    let total = Math.min(memberData[i].str, memberData[i].dex, memberData[i].def, memberData[i].cha, memberData[i]['hack']);
                    // Buy the good stuff only once the terrorism stats are over 700.
                    if (total >= 140) {
                        if ((await (equipCost[equip[j]])) < funds) {
                            if (await Do(this.ns, "ns.gang.purchaseEquipment", i, equip[j])) {
                                this.ns.toast(i + " now owns " + equip[j]);
                                funds -= equipCost[equip[j]];
                                memberData[i] = await Do(this.ns, "ns.gang.getMemberInformation", i);
                            }
                        }
                    } else {
                        if (await Do(this.ns, "ns.gang.purchaseEquipment",i, "Glock 18C")) {
                            this.ns.toast(i + " now owns Glock 18C");
                        }
                    }
                }
            }
        }
    }
    async ascendMembers() {
        let members:string[] = await Do(this.ns, "ns.gang.getMemberNames");
        let memberData:{[key:string]:any} = {};
        for (let member of members) {
            memberData[member] = await Do(this.ns, "ns.gang.getMemberInformation", member);
        }
        if (members.length < 12) {
            return;
        }
        let gangInfo = await Do(this.ns, "ns.gang.getGangInformation");
        let avgrespect = members.map((x:any) => memberData[x].earnedRespect).reduce((a:any, b:any) => a + b, 0) / members.length;
        if (avgrespect >= 0) {
            let ascendable = [...members];
            ascendable = ascendable.filter(x => (["hack_exp", "str_exp", "def_exp", "dex_exp", "agi_exp", "cha_exp"].map(y => memberData[x][y] > 1000).reduce((a, b) => a || b)));
            let ascResult:{[key:string]:any} = {};
            for (let member of ascendable) {
                ascResult[member] = await (Do(this.ns, "ns.gang.getAscensionResult", member));
            }
            let check:{[key:string]:number} = {};
            if (gangInfo.territory > .98) {
                ascendable.forEach(x => check[x] = 1.66-.62/Math.exp(((2/memberData[x].cha_asc_mult)**2.24)));
                ascendable = ascendable.filter(x => check[x] < ascResult[x]['cha']);
            } else {
                ascendable.forEach(x => check[x] = 1.66-.62/Math.exp(((2/memberData[x].str_asc_mult)**2.24)));
                ascendable = ascendable.filter(x => check[x] < ascResult[x]['str']);
            }
            ascendable = ascendable.filter(x => memberData[x].earnedRespect < avgrespect);
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