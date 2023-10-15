function spiralizematrix(data: number[][]) {
	let answer: number[] = [];
	while (data.length > 0 && data[0].length > 0) {
		answer = answer.concat(data.shift()!);
		if (data.length > 0 && data[0].length > 0) {
			answer = answer.concat(data.map(x => x.pop()!));
			if (data.length > 0 && data[0].length > 0) {
				answer = answer.concat(data.pop()!.reverse());
				if (data.length > 0 && data[0].length > 0) {
					answer = answer.concat(data.map(x => x.shift()!).reverse());
				}
			}
		}
	}
	return answer;
}