function totalwaystosumII(data: [number, number[]]) {
	let answer = [1].concat((new Array(data[0])).fill(0));
	for (let i of data[1]) {
		for (let j = i; j <= data[0]; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data[0]];
}