function twocolor(data: [number, [number, number][]]) {
	for (let i = 0; i < 2 ** data[0]; i++) {
		let answer: number[] = [];
		for (let j = 0; j < data[0]; j++) {
			answer[j] = (2 ** j & i) > 0 ? 1 : 0;
		}
		if (data[1].reduce((a: number, b) => { return a + ((answer[b[0]] != answer[b[1]]) ? 1 : 0) }, 0) == data[1].length) {
			return answer;
		}
	}
	return [];
}
