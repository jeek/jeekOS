import { Do } from "jeekOS/Do";

export async function CorpMats(ns: any) {
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
  let color = "#00FF00";
  let seen: any = [];
  for (let industry of (await Do(ns, "ns.corporation.getConstants"))
    .industryNames) {
    src =
      src +
      '"' +
      industry +
      'industry"[color="' +
      color +
      '",fontcolor="' +
      color +
      '",shape=record,label="' +
      industry +
      '"];';
    let indData = await Do(ns, "ns.corporation.getIndustryData", industry);
    for (let mat in indData.requiredMaterials) {
      if (!seen.includes(mat)) {
        src =
          src +
          '"' +
          mat +
          '"[color="' +
          color +
          '",fontcolor="' +
          color +
          '",shape=oval,label="' +
          mat +
          '"];';
        seen.push(mat);
      }
      src = src + '"' + mat + '" -> "' + industry + 'industry";' + "\n";
    }
    if (indData.producedMaterials) {
      for (let mat of indData.producedMaterials) {
        src = src + '"' + industry + 'industry" -> "' + mat + '";' + "\n";
        if (!seen.includes(mat)) {
          src =
            src +
            '"' +
            mat +
            '"[color="' +
            color +
            '",fontcolor="' +
            color +
            '",shape=oval,label="' +
            mat +
            '"];';
          seen.push(mat);
        }
      }
    }
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
