import { NS, Server, Player } from "@ns";

// Hash function by @Insight from the Bitburner Discord
export function hashCode(s: string): number {
	return s.split("").reduce(
		function (a, b) {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0
	);
}

// Write the content to the file if it's different than what is already there
export function writeIfNotSame(ns: NS, filename: string, content: string): void {
	if (ns.read(filename) != content) {
		ns.write(filename, content, 'w');
	}
}

function uniqueID(s: string, random = false): string {
	let answer = "";
	let remainder = 0;
	if (random) {
		remainder = Math.floor(1e30 * Math.random());
	} else {
		remainder = hashCode(s);
	}
	if (remainder < 0) {
		remainder = -remainder;
	}
	while (remainder > 0) {
		answer = answer + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"[remainder % 64];
		remainder = Math.floor(remainder / 64);
	}
	return answer;
}

// Writes a command to a file, runs it, and then returns the result
export async function Do(ns: NS, command: string, ...args: string[]): Promise<string | number | null | Server | string[] | Player> { //FFIGNORE
	let progname = "/temp/proc-" + uniqueID(command);
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ns.writePort(ns.pid, JSON.stringify(` + command + `(...JSON.parse(ns.args[0])) ?? "UnDeFiNeDaF"), 'w'); }`);
	let pid = ns.run(progname + ".js", 1, JSON.stringify(args));
	let z = -1;
	while (0 == pid) {
		z += 1;
		await ns.asleep(z);
    	pid = ns.run(progname + ".js", 1, JSON.stringify(args));
	}
	await ns.getPortHandle(pid).nextWrite();
	let answer: string | number | null | Server | string[] | Player = JSON.parse(ns.readPort(pid).toString());
	return answer === "UnDeFiNeDaF" ? null : answer;
}

// Writes a command to a file, runs it, and then returns the result
export async function DoMore(ns: NS, threads: number, command: string, ...args: string[]): Promise<string | number | null | Server | string[] | Player> { //FFIGNORE
	let progname = "/temp/proc-" + uniqueID(command);
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ns.writePort(ns.pid, JSON.stringify(` + command + `(...JSON.parse(ns.args[0])) ?? "UnDeFiNeDaF"), 'w'); }`);
	let pid = ns.run(progname + ".js", threads, JSON.stringify(args));
	let z = -1;
	while (0 == pid) {
		z += 1;
		await ns.asleep(z);
    	pid = ns.run(progname + ".js", threads, JSON.stringify(args));
	}
	await ns.getPortHandle(pid).nextWrite();
	let answer: string | number | null | Server | string[] | Player = JSON.parse(ns.readPort(pid).toString());
	return answer === "UnDeFiNeDaF" ? null : answer;
}