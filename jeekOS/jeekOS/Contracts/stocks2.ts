function stonks2(data: number[]) {
	let best = 0;
	let queue = new Map<string, number>();
	queue.set(JSON.stringify(data), 0);
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue.get(current)!;
		queue.delete(current);
		let stonks = JSON.parse(current);
		for (let i = 0; i < stonks.length; i++) {
			for (let j = i + 1; j < stonks.length; j++) {
				best = Math.max(best, value + stonks[j] - stonks[i]);
				let remaining = stonks.slice(j + 1);
				if (remaining.length > 0) {
					if (!Object.keys(queue).includes(JSON.stringify(remaining))) {
						queue.set(JSON.stringify(remaining), -1e308);
					}
					queue.set(JSON.stringify(remaining), Math.max(queue.get(JSON.stringify(remaining))!, value + stonks[j] - stonks[i]));
				}
			}
		}
	}
	return best;
}