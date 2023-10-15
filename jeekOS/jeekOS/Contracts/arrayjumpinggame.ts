function arrayjumpinggame(data) {
	let queue = new Set();
	if (data[0] == 0) {
		return 0;
	}
	queue.add("[" + data.toString() + "]");
	while (queue.size > 0) {
		let current = Array.from(queue)[0];
		queue.delete(current);
		current = JSON.parse(current);
		if (current[0] != 0) {
			if (current[0] + 1 > current.length) {
				return 1;
			}
			for (let i = 1; i <= current[0] && i < current.length; i++) {
				queue.add(("[".concat(current.slice(i)).toString()).concat("]"));
			}
		}
	}
	return 0;
}