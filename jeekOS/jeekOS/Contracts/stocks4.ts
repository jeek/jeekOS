function stonks4(data: [number, number[]]) {
	let best = 0;
	let queue = new Map<number, Map<string, number>>();
	queue.set(0, new Map<string, number>());
	queue.get(0)!.set(JSON.stringify(data[1]), 0);
	for (let ii = 0; ii < data[0]; ii++) {
		queue.set(ii + 1, new Map<string, number>);
		while (Object.keys(queue.get(ii)!).length > 0) {
			let current = Object.keys(queue.get(ii)!)[0];
			let value = queue.get(ii)!.get(current);
			queue.get(ii)!.delete(current);
			let stonks = JSON.parse(current);
			for (let i = 0; i < stonks.length; i++) {
				for (let j = i + 1; j < stonks.length; j++) {
					best = Math.max(best, value + stonks[j] - stonks[i]);
					let remaining = stonks.slice(j + 1);
					if (remaining.length > 0) {
						if (!Object.keys(queue.get(ii + 1)!).includes(JSON.stringify(remaining))) {
							queue.get(ii + 1)!.set(JSON.stringify(remaining), -1e308);
						}
						queue.get(ii + 1)!.set(JSON.stringify(remaining), Math.max(queue.get(ii + 1)!.get(JSON.stringify(remaining))!, value + stonks[j] - stonks[i]));
					}
				}
			}
		}
	}
	return best;
}