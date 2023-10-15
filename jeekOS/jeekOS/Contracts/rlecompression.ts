function rlecompression(data: string) {
	let answer = "";
	let dataA: string[] = data.split("");
	while (dataA.length > 0) {
		let z: string[] = dataA.splice(0, 1);
		let i = 1;
		while (i < 9 && dataA[0] == z[0] && dataA.length > 0) {
			i += 1;
			dataA.splice(0, 1);
		}
		answer = answer.concat(i.toString()).concat(z[0]);
	}
	return answer;
}