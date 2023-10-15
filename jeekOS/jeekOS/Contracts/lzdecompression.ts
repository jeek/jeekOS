function lzdecompression(data: string) {
	if (data.length == 0) {
		return "";
	}
	let dataA = data.split("");
	let answer = "";
	while (dataA.length > 0) {
		let chunklength = parseInt(dataA.shift()!);
		if (chunklength > 0) {
			answer = answer.concat(dataA.splice(0, chunklength).join(""));
		}
		if (dataA.length > 0) {
			chunklength = parseInt(dataA.shift()!);
			if (chunklength != 0) {
				let rewind = parseInt(dataA.shift()!);
				for (let i = 0; i < chunklength; i++) {
					answer = answer.concat(answer[answer.length - rewind]);
				}
			}
		}
	}
	return answer;
}
