function minpathsum(data: number[][]) {
	while (data.length > 1) {
		for (let i = 0; i < (data[data.length - 2]).length; i++) {
			data[data.length - 2][i] += Math.min(data[data.length - 1][i], Math.min(data[data.length - 1][i + 1]));
		}
		data.pop();
	}
	return data[0][0];
}