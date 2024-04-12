import { NS } from "@ns";

export async function Do(
  ns: NS,
  command: string,
  ...args: any[]
): Promise<any> {
  return await DoMore(ns, 1, command, ...args);
}

export async function DoMore(
  ns: NS,
  threads: number,
  command: string,
  ...args: (string | number)[]
): Promise<any> {
  let commandy = command.replace("await ", "").replace("ns.", "");
  let memory = 1.6 + ns.getFunctionRamCost(commandy);
  let pid = ns.run(
    "/jeekOS.js",
    { ramOverride: memory, threads: threads },
    "--ramOverride",
    memory,
    "--do",
    JSON.stringify([commandy, JSON.stringify(args)])
  );
  let z = -1;
  while (0 == pid) {
    z += 1;
    await ns.asleep(z);
    pid = ns.run(
      "/jeekOS.js",
      { ramOverride: memory, threads: threads },
      "--ramOverride",
      memory,
      "--do",
      JSON.stringify([commandy, JSON.stringify(args)])
    );
  }
  await ns.getPortHandle(pid).nextWrite();
  let answer: any = ns.readPort(pid);
  return answer;
}
