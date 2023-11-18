import { NS, Server } from "@ns";
import { Servers } from "jeekOS/Servers/servers";
import { purchasedServersHandler } from "jeekOS/PurchasedServers/purchasedservers";
import { getPrograms } from "jeekOS/Darkweb/getPrograms";
import { bootstrap8gb } from "jeekOS/Bootstrap/bootstrap8gb";
import { Jobs } from "jeekOS/Jobs/jobs";
import { Do } from "jeekOS/Do/do";
import { Factions } from "jeekOS/Factions/factions";
import { Focus } from "jeekOS/Focus/focus";
import { Dropout } from "jeekOS/Dropout/dropout";
import { Crime } from "jeekOS/Crime/crime";
import { Traveling } from "jeekOS/Traveling/traveling";
import { Augmentations } from "jeekOS/Augmentations/augmentations";
import { CollegeGym } from "jeekOS/CollegeGym/collegegym";
import { Checkout } from "jeekOS/Checkout/checkout";

export class WholeGame {
    ns: NS;
    settings: {};
    servers: Servers;
    running: boolean;
    jobs: Jobs;
    factions: Factions;
    sidebar: Element;
    doc: Document;
    win: Window;
    css: string;
    focus: Focus;
    dropout: Dropout;
    crime: Crime;
    traveling: Traveling;
    augmentations: Augmentations;
    collegegym: CollegeGym;
    growCount: number;
    checkout: Checkout;

    transition = (fn: any) => {
		let sidebar = this.doc.querySelector(".sb")!;
		sidebar.classList.add("t");
		fn();
		setTimeout(() => this.sidebar.classList["remove"]("t"), 200);
	}
    elemFromHTML(html: string): Element {
        return (new Range().createContextualFragment(html).firstElementChild!) as Element;
    }
	constructor(ns: NS) {
		this.ns = ns;
        this.growCount = 0;
        this.running = true;
        this.settings = {};
        this.servers = new Servers(this);
        this.focus = new Focus(this);
        this.collegegym = new CollegeGym(this);
        this.jobs = new Jobs(this);
        this.augmentations = new Augmentations(this);
        this.factions = new Factions(this);
        this.doc = eval('document')!;
        this.sidebar = this.doc.querySelector(".sb")!;
        this.win = eval('document')!.win;
        this.crime = new Crime(this);
        this.traveling = new Traveling(this);
        this.checkout = new Checkout(this);
        this.dropout = new Dropout(this, 200); // Go to college until hacking skill is second argument
    	this.css = `body{--prilt:` + this.ns.ui.getTheme()['primarylight'] + `;--pri:` + this.ns.ui.getTheme()['primary'] + `;--pridk:` + this.ns.ui.getTheme()['primarydark'] + `;--successlt:` + this.ns.ui.getTheme()['successlight'] + `;--success:` + this.ns.ui.getTheme()['success'] + `;--successdk:` + this.ns.ui.getTheme()['successdark'] + `;--errlt:` + this.ns.ui.getTheme()['errorlight'] + `;--err:` + this.ns.ui.getTheme()['error'] + `;--errdk:` + this.ns.ui.getTheme()['errordark'] + `;--seclt:` + this.ns.ui.getTheme()['secondarylight'] + `;--sec:` + this.ns.ui.getTheme()['secondary'] + `;--secdk:` + this.ns.ui.getTheme()['secondarydark'] + `;--warnlt:` + this.ns.ui.getTheme()['warninglight'] + `;--warn:` + this.ns.ui.getTheme()['warning'] + `;--warndk:` + this.ns.ui.getTheme()['warningdark'] + `;--infolt:` + this.ns.ui.getTheme()['infolight'] + `;--info:` + this.ns.ui.getTheme()['info'] + `;--infodk:` + this.ns.ui.getTheme()['infodark'] + `;--welllt:` + this.ns.ui.getTheme()['welllight'] + `;--well:` + this.ns.ui.getTheme()['well'] + `;--white:#fff;--black:#000;--hp:` + this.ns.ui.getTheme()['hp'] + `;--money:` + this.ns.ui.getTheme()['money'] + `;--hack:` + this.ns.ui.getTheme()['hack'] + `;--combat:` + this.ns.ui.getTheme()['combat'] + `;--cha:` + this.ns.ui.getTheme()['cha'] + `;--int:` + this.ns.ui.getTheme()['int'] + `;--rep:` + this.ns.ui.getTheme()['rep'] + `;--disabled:` + this.ns.ui.getTheme()['disabled'] + `;--bgpri:` + this.ns.ui.getTheme()['backgroundprimary'] + `;--bgsec:` + this.ns.ui.getTheme()['backgroundsecondary'] + `;--button:` + this.ns.ui.getTheme()['button'] + `;--ff:"` + this.ns.ui.getStyles()['fontFamily'] + `";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 500px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
		if (!this.sidebar) {
			this.sidebar = this.doc.body.appendChild(this.elemFromHTML(`<div class="sb"><style>${this.css}</style><div class="head"><a class="icon collapser">\ueab6</a><span class=title>sidebar</span></div>`)) as HTMLElement;
			this.sidebar.addEventListener('keydown', e => e.stopPropagation());
			this.sidebar.querySelector('.head')!.addEventListener('click', () => {
				this.transition(() => this.sidebar.classList.toggle('c'));
				setTimeout(() => this.doc.querySelector(".monaco-editor") && Object.assign((this.doc.querySelector(".monaco-editor")! as HTMLElement).style!, { width: "0px" })!, 255);
			});
		}
        this.start();
//        this.killModal();
	}

    async start() {
        while (false == this.factions.initialized) {
            await this.ns.asleep(0);
        }
        while (false == this.servers.initialized) {
            await this.ns.asleep(0);
        }
        await this.ns.asleep(0);
        //await eval('document')!.win.addEventListener("resize",  () => this.doc.querySelectorAll('.sb .box').forEach(box => Object.assign((box as HTMLElement).style, { left: Math.max(Math.min(this.win.innerWidth - (box as HTMLElement).offsetWidth, (box as HTMLElement).offsetLeft), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - (box as HTMLElement).offsetHeight, (box as HTMLElement).offsetTop), 0) + "px" })));
        await this.servers.popall();
        this.servers.popallloop();
        purchasedServersHandler(this);
        getPrograms(this.ns);
        while (true) {
            await bootstrap8gb(this);
            while ((await Do(this.ns, "ns.singularity.getUpgradeHomeRamCost"))! < (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))!) {
                await Do(this.ns, "ns.singularity.upgradeHomeRam");
            }
            await this.ns.asleep(0);
        }
    }
    killModal() {
        try {
        let doc = eval('document');
        let modal = doc.evaluate("//div[contains(@class,'MuiBackdrop-root')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        } catch { }
    }
}