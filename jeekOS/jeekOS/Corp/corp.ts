import { NS } from "@ns";
import { Do } from "jeekOS/Do/do";
import { WholeGame } from "jeekOS/WholeGame/WholeGame";

export class Corp {
    Game: WholeGame;
    ns: NS;
    name: string;
    ready:{[key:string]: boolean};

    constructor(game: WholeGame) {
        this.Game = game;
        this.ns = this.Game.ns;
        this.name = "JeekCo";
        this.ready = {};
        this.start()
    }
    async start() {
        while (!(await Do(this.ns, "ns.corporation.hasCorporation"))) {
            if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 3) {
                await Do(this.ns, "ns.corporation.createCorporation", this.name, false);
            } else {
                if (!await Do(this.ns, "ns.corporation.createCorporation", this.name)) {
                    await this.ns.asleep(60000);
                }
            }
        }
        let corpData:any = await Do(this.ns, "ns.corporation.getCorporation");
        if (corpData.divisions.length == 0) {
            await Do(this.ns, "ns.corporation.expandIndustry", "Agriculture", "Farmy");
        }
        corpData = await Do(this.ns, "ns.corporation.getCorporation");
        for (let div of corpData.divisions) {
            let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
            if (divData.type == "Agriculture") {
                this.agDiv(div);
            }
        }
        while ((await Do(this. ns, "ns.corporation.getInvestmentOffer")).round==1 && (await Do(this. ns, "ns.corporation.getInvestmentOffer")).funds < 300000000000) {
            await this.ns.asleep(10000);
            this.ns.tprint(await Do(this.ns, "ns.corporation.getInvestmentOffer"));
        }
        if ((await Do(this. ns, "ns.corporation.getInvestmentOffer")).round==1) {
            await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
        }
        let gotOne = false;
        for (let div of corpData.divisions) {
            let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
            if (divData.type == "Chemical") {
                this.chemDiv(div);
                gotOne = true;
            }
        }
        if (!gotOne) {
            await Do(this.ns, "ns.corporation.expandIndustry", "Chemical", "Chemy");
//        await Do(this.ns, "ns.corporation.expandIndustry", "Spring Water", "Wet Ones");
            this.chemDiv("Chemy");
//        this.agDiv("Wet Ones");
        }

//        await Do(this.ns, "ns.corporation.expandIndustry", "Refinery", "Shiny");
        corpData = await Do(this.ns, "ns.corporation.getCorporation");
        for (let div of corpData.divisions) {
            let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
            if (divData.type == "Refinery") {
                this.agDiv(div);
            }
        }
        
  //      await Do(this.ns, "ns.corporation.expandIndustry", "Computer Hardware", "Proccy");
        corpData = await Do(this.ns, "ns.corporation.getCorporation");
        for (let div of corpData.divisions) {
            let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
            if (divData.type == "Computer Hardware") {
                this.agDiv(div);
            }
        }

        //await Do(this.ns, "ns.corporation.expandIndustry", "Mining", "Diggy");
        corpData = await Do(this.ns, "ns.corporation.getCorporation");
        for (let div of corpData.divisions) {
            let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
            if (divData.type == "Mining") {
                this.agDiv(div);
            }
        }

