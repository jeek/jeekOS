function vigenere(data: [string, string]) {
	return data[0].split("").map((x: string, i: number) => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 13 + data[1].charCodeAt(i % data[1].length))) % 26] }).join("");
}