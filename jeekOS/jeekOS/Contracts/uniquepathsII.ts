function uniquepathsII(data: number[][]) {
	let answer: number[][] = [];
	for (let i = 0; i < data.length; i++) {
		answer.push(new Array(data[0].length).fill(0));
	}
	for (let i = data.length - 1; i >= 0; i--) {
		for (let j = data[0].length - 1; j >= 0; j--) {
			if (data[i][j] == 0) {
				answer[i][j] = (i + 1 < data.length ? answer[i + 1][j] : 0) + (j + 1 < data[0].length ? answer[i][j + 1] : 0);
				answer[data.length - 1][data[0].length - 1] = 1;
			}
		}
	}
	return answer[0][0];
}