function shortestpathinagrid(data: number[][]) {
	let solutions = new Map<string, string>();
    solutions.set("0,0", "");
	let queue = new Set<string>();
	queue.add("0,0");
	for (let current of queue) {
		let x = parseInt(current.split(",")[0]);
		let y = parseInt(current.split(",")[1]);
		if (x > 0) {
			if (data[x - 1][y] == 0) {
				let key = (x - 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions.set(key, solutions.get(current)! + "U");
					queue.add(key);
				}
			}
		}
		if (x + 1 < data.length) {
			if (data[x + 1][y] == 0) {
				let key = (x + 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions.set(key, solutions.get(current)! + "D");
					queue.add(key);
				}
			}
		}
		if (y > 0) {
			if (data[x][y - 1] == 0) {
				let key = x.toString().concat(",").concat((y - 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions.set(key, solutions.get(current)! + "L");
					queue.add(key);
				}
			}
		}
		if (y + 1 < data[0].length) {
			if (data[x][y + 1] == 0) {
				let key = x.toString().concat(",").concat((y + 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions.set(key, solutions.get(current)! + "R");
					queue.add(key);
				}
			}
		}
	}
	let finalkey = (data.length - 1).toString().concat(",").concat((data[0].length - 1).toString());
	if (Object.keys(solutions).includes(finalkey)) {
		return solutions.get(finalkey)!;
	}
	return "";
}