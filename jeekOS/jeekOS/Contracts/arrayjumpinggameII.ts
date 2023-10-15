function arrayjumpinggameII(data) {
	let queue = {};
	let best = 1e308;
	queue[data.toString()] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		current = current.split(",").map(i => parseInt(i));
		if (current[0] + 1 >= current.length) {
			best = Math.min(best, value + 1);
		} else {
			for (let i = 1; i <= current[0]; i++) {
				let newIndex = current.slice(i).toString();
				if (!Object.keys(queue).includes(newIndex)) queue[newIndex] = 1e308;
				queue[newIndex] = Math.min(queue[newIndex], value + 1);
			}
		}
	}
	return best == 1e308 ? 0 : best;
}