        await this.ns.asleep(60000);

        
        this.exporty();
        while (true) {
            this.ns.tprint(await Do(this. ns, "ns.corporation.getInvestmentOffer"));
            await this.ns.asleep(10000);
        }
    }
    async expandAllCities(div:string) {
        let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            while (!divData.cities.includes(city)) {
                await Do(this.ns, "ns.corporation.expandCity", div, city);
                divData = await Do(this.ns, "ns.corporation.getDivision", div);
                await this.ns.asleep(0);
            }
            while (!(await Do(this.ns, "ns.corporation.hasWarehouse", div, city))) {
                await Do(this.ns, "ns.corporation.purchaseWarehouse", div, city);
                await this.ns.asleep(0);
            }
        }
    }
    async getHappy(div:string) {
        let happy = false;
        while (!happy) {
            happy = true;
            for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                if ((await Do(this.ns, "ns.corporation.getOffice", div, city)).avgEnergy < 99) {
                    happy = false;
                    Do(this.ns, "ns.corporation.buyTea", div, city);
                }
                if ((await Do(this.ns, "ns.corporation.getOffice", div, city)).avgMorale < 99) {
                    happy = false;
                    Do(this.ns, "ns.corporation.throwParty", div, city, 500000);
                }
            }
            await this.ns.asleep(10000);
        }
    }
    async agDiv(div:string) {
        while (!(await Do(this.ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
            await Do(this.ns, "ns.corporation.purchaseUnlock", "Smart Supply");
            await this.ns.asleep(0);
        }
        await this.expandAllCities(div);
        let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            this.warehouseLevel(div, city, 5);
            while ((await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees < 3) {
                await Do(this.ns, "ns.corporation.hireEmployee", div, city, "Research & Development");
                await this.ns.asleep(0);
            }
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", (await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees);
            divData = await Do(this.ns, "ns.corporation.getDivision", div);
            for (let mat of (await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div)).type)).producedMaterials) {
                Do(this.ns, "ns.corporation.sellMaterial", div, city, mat, "MAX", "MP");
            }
        }
        while ((await Do(this.ns, "ns.corporation.getDivision", div)).numAdVerts < 2) {
            await Do(this.ns, "ns.corporation.hireAdVert", div);
            await this.ns.asleep(0);
        }
        await this.upgradeIt("Smart Storage", 3);
        await this.getHappy(div);
        while ((await Do(this.ns, "ns.corporation.getDivision", div)).researchPoints < 30) {
            await this.ns.asleep(0);
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", (await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees - 2);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 1);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 1);
        }
        if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 1) {
            for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                this.ns.tprint(await Do(this.ns, "ns.corporation.getOffice", div, city));
                await Do(this.ns, "ns.corporation.setSmartSupply", div, city, true);
                this.WarehouseSet(div, city, "AI Cores", 1109);
                this.WarehouseSet(div, city, "Hardware", 1288);
                this.WarehouseSet(div, city, "Real Estate", 76752);
            }
        }
        while ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round < 2) {
            await this.ns.asleep(1000);
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", (await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees);
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            while ((await Do(this.ns, "ns.corporation.getOffice", div, city)).size < 6) {
                await Do(this.ns, "ns.corporation.upgradeOfficeSize", div, city, 1);
                await this.ns.asleep(0);
            }
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            while ((await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees < 6) {
                await Do(this.ns, "ns.corporation.hireEmployee", div, city, "Research & Development");
                await this.ns.asleep(0);
            }
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            this.warehouseLevel(div, city, 15);
        }
        this.upgradeIt("Smart Storage", 25);
        this.upgradeIt("Smart Factories", 16);
        await this.getHappy(div);
        while ((await Do(this.ns, "ns.corporation.getDivision", div)).researchPoints < 600) {
            await this.ns.asleep(10000);
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 2);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 1);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 2);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 1);
        }
        while ((await Do(this.ns, "ns.corporation.getDivision", div)).numAdVerts < 8) {
            await Do(this.ns, "ns.corporation.hireAdVert", div);
            await this.ns.asleep(0);
        }
        if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 1) {
            for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                this.ns.tprint(await Do(this.ns, "ns.corporation.getOffice", div, city));
                await Do(this.ns, "ns.corporation.setSmartSupply", div, city, true);
                this.WarehouseSet(div, city, "AI Cores", 8446);
                this.WarehouseSet(div, city, "Hardware", 9440);
                this.WarehouseSet(div, city, "Real Estate", 428895);
                this.WarehouseSet(div, city, "Robots", 1289);
            }
        }
    }
    async upgradeIt(upgrade: string, level: number) {
        let z = 0;
        while ((await Do(this.ns, "ns.corporation.getUpgradeLevel", upgrade)) < level) {
            if ((await Do(this.ns, "ns.corporation.getUpgradeLevelCost", upgrade)) < (await Do(this.ns, "ns.corporation.getCorporation")).funds) {
                await Do(this.ns, "ns.corporation.levelUpgrade", upgrade);
            } else {
                await this.ns.asleep(z);
                z += 1;    
            }
        }
    }
    async warehouseLevel(div:string, city:string, amount:number) {
        let z = 0;
        while ((await Do(this.ns, "ns.corporation.getWarehouse", div, city)).level < amount) {
            await Do(this.ns, "ns.corporation.upgradeWarehouse", div, city, 1);
            await this.ns.asleep(z);
            z += 1;
        }
    }
    async exporty() {
        while (!(await Do(this.ns, "ns.corporation.hasUnlock", "Export"))) {
            await this.ns.asleep(10000);
            Do(this.ns, "ns.corporation.purchaseUnlock", "Export");
        }
        for (let div of (await Do(this.ns, "ns.corporation.getCorporation")).divisions) {
            for (let mat of Object.keys((await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div)).type)).requiredMaterials)) {
                for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                    for (let exports of (await Do(this.ns, "ns.corporation.getMaterial", div, city, mat)).exports) {
                        this.ns.tprint(div, city, exports.division, exports.city, mat, exports.amount);
                        await Do(this.ns, "ns.corporation.cancelExportMaterial", div, city, exports.division, exports.city, mat, exports.amount);
                    }
                }
            }
        }
        for (let div1 of (await Do(this.ns, "ns.corporation.getCorporation")).divisions) {
            if (Object.keys((await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div1)).type))).includes("producedMaterials")) {
                for (let mat1 of (await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div1)).type)).producedMaterials) {
                    for (let div2 of (await Do(this.ns, "ns.corporation.getCorporation")).divisions) {
                        for (let mat2 of Object.keys((await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div2)).type)).requiredMaterials)) {
                            if (mat1 === mat2 && div1 != div2) {
                                for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                                    this.ns.tprint(div1, div2, mat1, mat2, city);
                                    Do(this.ns, "ns.corporation.exportMaterial", div1, city, div2, city, mat1, "-IPROD-IINV/10");
                                }
                            }
                        }
                    }            
                }
            }
        }
    }
    async chemDiv(div:string) {
        while ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round < 2) {
            await this.ns.asleep(1000);
        }
        await this.expandAllCities(div);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            this.warehouseLevel(div, city, 2);
            for (let mat of (await Do(this.ns, "ns.corporation.getIndustryData", (await Do(this.ns, "ns.corporation.getDivision", div)).type)).producedMaterials) {
                Do(this.ns, "ns.corporation.sellMaterial", div, city, mat, "MAX", "MP");
            }
        }
        while (!(await Do(this.ns, "ns.corporation.hasUnlock", "Smart Supply"))) {
            await Do(this.ns, "ns.corporation.purchaseUnlock", "Smart Supply");
            await this.ns.asleep(0);
        }
        let divData:any = await Do(this.ns, "ns.corporation.getDivision", div);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            while ((await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees < 3) {
                await Do(this.ns, "ns.corporation.hireEmployee", div, city, "Research & Development");
                await this.ns.asleep(0);
            }
            this.warehouseLevel(div, city, 5);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", (await Do(this.ns, "ns.corporation.getOffice", div, city)).numEmployees);
        }
        await this.getHappy(div);
        while ((await Do(this.ns, "ns.corporation.getDivision", div)).researchPoints < 400) {
            await this.ns.asleep(10000);
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Management", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Research & Development", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Intern", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 0);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 0);
        }
        await this.ns.asleep(10000);
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Operations", 1);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Engineer", 1);
            await Do(this.ns, "ns.corporation.setAutoJobAssignment", div, city, "Business", 1);
        }
        if ((await Do(this.ns, "ns.corporation.getInvestmentOffer")).round == 2) {
            for (let city of Object.values(this.ns.enums.CityName) as string[]) {
                this.ns.tprint(await Do(this.ns, "ns.corporation.getOffice", div, city));
                await Do(this.ns, "ns.corporation.setSmartSupply", div, city, true);
                this.WarehouseSet(div, city, "AI Cores", 1732);
                this.WarehouseSet(div, city, "Hardware", 3220);
                this.WarehouseSet(div, city, "Real Estate", 55306);
                this.WarehouseSet(div, city, "Robots", 58);
            }
        }
        for (let city of Object.values(this.ns.enums.CityName) as string[]) {
            this.warehouseLevel(div, city, 3);
        }
    }
    async WarehouseSet(div: string, city: string, material: string, amount: number) {
        let data:any = await Do(this.ns, "ns.corporation.getMaterial", div, city, material);
        if (data.stored < amount) {
            await Do(this.ns, "ns.corporation.buyMaterial", div, city, material, Math.abs(data.stored-amount)/10.0);
            await Do(this.ns, "ns.corporation.sellMaterial", div, city, material, 0, 0);
            await this.ns.asleep(10000);
            await Do(this.ns, "ns.corporation.buyMaterial", div, city, material, 0);
            this.WarehouseSet(div, city, material, amount);
        }
        if (data.stored > amount) {
            await Do(this.ns, "ns.corporation.buyMaterial", div, city, material, 0);
            await Do(this.ns, "ns.corporation.sellMaterial", div, city, material, Math.abs(amount-data.stored)/10.0, 0);
            await this.ns.asleep(10000);
            await Do(this.ns, "ns.corporation.sellMaterial", div, city, material, 0, 0);
            this.WarehouseSet(div, city, material, amount);
        }
    }
}