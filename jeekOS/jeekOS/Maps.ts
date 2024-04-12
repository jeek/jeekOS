import { NS } from "@ns";
import { Do } from "jeekOS/Do";

export async function Maps(ns: NS) {
  let React = eval("window").React;
  let fg = ns.ui.getTheme()["primarylight"];
  if (fg.substring(0, 1) === "#" && fg.length == 4) {
    fg =
      "#" +
      fg.substring(1, 2) +
      fg.substring(1, 2) +
      fg.substring(2, 3) +
      fg.substring(2, 3) +
      fg.substring(3, 4) +
      fg.substring(3, 4);
  }
  let info = ns.ui.getTheme()["info"];
  if (info.substring(0, 1) === "#" && info.length == 4) {
    info =
      "#" +
      info.substring(1, 2) +
      info.substring(1, 2) +
      info.substring(2, 3) +
      info.substring(2, 3) +
      info.substring(3, 4) +
      info.substring(3, 4);
  }
  let warning = ns.ui.getTheme()["warning"];
  if (warning.substring(0, 1) === "#" && warning.length == 4) {
    warning =
      "#" +
      warning.substring(1, 2) +
      warning.substring(1, 2) +
      warning.substring(2, 3) +
      warning.substring(2, 3) +
      warning.substring(3, 4) +
      warning.substring(3, 4);
  }
  let error = ns.ui.getTheme()["error"];
  if (error.substring(0, 1) === "#" && error.length == 4) {
    error =
      "#" +
      error.substring(1, 2) +
      error.substring(1, 2) +
      error.substring(2, 3) +
      error.substring(2, 3) +
      error.substring(3, 4) +
      error.substring(3, 4);
  }
  let bg = ns.ui.getTheme()["backgroundprimary"];
  if (bg.substring(0, 1) === "#" && bg.length == 4) {
    bg =
      "#" +
      bg.substring(1, 2) +
      bg.substring(1, 2) +
      bg.substring(2, 3) +
      bg.substring(2, 3) +
      bg.substring(3, 4) +
      bg.substring(3, 4);
  }
  let src: string = "digraph{rankdir=LR;";
  src = src + 'bgcolor="' + bg + '";';
  src = src + 'edge[color="' + fg + '"];';
  let servers = ["home"];
  let i = 0;
  while (i < servers.length) {
    let color = fg;
    if (!(await Do(ns, "ns.getServer", servers[i]))!.hasAdminRights) {
      color = error;
    } else {
      if (
        (await Do(ns, "ns.getPlayer"))!["skills"]["hacking"] >=
        (await Do(ns, "ns.getServerRequiredHackingLevel", servers[i]))
      ) {
        if ((await Do(ns, "ns.getServer", servers[i])).backdoorInstalled) {
          color = fg;
        } else {
          color = info;
        }
      } else {
        color = warning;
      }
    }
    src =
      src +
      '"' +
      servers[i] +
      '"[color="' +
      color +
      '",fontcolor="' +
      color +
      '",shape=record,label="' +
      servers[i] +
      "\\n" +
      (
        (await Do(ns, "ns.getServer", servers[i]!)).requiredHackingSkill ?? 0
      ).toString() +
      "\\n" +
      "O"
        .repeat(
          Math.min(
            (await Do(ns, "ns.getServer", servers[i])).numOpenPortsRequired,
            (await Do(ns, "ns.getServer", servers[i]))!.openPortCount
          )
        )
        .toString() +
      "X"
        .repeat(
          Math.max(
            0,
            ((await Do(ns, "ns.getServer", servers[i]))!.numOpenPortsRequired ??
              0) -
              ((await Do(ns, "ns.getServer", servers[i])) ?? 0).openPortCount
          )
        )
        .toString() +
      '"];';
    for (let server of await Do(ns, "ns.scan", servers[i])) {
      if (!servers.includes(server)) {
        if (
          !(await Do(ns, "ns.getPurchasedServers"))!.includes(server) &&
          !server.includes("hacknet-server")
        ) {
          servers.push(server);
          if (
            (await Do(ns, "ns.getServer", servers[i])).requiredHackingSkill <=
              (await Do(ns, "ns.getServer", server))!.requiredHackingSkill ||
            true
          ) {
            src = src + '"' + servers[i] + '"->"' + server + '";';
          } else {
            src = src + '"' + server + '"->"' + servers[i] + '" [dir=back];';
          }
        }
      }
    }
    i += 1;
  }
  src = src + "}";
  src = src
    .replaceAll("=", "%3D")
    .replaceAll('"', "%22")
    .replaceAll("#", "%23");
  ns.tprintRaw(
    React.createElement("img", {
      width: "100%",
      src: `https://quickchart.io/graphviz?graph=` + src,
    })
  );
}
