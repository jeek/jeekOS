function subarraywithmaximumsum(data: number[]) {
	let answer = -1e308;
	for (let i = 0; i < data.length; i++) {
		for (let j = i; j < data.length; j++) {
			answer = Math.max(answer, data.slice(i, j + 1).reduce((a, b) => { return a + b }));
		}
	}
	return answer;
}