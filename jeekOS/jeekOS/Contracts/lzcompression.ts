function lzcompression(data: string) {
	let z = 0;
	let queue = [[], [], []];
	while (queue[1].length <= data.length) {
		queue[1].push([]);
	}
	while (queue[2].length <= data.length) {
		queue[2].push([]);
	}
	for (let i = 0; i <= 9 && i < data.length; i++) {
		queue[1][i].push(i.toString() + data.substring(0, i));
		queue[2][i].push(i.toString() + data.substring(0, i));
	}
	while (queue[1][data.length].length == 0 && queue[2][data.length].length == 0) {
		let i = (new Array(data.length)).fill(0).map((_, i) => i).map(i => [i, queue[1][i].length + queue[2][i].length]).filter(x => x[1] > 0).reduce((a, b) => b)[0];
		if (queue[2][i].length > 0) queue[2][i].map(x => queue[1][i].push(x + "0"));
		if (queue[1][i].length > 0) queue[1][i].map(x => queue[2][i].push(x + "0"));
		queue[1][i] = Array.from(...new Set([queue[1][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[2][i] = Array.from(...new Set([queue[2][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[1][i] = queue[1][i].sort((a, b) => { return a.length - b.length; });
		queue[2][i] = queue[2][i].sort((a, b) => { return a.length - b.length; });
		ns.tprint(i, " ", queue[1][i], " ", queue[2][i]);
		if (queue[1][i].length > 0) {
			for (let current of queue[1][i].splice(0, 10)) {
				for (let l = 0; l <= 10; l++) {
					for (let j = 0; j <= 10; j++) {
						let temp = lzdecompression(current.concat(l.toString()).concat(j.toString()));
						if (temp === data.substring(0, temp.length)) {
							queue[2][temp.length].push(current.concat(l.toString()).concat(j.toString()));
						}
					}
				}
			}
			//			queue[1][i] = [];
		}
		if (queue[2][i].length > 0) {
			for (let current of queue[2][i].splice(0, 10)) {
				for (let j = 0; j <= 10; j++) {
					let temp = lzdecompression(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					if (temp === data.substring(0, temp.length)) {
						queue[1][temp.length].push(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					}
				}
			}
			//			queue[2][i] = [];
		}
	}
	queue[1][data.length] = queue[1][data.length].sort((a, b) => { return a.length - b.length; });
	queue[2][data.length] = queue[2][data.length].sort((a, b) => { return a.length - b.length; });
}
