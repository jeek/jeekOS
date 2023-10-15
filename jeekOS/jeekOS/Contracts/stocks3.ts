function stonks3(data: number[]) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
			for (let k = j + 1; k < data.length; k++) {
				for (let l = k + 1; l < data.length; l++) {
					best = Math.max(best, data[j] - data[i] + data[l] - data[k]);
				}
			}
		}
	}
	return best;
}