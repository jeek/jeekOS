import { NS } from "@ns";
import { Corp } from "jeekOS/Corp";
import { Servers } from "jeekOS/Servers";
import { Jobs } from "jeekOS/Jobs";
import { Factions } from "jeekOS/Factions";
import { Weather } from "jeekOS/Weather";
import { Focus } from "jeekOS/Focus";
import { Crime } from "jeekOS/Crime";
import { Traveling } from "jeekOS/Traveling";
import { Augmentations } from "jeekOS/Augmentations";
import { Gangs } from "jeekOS/Gangs";
import { Do } from "jeekOS/Do";
import { CollegeGym } from "jeekOS/CollegeGym";
import { Checkout } from "jeekOS/Checkout";
import { Contracts } from "jeekOS/Contracts";
import { terminalHistory } from "jeekOS/TerminalHistory";
import { purchasedServersHandler } from "jeekOS/PurchasedServers";
import { getPrograms } from "jeekOS/Programs";
import { bootstrap8gb } from "jeekOS/Bootstrap";

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
  crime: Crime;
  traveling: Traveling;
  augmentations: Augmentations;
  collegegym: CollegeGym;
  growCount: number;
  checkout: Checkout;
  gangToJoin: string;
  gangMemberNames: string[];
  gang: Gangs;
  corp: Corp;
  contracts: Contracts;
  weather: Weather;
  th: terminalHistory;

  transition = (fn: any) => {
    let sidebar = this.doc.querySelector(".sb")!;
    sidebar.classList.add("t");
    fn();
    setTimeout(() => this.sidebar.classList["remove"]("t"), 200);
  };
  elemFromHTML(html: string): Element {
    return new Range().createContextualFragment(html)
      .firstElementChild! as Element;
  }
  constructor(ns: NS, gangToJoin: string, gangMemberNames: string[]) {
    this.ns = ns;
    this.doc = eval("document")!;
    this.win = eval("document")!.win;
    this.sidebar = this.doc.querySelector(".sb")!;
    this.gangToJoin = gangToJoin;
    this.gangMemberNames = gangMemberNames;
    this.growCount = 0;
    this.running = true;
    this.contracts = new Contracts(this);
    this.settings = {};
    this.servers = new Servers(this, true);
    this.focus = new Focus(this);
    this.collegegym = new CollegeGym(this);
    this.jobs = new Jobs(this);
    this.augmentations = new Augmentations(this);
    this.factions = new Factions(this);
    this.crime = new Crime(this);
    this.traveling = new Traveling(this);
    this.checkout = new Checkout(this);
    this.gang = new Gangs(this);
    this.css =
      `body{--prilt:` +
      this.ns.ui.getTheme()["primarylight"] +
      `;--pri:` +
      this.ns.ui.getTheme()["primary"] +
      `;--pridk:` +
      this.ns.ui.getTheme()["primarydark"] +
      `;--successlt:` +
      this.ns.ui.getTheme()["successlight"] +
      `;--success:` +
      this.ns.ui.getTheme()["success"] +
      `;--successdk:` +
      this.ns.ui.getTheme()["successdark"] +
      `;--errlt:` +
      this.ns.ui.getTheme()["errorlight"] +
      `;--err:` +
      this.ns.ui.getTheme()["error"] +
      `;--errdk:` +
      this.ns.ui.getTheme()["errordark"] +
      `;--seclt:` +
      this.ns.ui.getTheme()["secondarylight"] +
      `;--sec:` +
      this.ns.ui.getTheme()["secondary"] +
      `;--secdk:` +
      this.ns.ui.getTheme()["secondarydark"] +
      `;--warnlt:` +
      this.ns.ui.getTheme()["warninglight"] +
      `;--warn:` +
      this.ns.ui.getTheme()["warning"] +
      `;--warndk:` +
      this.ns.ui.getTheme()["warningdark"] +
      `;--infolt:` +
      this.ns.ui.getTheme()["infolight"] +
      `;--info:` +
      this.ns.ui.getTheme()["info"] +
      `;--infodk:` +
      this.ns.ui.getTheme()["infodark"] +
      `;--welllt:` +
      this.ns.ui.getTheme()["welllight"] +
      `;--well:` +
      this.ns.ui.getTheme()["well"] +
      `;--white:#fff;--black:#000;--hp:` +
      this.ns.ui.getTheme()["hp"] +
      `;--money:` +
      this.ns.ui.getTheme()["money"] +
      `;--hack:` +
      this.ns.ui.getTheme()["hack"] +
      `;--combat:` +
      this.ns.ui.getTheme()["combat"] +
      `;--cha:` +
      this.ns.ui.getTheme()["cha"] +
      `;--int:` +
      this.ns.ui.getTheme()["int"] +
      `;--rep:` +
      this.ns.ui.getTheme()["rep"] +
      `;--disabled:` +
      this.ns.ui.getTheme()["disabled"] +
      `;--bgpri:` +
      this.ns.ui.getTheme()["backgroundprimary"] +
      `;--bgsec:` +
      this.ns.ui.getTheme()["backgroundsecondary"] +
      `;--button:` +
      this.ns.ui.getTheme()["button"] +
      `;--ff:"` +
      this.ns.ui.getStyles()["fontFamily"] +
      `";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 500px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
    this.corp = new Corp(this);
    this.th = new terminalHistory(this);
    this.weather = new Weather(this);
    if (!this.sidebar) {
      this.sidebar = this.doc.body.appendChild(
        this.elemFromHTML(
          `<div class="sb"><style>${this.css}</style><div class="head"><a class="icon collapser">\ueab6</a><span class=title>sidebar</span></div>`
        )
      ) as HTMLElement;
      this.sidebar.addEventListener("keydown", (e) => e.stopPropagation());
      this.sidebar.querySelector(".head")!.addEventListener("click", () => {
        this.transition(() => this.sidebar.classList.toggle("c"));
        setTimeout(
          () =>
            this.doc.querySelector(".monaco-editor") &&
            Object.assign(
              (this.doc.querySelector(".monaco-editor")! as HTMLElement).style!,
              { width: "0px" }
            )!,
          255
        );
      });
    }
    //this.killModal(this.ns);
    this.start();
    this.hacknetservers();
  }
  async hacknetservers() {
    if ((await Do(this.ns, "ns.getResetInfo")).currentNode == 11) {
      while (true) {
        await Do(this.ns, "ns.hacknet.purchaseNode");
        for (
          let i = 0;
          i < (await Do(this.ns, "ns.hacknet.numNodes"));
          i += 1
        ) {
          if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
            await Do(this.ns, "ns.kill", "batcher.js", "home");
          }
        }
        await this.ns.asleep(60000);
      }
    }
    while (
      4 >=
      (
        await Promise.all(
          Array.from(
            Array(await Do(this.ns, "ns.hacknet.numNodes")).keys()
          ).map((x) => Do(this.ns, "ns.hacknet.getNodeStats", x))
        )
      )
        .map((x) => x.production)
        .reduce((a: any, b: any) => {
          return a + b;
        }, 0)
    ) {
      try {
        await Do(this.ns, "ns.hacknet.purchaseNode");
      } catch {}
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
      for (let i = 0; i < (await Do(this.ns, "ns.hacknet.numNodes")); i += 1) {
        if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
          await Do(this.ns, "ns.kill", "batcher.js", "home");
        }
        await Do(this.ns, "ns.hacknet.upgradeCore", i);
        await Do(this.ns, "ns.hacknet.upgradeLevel", i);
      }
      await this.ns.asleep(0);
    }
    while (!(await Do(this.ns, "ns.corporation.hasCorporation"))) {
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
      await this.ns.asleep(0);
    }
    while (true) {
      try {
        await Do(this.ns, "ns.hacknet.purchaseNode");
      } catch {}
      await Do(
        this.ns,
        "ns.hacknet.spendHashes",
        "Exchange for Corporation Research"
      );
      await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Corporation Funds");
      for (let i = 0; i < (await Do(this.ns, "ns.hacknet.numNodes")); i += 1) {
        if (await Do(this.ns, "ns.hacknet.upgradeRam", i)) {
          await Do(this.ns, "ns.kill", "batcher.js", "home");
        }
        await Do(this.ns, "ns.hacknet.upgradeCore", i);
        await Do(this.ns, "ns.hacknet.upgradeLevel", i);
        await Do(this.ns, "ns.hacknet.upgradeCache", i);
      }
      await this.ns.asleep(0);
    }
  }
  async start() {
    switch ((await Do(this.ns, "ns.getResetInfo")).currentNode) {
      case 5:
      case 6:
      case 7:
      case 10:
      case 11:
      case 12:
      case 13:
      case 2:
        await this.gang.gangCreate();
        await this.gang.start();
      default:
        this.factions.initialize(this.ns);
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
          while (
            (await Do(this.ns, "ns.singularity.getUpgradeHomeRamCost"))! <
              (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))! &&
            (await Do(this.ns, "ns.singularity.upgradeHomeRam"))
          ) {}
          await this.ns.asleep(0);
        }
    }
  }
  async killModal(ns: any) {
    while (true) {
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("you feel different")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("for destroying its corresponding")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      await ns.asleep(10000);
      try {
        let doc = eval("document");
        let modal = doc.evaluate(
          "//div[contains(@class,'MuiBackdrop-root')]",
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (modal.innerHTML.includes("destroying a BitNode")) {
          modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
        }
      } catch {}
      await ns.asleep(10000);
    }
  }
  ts = () =>
    `[<span class=ts>${new Date().toLocaleTimeString("en-gb")}</span>]`;
  createItem = (title: string, content: any, icon: any, ...classes: any[]) => {
    this.doc = eval("document");
    let sidebar: any = this.doc.querySelector(".sb");
    let item = sidebar.appendChild(
      this.elemFromHTML(
        `<div class="${classes.join(
          " "
        )}"><div class="head"><a class="icon">${icon}</a><span class=title>${title}</span><a class="icon collapser">\ueab7</a><a class="icon close">\ueab8</a></div><div class="body"><div class="display" hidden></div>${content}</div></div>`
      )
    );
    Object.assign(item, {
      head: item.querySelector(".head"),
      body: item.querySelector(".body"),
      display: () => {
        item.querySelector(".display").removeAttribute("hidden");
        return item.querySelector(".display");
      },
      toggleType: () =>
        ["box", "sbitem"].forEach((cl) => item.classList.toggle(cl)),
      logTarget: item.querySelector(".log"),
      log: (html: string, timestamp = true) => {
        if (!item.logTarget || !this.doc.contains(item.logTarget))
          item.logTarget = item.body.appendChild(
            this.elemFromHTML("<div class=log></div>")
          );
        let logEntry = item.logTarget.appendChild(
          this.elemFromHTML(`<p>${timestamp ? this.ts() : ""} ${html}</p>`)
        );
        try {
          while (
            (item.logTarget.innerHTML.match(/\<p\>/g) || []).length > item.sizeM
          ) {
            item.logTarget.innerHTML = item.logTarget.innerHTML.slice(
              item.logTarget.innerHTML.indexOf("<p>", 3)
            );
          }
        } catch {}
        item.logTarget.scrollTop = item.logTarget.scrollHeight;
        item.recalcHeight();
        return logEntry;
      },
      sizeM: 10,
      recalcHeight: () => {
        item.style.height = "";
        item.style.height = item.offsetHeight + "px";
      },
      contextItems: { any: {} },
      addContextItem: (name: any, fn: any, cFn = () => 1) =>
        (item.contextItems[name] = { fn: fn, cFn: cFn }),
    });

    [
      ["Remove Item", () => item["remove"]()],
      ["Cancel", () => 0],
      [
        "Float to Top",
        () =>
          this.sidebar
            .querySelector(".head")!
            .insertAdjacentElement("afterend", item),
        () => item.classList.contains("sbitem"),
      ],
      [
        "Sink to Bottom",
        () => this.sidebar.appendChild(item),
        () => item.classList.contains("sbitem"),
      ],
      ["Toggle Type", () => item.toggleType()],
      ["Recalculate Height", item.recalcHeight],
    ].forEach((zargs) => item.addContextItem(...zargs));

    item.addEventListener(
      "mousedown",
      (e: any) =>
        item.classList.contains("box") &&
        Object.assign(item.style, { zIndex: this.zIndex() })
    );
    item.head.addEventListener("mousedown", (e: any) => {
      if (item.classList.contains("sbitem"))
        return e.button || this.transition(() => item.classList.toggle("c"));
      if (e.target.tagName === "A") return;
      let x = e.clientX,
        y = e.clientY,
        l = item.offsetLeft,
        t = item.offsetTop;
      let boxDrag = (e: any) =>
        Object.assign(item.style, {
          left:
            Math.max(
              Math.min(
                this.win.innerWidth - item.offsetWidth,
                l + e.clientX - x
              ),
              0
            ) + "px",
          top:
            Math.max(
              Math.min(
                this.win.innerHeight - item.offsetHeight,
                t + e.clientY - y
              ),
              0
            ) + "px",
        });
      let boxDragEnd = (e: any) => {
        this.doc.removeEventListener("mouseup", boxDragEnd);
        this.doc.removeEventListener("mousemove", boxDrag);
      };
      this.doc.addEventListener("mouseup", boxDragEnd);
      this.doc.addEventListener("mousemove", boxDrag);
    });
    item.head
      .querySelector(".close")
      .addEventListener("click", (e: any) => item["remove"]());
    item.head
      .querySelector(".collapser")
      .addEventListener(
        "click",
        (e: any) =>
          item.classList.contains("box") &&
          this.transition(() => item.classList.toggle("c"))
      ); // || this.win._boxEdgeDetect()));
    this.win = eval("window");
    item.head.addEventListener(
      "contextmenu",
      (e: any) =>
        e.preventDefault() || this.contextMenu(item, e.clientX, e.clientY)
    );
    Object.assign(item.style, {
      left: Math.floor(this.win.innerWidth / 2 - item.offsetWidth / 2) + "px",
      top: Math.floor(this.win.innerHeight / 2 - item.offsetHeight / 2) + "px",
      height: (item.offsetHeight || 200) + "px",
      width: (item.offsetWidth || 200) + "px",
      zIndex: this.zIndex(),
    });
    return item;
  };
  createBox = (
    title: string,
    content: any,
    icon = "\uea74",
    ...classes: any[]
  ) => this.createItem(title, content, icon, ...classes, "box");
  createSidebarItem = (
    title: string,
    content: any,
    icon = "\uea74",
    ...classes: any[]
  ) => this.createItem(title, content, icon, ...classes, "sbitem");
  confirm = (text: string) => {
    let box = this.createBox(
      "Confirmation Prompt",
      `<div class=g2><div class=f>${text}</div><button class=r><u>Y</u>es</button><button class=l><u>N</u>o</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("button").focus();
    box.addEventListener(
      "keyup",
      (e: any) =>
        (e.key.toLowerCase() === "y" && box.querySelector("button").click()) ||
        (e.key.toLowerCase() === "n" &&
          box.querySelectorAll("button")[1].click())
    );
    return new Promise((r) =>
      box
        .querySelectorAll("button")
        .forEach((button: any, i: any) =>
          button.addEventListener("click", () => box["remove"](r(i == 0)))
        )
    );
  };
  prompt = (text: string) => {
    let box = this.createBox(
      "Input Prompt",
      `<div class=g2><div class=f>${text}</div><input class=r /><button class=l>Submit</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("input").focus();
    box
      .querySelector("input")
      .addEventListener(
        "keyup",
        (e: any) => e.key == "Enter" && box.querySelector("button").click()
      );
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () =>
          box["remove"](r(box.querySelector("input").value))
        )
    );
  };
  select = (text: string, options: any) => {
    let box = this.createBox(
      "Selection Prompt",
      `<div class=g2><div class=f>${text}</div><select class=r>${options
        .map((option: any) => `<option value="${option}">${option}</option>`)
        .join("")}</select><button class=l>Submit</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("select").focus();
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () =>
          box["remove"](r(box.querySelector("select").value))
        )
    );
  };
  alert = (text: string) => {
    let box = this.createBox(
      "Alert Message",
      `<div class=g2><div class=f>${text}</div><button class=f>Ok</button></div>`,
      "",
      "prompt"
    );
    box.querySelector("button").focus();
    return new Promise((r) =>
      box
        .querySelector("button")
        .addEventListener("click", () => r(box["remove"]()))
    );
  };
  contextMenu = (item: any, x: any, y: any) => {
    if (item.classList.contains("prompt")) return;
    let options = Object.entries(item.contextItems).filter((entry: any) =>
      Object.keys(entry[1]).includes("cFn")
    );
    let box = this.createBox(
      "",
      `<div class=g2><div class=f>${
        item.querySelector(".title").innerText
      }.context</div>${options
        .map(([name, entry]) => `<button class=n>${name}</button>`)
        .join("")}</div>`,
      "",
      "contextMenu"
    );
    box.querySelector("button").focus();
    Object.assign(box.style, {
      left:
        Math.max(
          Math.min(this.win.innerWidth - box.offsetWidth / 2, x),
          box.offsetWidth / 2
        ) + "px",
      top:
        Math.max(
          Math.min(this.win.innerHeight - box.offsetHeight / 2, y),
          box.offsetHeight / 2
        ) + "px",
      transform: "translate(-50%, -50%)",
    });
    box
      .querySelectorAll("button")
      .forEach((button: any) =>
        button.addEventListener("click", () =>
          box["remove"](item.contextItems[button.innerText].fn())
        )
      );
    box.addEventListener("mousedown", (e: any) => e.stopPropagation());
    let docFunction: any = () =>
      box["remove"](this.doc.removeEventListener("mousedown", docFunction));
    setTimeout(() => this.doc.addEventListener("mousedown", docFunction), 10);
  };
  zIndex = () =>
    Math.max(
      9000,
      ...[...this.doc.querySelectorAll(".sb .box")].map(
        (box: any) => box.style.zIndex
      )
    ) + 1;
}
